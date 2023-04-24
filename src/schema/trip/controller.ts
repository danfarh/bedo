/* eslint-disable no-await-in-loop */
/* eslint-disable no-unneeded-ternary */
import { ApolloError } from 'apollo-server-express'
import { Types } from 'mongoose'
import moment from 'moment'
import randomStringGenerator from 'crypto-random-string'
import path from 'path'
import fs from 'fs'
import qs from 'qs'
import mkdirp from 'mkdirp'
import _ from 'lodash'
import axios from 'axios'
import pubsub from '../../utils/pubsub'
import sendEmail from '../../utils/email'
import sendReceiptByEmail from '../auth/controller'
import checkThatUserExists from '../../utils/checkIfUserExists'
import service from './service'
import tripService from './service'
import tripSchema from './schema'
import carService from '../car/service'
import carModel from '../car/schema'
import orderService from '../order/service'
import shopService from '../shop/service'
import driverService from '../driver/service'
import userService from '../user/service'
import paymentService from '../payment/service'
import transactionService from '../transaction/service'
import cancelReservationConstantService from '../cancelReservationConstant/service'
import calculation from '../../utils/calculation'
import driverOrPassengerFilters from '../../utils/driverOrPassengerFilters'
import googleCalculation from '../../utils/calculateTimeAndDistance'
import googleMap from '../../utils/googleMap'
import { Pagination, TripInput } from '../../utils/interfaces'
import passengerCanceledTripController from '../passengerCanceledTrip/controller'
import reqCarTypeService from '../reqCarType/service'
import carTypeService from '../carType/service'
import promotionService from '../tripPromotion/service'
import TripPromotionUsedService from '../tripPromotionUsed/service'
import driverCanceledTripController from '../driverCanceledTrip/controller'
import paymentController from '../payment/controller'
import regionController from '../region/controller'
import tripOrderService from '../tripOrder/service'
import constantService from '../constant/service'
import PassengerCanceledTripService from '../passengerCanceledTrip/service'
import reservedTripsQueue from '../../utils/queues/reservedTripsQueue'
import tripsAcceptTimeoutCheckQueue from '../../utils/queues/tripsAcceptTimeoutCheckQueue'
import reservedTripsNotificationQueue from '../../utils/queues/reservedTripsNotificationQueue'
import stripe from '../../utils/payment/gateways/Stripe'
import errorService from '../errors/service'
import {
  TRIP_CAR_LOCATION,
  FIND_DRIVER,
  ACCEPTED_TRIP,
  TRIP_CHAT,
  UPDATE_TRIP,
  REMOVE_TRIP_FROM_FIND_DRIVER,
  REMOVE_TRIP
} from '../../utils/pubsubKeys'
import {
  APP_ENV,
  PRICE_VARIANCE,
  GOOGLE_API_KEY,
  STATIC_MAP_ORIGIN_MARKER_IMAGE_URL,
  STATIC_MAP_DESTINATION_MARKER_IMAGE_URL
} from '../../config'
import {
  RedisGetKeys,
  getConstantValue,
  RedisGetFromSet,
  RedisSetExpireDate,
  RedisDelete,
  RedisGet,
  RedisPushList,
  RedisSet,
  RedisAddToSetWithExpTime,
  RedisRemoveFromSet,
  updateTripsInRedis
} from '../../utils/redis'
import orderController from '../order/controller'
import {
  createNotificationAndSendToDriver,
  createNotificationAndSendToUser
} from '../../utils/createNotificationAndSend'

export default new (class Controller {
  userTripRoles = {
    driver: 'driver',
    passenger: 'passenger'
  }

  rawConstants: any[] = []

  constants: any = {
    ONLINE_CARS_AROUND_RADIUS: 5
  }

  checkThat(trip: any) {
    // check that trip exists
    // and is related to the given user
    // and also can check relation role
    if (!trip || !trip._id) {
      throw new ApolloError('trip not found', '400')
    }

    const { userTripRoles } = this

    return {
      isRelatedTo(user: any) {
        let role = ''
        if (trip.passenger && trip.passenger.toString() === user.sub) {
          role = userTripRoles.passenger
        } else if (trip.driver && trip.driver.toString() === user.sub) {
          role = userTripRoles.driver
        } else {
          throw new ApolloError('user is not related to the trip', '400')
        }
        return {
          as(expectedRule: String) {
            if (expectedRule !== role) {
              throw new ApolloError(`user is not ${expectedRule} of the trip`, '400')
            }
            return true
          }
        }
      }
    }
  }

  async getRedisKeys() {
    return RedisGetKeys()
  }

  checkThatTripHasAnActiveWaiting(trip) {
    const lastWaitTimeIndex = trip.waitTimesInMinutes.length - 1
    const lastWaitTime = trip.waitTimesInMinutes[lastWaitTimeIndex]
    if (lastWaitTimeIndex == null || !lastWaitTime == null || lastWaitTime.end) {
      throw new ApolloError('the car has not stopped', '400')
    }
    const waitTimeInMinutes = moment().diff(moment(lastWaitTime.start), 'minutes')
    return { lastWaitTimeIndex, waitTimeInMinutes, lastWaitTime }
  }

  checkThatTripDoesNotHaveAnActiveWaiting(trip) {
    const lastWaitTimeIndex = trip.waitTimesInMinutes.length - 1
    const lastWaitTime = trip.waitTimesInMinutes[lastWaitTimeIndex]
    if (lastWaitTime && !lastWaitTime.end) {
      throw new ApolloError('car is stopped already', '400')
    }
  }

  protected async arrayToObject(arr: Array<any>) {
    return new Promise((resolve, reject) => {
      const a: any = []
      arr.forEach(item => {
        const obj = {}
        Object.assign(obj, { id: item[0] })
        Object.assign(obj, { long: item[1][0] })
        Object.assign(obj, { lat: item[1][1] })
        a.push(obj)
      })
      if (arr.length === a.length) resolve(a)
    })
  }

  protected isCorrectPrice(priceFromClient: number, sparkPrice: number) {
    const min = sparkPrice - PRICE_VARIANCE
    const max = sparkPrice + PRICE_VARIANCE
    return priceFromClient >= min && priceFromClient <= max
  }

  protected async calculateTripPrice(tripInput: TripInput, onlyCalculate: Boolean, user: any) {
    // console.log('calculateTripPrice : tripInput., ', tripInput)
    // console.log('calculateTripPrice : tripInput.reqCarType ., ', tripInput.reqCarType)
    let trip: any
    const originAddress = await this.getAddressFromLongLat(tripInput.origin)
    if (onlyCalculate) {
      if (tripInput.promotion) {
        const usedPromotion = await promotionService.findOne({ promotionCode: tripInput.promotion })
        trip = {
          ...tripInput,
          promotion: usedPromotion._id,
          origin: {
            type: 'Point',
            address: originAddress,
            coordinates: [tripInput.origin.long, tripInput.origin.lat]
          },
          destinations: await Promise.all(
            tripInput.destinations.map(async (destination, index) => {
              return {
                type: 'Point',
                address: destination.address || (await this.getAddressFromLongLat(destination)),
                coordinates: [destination.long, destination.lat],
                order: index + 1
              }
            })
          )
        }
      }
      trip = {
        ...tripInput,
        origin: {
          type: 'Point',
          address: originAddress,
          coordinates: [tripInput.origin.long, tripInput.origin.lat]
        },
        destinations: await Promise.all(
          tripInput.destinations.map(async (destination, index) => {
            return {
              type: 'Point',
              address: destination.address || (await this.getAddressFromLongLat(destination)),
              coordinates: [destination.long, destination.lat],
              order: index + 1
            }
          })
        )
      }
      //! create trip object from tripInput
      let allCost: any = await (await calculation.calculatePrice()).calculatePriceByOptions(
        trip,
        user,
        onlyCalculate
      )
      if (tripInput.tipValue) {
        allCost = allCost.map(item => {
          return {
            ...item,
            driverTotalPrice: calculation.convertAmount(
              Number(item.driverTotalPrice) + Number(tripInput.tipValue)
            ),
            cost: calculation.convertAmount(Number(item.cost) + Number(tripInput.tipValue))
          }
        })
      }
      allCost = _.orderBy(allCost, ['cost'], ['asc'])
      return {
        ...trip,
        allCost
      }
    }
    const sentReqCarType = await reqCarTypeService.findOne({ _id: tripInput.reqCarType })
    if (sentReqCarType) {
      trip = {
        ...tripInput,
        origin: {
          type: 'Point',
          address: originAddress,
          coordinates: [tripInput.origin.long, tripInput.origin.lat]
        },
        destinations: await Promise.all(
          tripInput.destinations.map(async (destination, index) => {
            return {
              type: 'Point',
              address: await this.getAddressFromLongLat(destination),
              coordinates: [destination.long, destination.lat],
              order: index + 1
            }
          })
        )
      }
      //! create trip object from tripInput
      let allCost: any = await (await calculation.calculatePrice()).calculatePriceByOptions(
        trip,
        user,
        onlyCalculate
      )
      if (tripInput.tipValue) {
        allCost = allCost.map(item => {
          return {
            ...item,
            driverTotalPrice: calculation.convertAmount(
              Number(item.driverTotalPrice) + Number(tripInput.tipValue)
            ),
            cost: calculation.convertAmount(Number(item.cost) + Number(tripInput.tipValue))
          }
        })
      }
      const index = _.findIndex(
        allCost,
        o =>
          String(o.reqCarType.id) === String(tripInput.reqCarType) &&
          String(o.reqCarType.tripType) === String(tripInput.tripType)
      )
      if (index !== -1) {
        return {
          ...trip,
          allCost,
          cost: allCost[index]
        }
      }
      throw new ApolloError('reqCarType and tripType not match', '400')
    }
    throw new ApolloError('undefined reqCarType', '400')
  }

  protected createStaticImageUrlForGoogle(trip: any) {
    const markers: any[] = []
    const query = {
      maptype: 'roadmap',
      size: '624x348',
      key: GOOGLE_API_KEY,
      style: 'feature:all|element:labels|visibility:off',
      path: 'color:0x000000|weight:3',
      markers
    }
    const destinationMarkerImage = encodeURIComponent(STATIC_MAP_DESTINATION_MARKER_IMAGE_URL)
    const originMarkerImage = encodeURIComponent(STATIC_MAP_ORIGIN_MARKER_IMAGE_URL)
    const addPoint = (point, isOrigin = false) => {
      const long = point[0]
      const lat = point[1]
      let markerImage = destinationMarkerImage
      if (isOrigin) {
        markerImage = originMarkerImage
      }
      const marker: any = `anchor:bottom|icon:${markerImage}|${lat},${long}`
      query.markers.push(marker)
      query.path += `|${lat},${long}`
    }
    addPoint(trip.origin.coordinates, true)
    trip.destinations.forEach((destination: any) => addPoint(destination.coordinates))
    return qs.stringify(query, {
      encode: false,
      indices: false
    })
  }

  protected async downloadStaticMapImage(trip, filePath) {
    if (APP_ENV === 'test') {
      const testStaticMapPath = path.join(__dirname, '../../../public/images/test-staticmap.png')
      fs.copyFileSync(testStaticMapPath, filePath)
      return true
    }

    const address = this.createStaticImageUrlForGoogle(trip)

    // because file is small we get it in one request
    // and not using stream response type
    let response
    try {
      response = await axios({
        method: 'get',
        url: `https://maps.googleapis.com/maps/api/staticmap?${address}`,
        responseType: 'arraybuffer'
      })
    } catch (e) {
      const testStaticMapPath = path.join(__dirname, '../../../public/images/test-staticmap.png')
      fs.copyFileSync(testStaticMapPath, filePath)
      return false
    }

    fs.writeFileSync(filePath, response.data)
    return true
  }

  protected async getStaticMapImagePath(trip): Promise<Object> {
    let relativePath = ''
    let filePath = ''
    if (trip.staticMapImageUrl) {
      if (fs.existsSync(trip.staticMapImageUrl)) {
        fs.unlinkSync(trip.staticMapImageUrl)
      }
    }
    const createdAt = moment(trip.createdAt)
    const randomString = randomStringGenerator({ length: 8 })
    relativePath = `${createdAt.format('YYYY/MM/DD')}`
    const fileName = `${trip._id}_${randomString}.jpg`
    filePath = `/staticMaps/${relativePath}/${fileName}`
    const absolutePath = path.join(__dirname, '../../../', 'public/staticMaps', relativePath)
    if (!fs.existsSync(absolutePath)) {
      await mkdirp(absolutePath)
    }
    const absoluteFilePath = path.join(absolutePath, fileName)
    return { filePath, absoluteFilePath }
  }

  async getStaticMap(trip): Promise<String> {
    // determine file path for saving
    const { filePath, absoluteFilePath }: any = await this.getStaticMapImagePath(trip)
    // download file
    await this.downloadStaticMapImage(trip, absoluteFilePath)
    // return file path for saving in database
    return filePath
  }

  getDistanceBetweenTwoPoint(location1: Array<Number>, location2: Array<Number>) {
    const [lon1, lat1] = location1
    const [lon2, lat2] = location2
    if (lat1 === lat2 && lon1 === lon2) {
      return 0
    }
    const radlat1 = (Math.PI * Number(lat1)) / 180
    const radlat2 = (Math.PI * Number(lat2)) / 180
    const theta = Number(lon1) - Number(lon2)
    const radtheta = (Math.PI * theta) / 180
    let dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta)
    if (dist > 1) {
      dist = 1
    }
    dist = Math.acos(dist)
    dist = (dist * 180) / Math.PI
    dist = dist * 60 * 1.1515
    // convert to km
    dist *= 1.609344
    return dist
  }

  async getCarDistanceFromLocation(car, location: Array<Number>): Promise<Number> {
    const [carLocationArray]: any = await service.getCarLocation(car.carType.toString(), car._id)
    return Number(this.getDistanceBetweenTwoPoint(carLocationArray, location))
  }

  async getDriverDistanceFromDestination(trip, destinationOrder = null, tripCarObject = null) {
    const order = destinationOrder || trip.destinations[trip.destinations.length - 1].order
    const car = tripCarObject || (await carService.findById(trip.car))
    const destination = trip.destinations.find(i => i.order === order)
    if (!destination) {
      throw new ApolloError('destination location not found')
    }
    return this.getCarDistanceFromLocation(car, destination.coordinates)
  }

  async checkDriverLocationForDestination(
    trip,
    destinationOrder = null,
    tripCarObject = null,
    maximumValidDistance = 0.5 // 500 meter
  ) {
    const distance = await this.getDriverDistanceFromDestination(
      trip,
      destinationOrder,
      tripCarObject
    )
    if (distance > maximumValidDistance) {
      throw new ApolloError('driver car is not in destination area')
    }
  }

  async getAddressFromLongLat(location) {
    let res: any
    const locationArray = Array.isArray(location)
      ? Object.values(location)
      : [location.lat, location.long]
    try {
      res = await googleMap
        .reverseGeocode({
          latlng: locationArray.join(',')
        })
        .asPromise()
    } catch (e) {
      return ''
    }

    if (!res || !res.json || !res.json.results || !res.json.results[0]) {
      return ''
    }
    return res.json.results[0].formatted_address
  }

  async getCarsAround(location: any, tripType) {
    const reqCarTypes = await reqCarTypeService.find({})
    const tripTypeReqCarTypes = reqCarTypes.filter(i => i.tripType === tripType)
    const carTypes = tripTypeReqCarTypes.map(i => i.carTypes).flat(2)
    let carsAround: any[] = []
    const onlineCarsAroundRadius = await getConstantValue('ONLINE_CARS_AROUND_RADIUS', 3000)
    carTypes.forEach(carType => {
      carsAround = [...carsAround, service.getCarsAround(location, carType, onlineCarsAroundRadius)]
    })
    carsAround = await Promise.all(carsAround)
    return carsAround
      .filter(i => i.length)
      .flat(1)
      .map(async i => ({
        long: Number(i[1][0]),
        lat: Number(i[1][1]),
        angle: Number(await service.getAngle(String(i[0]))) || 0
      }))
  }

  async setOnlineCar(id: Types.ObjectId, long: number, lat: number, angle: number, language: any) {
    const car: any = await carService.findById(id)
    console.log('setOnlineCar')
    if (!car || !car.carType) {
      const error = await errorService.findOneFromView({ title: 'not found' }, language)
      throw new ApolloError(error.text, '404')
    }
    await service.setAngle(id, angle)
    return service.setOnlineCar(id, long, lat, car.carType)
  }

  async updateTripCarLocation(user: any, tripId: Types.ObjectId, location: any) {
    const trip = await service.findById(tripId)
    this.checkThat(trip)
      .isRelatedTo(user)
      .as(this.userTripRoles.driver)
    pubsub.publish(TRIP_CAR_LOCATION, { tripCarLocation: { ...location, trip } })
    return true
  }

  async setOfflineAllCarSet() {
    const carSet: any[] = await carModel.find()
    carSet.forEach(async car => service.setOfflineCar(car._id, car.carType))
    return true
  }

  async setOfflineCar(driverId: Types.ObjectId) {
    const driver: any = await driverService.findById(driverId)
    if (driver) {
      const car: any = await carService.findById(driver.defaultCar)
      // console.log(' driver.defaultCar: ', driver.defaultCar)
      // console.log(' car.carType: ', car.carType)
      if (!car || !car.carType) throw new ApolloError('default car not found', '404')
      return service.setOfflineCar(driver.defaultCar, car.carType)
    }
    return false
  }

  async endTrip(tripId: Types.ObjectId, user: any) {
    checkThatUserExists(user)
    const driverId = user.userId
    const trip: any = await service.findById(tripId)
    this.checkThat(trip)
    if (user.roles !== 'SUPER_ADMIN') {
      this.checkThat(trip)
        .isRelatedTo(user)
        .as(this.userTripRoles.driver)
      // await this.checkDriverLocationForDestination(trip, null, null, 0.5)
    }
    const now = moment(new Date()).utc()
    const { destinations } = trip
    const lastOrder = destinations.length
    // const endTrip = await service.findOneAndUpdate(
    //   { _id: tripId, driver: driverId },
    //   {
    //     $set: {
    //       state: 'DESTINATION',
    //       baseFare: 0,
    //       ended: true,
    //       passedDestinationOrder: lastOrder,
    //       endDate: now.toISOString()
    //     }
    //   }
    // )
    trip.state = 'DESTINATION'
    trip.baseFare = 0
    trip.ended = true
    trip.passedDestinationOrder = lastOrder
    trip.endDate = now.toISOString()
    const newCals: any = await calculation.calculateTripPriceWithOptions(trip, user)
    const [reqCarTypeTrip] = newCals.filter(
      newCal => newCal.reqCarType.id.toString() === trip.reqCarType.toString()
    )
    trip.cost = calculation.convertAmount(reqCarTypeTrip.cost + trip.tipValue)
    trip.tripDistance = reqCarTypeTrip.tripDistance
    trip.requestFromFarPrice = reqCarTypeTrip.requestFromFarPrice
    trip.distancePrice = reqCarTypeTrip.distancePrice
    trip.optionsPriceDetails = reqCarTypeTrip.optionsPriceDetails
    trip.reqCarTypeDistancePrice = reqCarTypeTrip.reqCarTypeDistancePrice
    trip.reqCarTypeDurationPrice = reqCarTypeTrip.reqCarTypeDurationPrice
    trip.waitTimePrice = reqCarTypeTrip.waitTimePrice
    trip.optionsPrice = reqCarTypeTrip.optionsPrice
    trip.driverTotalPrice = calculation.convertAmount(
      reqCarTypeTrip.driverTotalPrice + trip.tipValue
    )
    trip.staticMapImageUrl = await this.getStaticMap(trip)
    await trip.save()
    await tripOrderService.findOneAndUpdate(
      { trip: trip._id },
      {
        finished: true,
        discount: reqCarTypeTrip.promotionPrice ? Number(reqCarTypeTrip.promotionPrice) : 0,
        commission: reqCarTypeTrip.commissionPrice,
        HST: reqCarTypeTrip.hstPrice
      }
    )
    // const receipt = this.createReceipt(trip._id)
    const driver: any = await driverService.findById(driverId)
    carService.changeIsInTrip(driver.defaultCar, false)
    if (trip.isForShopDelivery) {
      createNotificationAndSendToUser(
        trip.passenger,
        'IMPORTANT',
        'your order delivery has arrived',
        'please collect your order'
      )
      //! change Status Of OrderTo Delivered
      await orderController.changeStatusToDelivered(trip)
    }

    //! Payment of trip
    await paymentController.payForTrip(trip._id)
    // const passenger: any = await userService.findById(trip.passenger)

    // const receipt = await this.createReceipt({ sub: trip.passenger.toString() }, trip._id)
    // await sendReceiptByEmail.sendTripReceiptEmail(
    //   { fullName: passenger.fullName, email: passenger.email },
    //   { ...receipt, tripType: trip.tripType }
    // )
    pubsub.publish(UPDATE_TRIP, {
      updateTrip: trip
    })

    return trip
  }

  async TripPaymentInitSuccessful(tripId, paymentMethod, setupIntentId) {
    console.log(' TripPaymentInitSuccessful =>  tripId => ', tripId)
    const trip: any = await service.findById(tripId)
    if (trip.state === 'SEARCHING') {
      console.log('trip in SEARCHING state ')
      // return true
    }
    trip.setupIntent = setupIntentId
    trip.paymentMethod = paymentMethod
    trip.state = 'SEARCHING'
    await trip.save()
    const reqCarType = await reqCarTypeService.findById(trip.reqCarType)
    let carsAround: Array<any> = await this.aroundCarByReqType(reqCarType.carTypes, {
      radiusCoefficient: trip.radiusCoefficient,
      origin: trip.origin
    })
    carsAround = carsAround.flat(2)
    console.log('carsAround : ', carsAround)
    carsAround = _.uniqBy(carsAround)
    carsAround.forEach(async car => {
      const availableCar: any = await carService.findById(car.id)
      if (!availableCar) return
      // eslint-disable-next-line no-restricted-syntax
      // for (const option of Object.keys(availableCar.carOptions)) {
      //   console.log(option)
      //   if (!availableCar.carOptions[option] && option in trip) {
      //     console.log("1" , availableCar.carOptions[option])
      //     console.log("2" , option in trip)
      //     return
      //   }
      // }
      const tripOptions = {
        inHurry: trip.inHurry.is,
        orderingForSomeoneElse: trip.orderingForSomeoneElse.is,
        pet: trip.pet.hasPet,
        bagsWithMe: trip.bagsWithMe.has,
        reserved: trip.reserved.type,
        airConditioner: trip.airConditioner,
        welcomeSign: trip.welcomeSign,
        driverAssistant: trip.driverAssistant,
        withInfant: trip.withInfant,
        waitTimesInMinutes: trip.staticWaitTime
        // tipValue: trip.tipValue ? true : false
      }
      const keySetOfTripOptionSet = Object.keys(tripOptions)
      keySetOfTripOptionSet.forEach(key => {
        tripOptions[key] =
          tripOptions[key] === undefined || !tripOptions[key] ? false : tripOptions[key]
      })
      if (tripOptions.reserved) {
        if (Number(Object.keys(tripOptions.reserved)) === 0) tripOptions.reserved = false
        else tripOptions.reserved = true
      }
      // eslint-disable-next-line no-restricted-syntax
      for (const key in tripOptions) {
        if (tripOptions[key] === true) {
          if (!availableCar.carOptions[key]) return
        }
      }
      if (availableCar && !availableCar.isInTrip) {
        const findDriver = await driverService.findOne({
          defaultCar: availableCar._id
        })
        if (!findDriver) {
          console.log('driver doesnt exists for car ', availableCar._id)
          // if can't find the driver then its dirty data
          reqCarType.carTypes.forEach(carType => {
            service.setOfflineCar(availableCar._id, carType)
          })
          return
        }
        console.log('request set to driver ', findDriver._id)
        pubsub.publish(FIND_DRIVER, {
          findDriver: { ...trip.toObject(), driverId: findDriver._id }
        })
      }
    })

    // check for ending trip if not accepted in time out
    tripsAcceptTimeoutCheckQueue.add(
      {
        trip
      },
      {
        delay: (await getConstantValue('ACCEPT_TRIP_TIMEOUT_SECONDS', 300)) * 1000
      }
    )
    return true
  }

  async TripPayment(userId, tripId, paymentMethod, setupIntentId) {
    console.log(' TripPaymentInitSuccessful =>  tripId => ', tripId)
    const trip: any = await service.findById(tripId)
    if (trip.state === 'SEARCHING') {
      console.log('trip in SEARCHING state ')
      // return true
    }
    trip.setupIntent = setupIntentId
    trip.paymentMethod = paymentMethod
    trip.state = 'SEARCHING'
    await trip.save()
    const reqCarType = await reqCarTypeService.findById(trip.reqCarType)
    let carsAround: Array<any> = await this.aroundCarByReqType(reqCarType.carTypes, {
      radiusCoefficient: trip.radiusCoefficient,
      origin: trip.origin
    })
    carsAround = carsAround.flat(2)
    console.log('carsAround : ', carsAround)
    carsAround = _.uniqBy(carsAround)
    carsAround.forEach(async car => {
      const availableCar: any = await carService.findById(car.id)
      if (!availableCar) return
      // eslint-disable-next-line no-restricted-syntax
      // for (const option of Object.keys(availableCar.carOptions)) {
      //   console.log(option)
      //   if (!availableCar.carOptions[option] && option in trip) {
      //     console.log("1" , availableCar.carOptions[option])
      //     console.log("2" , option in trip)
      //     return
      //   }
      // }
      const tripOptions = {
        inHurry: trip.inHurry.is,
        orderingForSomeoneElse: trip.orderingForSomeoneElse.is,
        pet: trip.pet.hasPet,
        bagsWithMe: trip.bagsWithMe.has,
        reserved: trip.reserved.type,
        airConditioner: trip.airConditioner,
        welcomeSign: trip.welcomeSign,
        driverAssistant: trip.driverAssistant,
        withInfant: trip.withInfant,
        waitTimesInMinutes: trip.staticWaitTime
        // tipValue: trip.tipValue ? true : false
      }
      const keySetOfTripOptionSet = Object.keys(tripOptions)
      keySetOfTripOptionSet.forEach(key => {
        tripOptions[key] =
          tripOptions[key] === undefined || !tripOptions[key] ? false : tripOptions[key]
      })
      if (tripOptions.reserved) {
        if (Number(Object.keys(tripOptions.reserved)) === 0) tripOptions.reserved = false
        else tripOptions.reserved = true
      }
      // eslint-disable-next-line no-restricted-syntax
      for (const key in tripOptions) {
        if (tripOptions[key] === true) {
          if (!availableCar.carOptions[key]) return
        }
      }
      if (availableCar && !availableCar.isInTrip) {
        const findDriver = await driverService.findOne({
          defaultCar: availableCar._id
        })
        if (!findDriver) {
          console.log('driver doesnt exists for car ', availableCar._id)
          // if can't find the driver then its dirty data
          reqCarType.carTypes.forEach(carType => {
            service.setOfflineCar(availableCar._id, carType)
          })
          return
        }
        console.log('request set to driver ', findDriver._id)
        pubsub.publish(FIND_DRIVER, {
          findDriver: { ...trip.toObject(), driverId: findDriver._id }
        })
      }
    })

    // check for ending trip if not accepted in time out
    tripsAcceptTimeoutCheckQueue.add(
      {
        trip
      },
      {
        delay: (await getConstantValue('ACCEPT_TRIP_TIMEOUT_SECONDS', 300)) * 1000
      }
    )

    return true
  }

  async aroundCarByReqType(carTypes: Array<any>, tripInput: any, double = false) {
    let radiusCoefficient = Number(tripInput.radiusCoefficient) || 1
    if (double) {
      radiusCoefficient *= 2
    }
    return Promise.all(
      carTypes.map(async _id => {
        // eslint-disable-next-line prefer-destructuring
        let origin = tripInput.origin
        if (origin && origin.coordinates) {
          origin = {
            long: origin.coordinates[0],
            lat: origin.coordinates[1]
          }
        }
        const driversAround: any = await service.getCarsAround(
          origin,
          _id, // carType
          (await getConstantValue('FIND_DRIVER_RADIUS', 500000)) * radiusCoefficient
        )
        const item: any = await this.arrayToObject(driversAround)
        // console.log('car', item)
        return item
      })
    )
  }

  async getDriverDistanceAndSuccessfulTripByShopAdmin(user: any, driverId: Types.ObjectId) {
    const driverFound: any = await driverService.findById(driverId)
    if (!driverFound) {
      throw new ApolloError('driver not found', '404')
    }
    if (String(driverFound.shop) !== String(user.shop)) {
      throw new ApolloError('The driver does not belong to this shop', '400')
    }
    let distance = 0
    const tripfound: any = await tripService.find({ driver: driverId })
    for (let i = 0; i < tripfound.length; i++) {
      distance += tripfound[i].distancePriceDetails[0].distance
    }

    const successfulSubmissions = await tripService.count({
      driver: driverId,
      state: 'DESTINATION'
    })

    return { successfulSubmissions, distance }
  }

  async createTrip(
    tripInput: TripInput,
    onlyCalculate: boolean,
    user: any,
    language?: any,
    doNotCheckPermission = false
  ) {
    let error: any = {}
    if (
      !doNotCheckPermission &&
      tripInput.isForShopDelivery &&
      !tripInput.trackId &&
      (await this.haveCurrentTrip(tripInput.passenger))
    ) {
      error = await errorService.findOneFromView({ title: 'you cant create trip' }, language)
      throw new ApolloError(error.text)
    }

    // validate radius coefficient
    const maxRadiusCoefficient = await getConstantValue('MAX_RADIUS_COEFFICIENT', 3)
    if (tripInput.radiusCoefficient > maxRadiusCoefficient) {
      throw new ApolloError(
        `radius coefficient should not be more than ${maxRadiusCoefficient}`,
        '400'
      )
    }
    if (!onlyCalculate) {
      await regionController.checkTripIsInRegions(tripInput)
    }
    if (tripInput.reserved && tripInput.reserved.type) {
      const reserveDate = moment(tripInput.reserved.date)
      if (reserveDate.isBefore()) {
        error = await errorService.findOneFromView(
          { title: 'please enter a valid date from today or later for reserved date' },
          language
        )
        throw new ApolloError(error.text, '400')
      }
    }

    const calTrip: any = await this.calculateTripPrice(tripInput, onlyCalculate, user)
    if (onlyCalculate) return calTrip
    //! finish  pending trips
    await service.updateMany(
      { passenger: user.userId, state: 'PENDING' },
      { state: 'FINISHED_DUE_TO_NOT_PAYING', ended: true }
    )
    // if (!this.isCorrectPrice(tripInput.priceFromClient, calTrip.cost.cost))
    //   throw new ApolloError('price is not true please try again')
    delete calTrip.allCost
    const costDetails = calTrip.cost
    if (calTrip.promotion) {
      const promotion = await promotionService.findOne({ promotionCode: calTrip.promotion })
      if (promotion) {
        calTrip.promotion = promotion._id
      }
    }
    calTrip.cost = calTrip.cost.cost
    calTrip.distancePrice = costDetails.distancePrice
    calTrip.tripDistance = costDetails.tripDistance
    calTrip.driverTotalPrice = costDetails.driverTotalPrice
    calTrip.distancePriceDetails = costDetails.distancePriceDetails
    calTrip.optionsPriceDetails = costDetails.optionsPriceDetails
    calTrip.reqCarTypeDistancePrice = costDetails.reqCarTypeDistancePrice
    calTrip.reqCarTypeDurationPrice = costDetails.reqCarTypeDurationPrice
    calTrip.waitTimePrice = costDetails.waitTimePrice
    calTrip.optionsPrice = costDetails.optionsPrice
    calTrip.baseFare = costDetails.baseFare
    calTrip.bookingFee = costDetails.bookingFee
    calTrip.reqCarType = tripInput.reqCarType
    calTrip.requestFromFarPrice = costDetails.requestFromFarPrice
    calTrip.state = tripInput.isForShopDelivery ? 'SEARCHING' : 'PENDING'
    // create a custom object id for trip ( for saving static image )
    calTrip._id = Types.ObjectId()
    // create image url
    calTrip.staticMapImageUrl = await this.getStaticMap(calTrip)
    if (calTrip.tripType === 'RIDE' && calTrip.parcelDestinations) {
      error = await errorService.findOneFromView({ title: 'this trip type is ride' }, language)
      throw new ApolloError(error.text, '400')
    } else if (calTrip.tripType === 'DELIVERY' && !calTrip.parcelDestinations) {
      error = await errorService.findOneFromView(
        { title: 'delivery parcel destinations does not exists' },
        language
      )
      throw new ApolloError(error.text, '400')
    }

    //! if any pending trip, finish it
    await service.findOneAndUpdate(
      { user: user.sub, status: 'PENDING' },
      { status: 'FINISHED_DUE_TO_NOT_PAYING', finished: true }
    )

    const trip: any = await service.save(calTrip)
    const acceptTripTimeout = await getConstantValue('ACCEPT_TRIP_TIMEOUT_SECONDS', 300)
    await RedisAddToSetWithExpTime('tripForOfflineDrivers', trip._id, Number(acceptTripTimeout))
    const tripOrderData = {
      user: trip.passenger,
      trip: trip._id,
      payment: null,
      promotion: trip.promotion || null,
      discount: trip.promotion ? costDetails.promotionPrice : 0,
      commission: costDetails.commissionPrice,
      commissionPercent: costDetails.commissionPercent,
      HST: costDetails.hstPrice,
      HSTPercent: costDetails.hstPercent,
      paidAt: null,
      finished: false,
      commented: 'NOT_COMMENTED'
    }
    await tripOrderService.create(tripOrderData)
    if (trip.isLookingForLongerDistance) {
      const [lastUserTrip] = await service.find({ passenger: user.userId }, { limit: 1, skip: 1 })
      const setupIntent = await stripe.updateSetupIntent(lastUserTrip.setupIntent, {
        tripId: String(trip._id)
      })
      trip.state = 'SEARCHING'
      console.log('setupIntent in isLookingForLongerDistance', setupIntent)
      trip.setupIntent = setupIntent.id
      trip.paymentMethod = setupIntent.payment_method
      await trip.save()
    }
    if (trip.isForShopDelivery || trip.isLookingForLongerDistance) {
      const reqCarType = await reqCarTypeService.findById(tripInput.reqCarType)
      let carsAround: Array<any> = await this.aroundCarByReqType(reqCarType.carTypes, tripInput)
      carsAround = carsAround.flat(2)
      carsAround = _.uniqBy(carsAround)
      carsAround.forEach(async car => {
        const availableCar: any = await carService.findById(car.id)
        // eslint-disable-next-line no-restricted-syntax
        // for (const option of Object.keys(availableCar.carOptions)) {
        //   if (!availableCar.carOptions[option] && option in tripInput) {
        //     return
        //   }
        // }
        const tripOptions = {
          inHurry: trip.inHurry.is,
          orderingForSomeoneElse: trip.orderingForSomeoneElse.is,
          pet: trip.pet.hasPet,
          bagsWithMe: trip.bagsWithMe.has,
          reserved: trip.reserved.type,
          airConditioner: trip.airConditioner,
          welcomeSign: trip.welcomeSign,
          driverAssistant: trip.driverAssistant,
          withInfant: trip.withInfant,
          waitTimesInMinutes: trip.staticWaitTime
          // tipValue: trip.tipValue ? true : false
        }
        const keySetOfTripOptionSet = Object.keys(tripOptions)
        keySetOfTripOptionSet.forEach(key => {
          tripOptions[key] =
            tripOptions[key] === undefined || !tripOptions[key] ? false : tripOptions[key]
        })
        if (tripOptions.reserved) {
          if (Number(Object.keys(tripOptions.reserved)) === 0) tripOptions.reserved = false
          else tripOptions.reserved = true
        }
        // eslint-disable-next-line no-restricted-syntax
        for (const key in tripOptions) {
          if (tripOptions[key] === true) {
            if (!availableCar.carOptions[key]) return
          }
        }
        if (availableCar && !availableCar.isInTrip) {
          const findDriver = await driverService.findOne({
            defaultCar: availableCar._id
          })
          if (!findDriver) {
            console.log('driver doesnt exists for car ', availableCar._id)
            // if can't find the driver then its dirty data
            reqCarType.carTypes.forEach(carType => {
              service.setOfflineCar(availableCar._id, carType)
            })
            return
          }
          pubsub.publish(FIND_DRIVER, {
            findDriver: { ...trip.toObject(), driverId: findDriver._id }
          })
        }
      })
      // check for ending trip if not accepted in time out
      tripsAcceptTimeoutCheckQueue.add(
        {
          trip
        },
        {
          delay: (await getConstantValue('ACCEPT_TRIP_TIMEOUT_SECONDS', 300)) * 1000
        }
      )
    }
    // payment
    this.TripPayment(user.sub, trip._id, 'CASH', null)
    return trip
  }

  async haveCurrentTrip(userId: Types.ObjectId): Promise<any> {
    return service.haveCurrentTrip(userId)
  }

  async driverHaveCurrentTrip(driverId: Types.ObjectId | String) {
    return service.driverHaveCurrentTrip(driverId)
  }

  async addHoldTime(tripId: Types.ObjectId, driver: any, waitTimes: Object) {
    const trip = await service.findOne({ _id: tripId })
    this.checkThat(trip)
      .isRelatedTo(driver)
      .as(this.userTripRoles.driver)
    const tripOrder = await tripOrderService.findOne({ trip: tripId })
    trip.waitTimesInMinutes.push(waitTimes)
    const {
      totalAddedPrice,
      totalAddedPriceForDriver,
      addedPriceCommission,
      addedPriceHST,
      addedWaitTimesPrice
    } = await (
      await (await calculation.calculatePrice()).updatePriceByNewOptions(tripId)
    ).addHoldTime([waitTimes], trip.passenger)
    trip.cost = calculation.convertAmount(Number(totalAddedPrice))
    trip.waitTimePrice = calculation.convertAmount(
      Number(trip.waitTimePrice) + Number(addedWaitTimesPrice)
    )
    trip.driverTotalPrice =
      calculation.convertAmount(Number(totalAddedPriceForDriver)) + Number(trip.driverTotalPrice)

    tripOrder.commission = calculation.convertAmount(
      Number(tripOrder.commission) + Number(addedPriceCommission)
    )
    tripOrder.HST = calculation.convertAmount(Number(tripOrder.HST) + Number(addedPriceHST))
    await trip.save()
    await tripOrder.save()

    pubsub.publish(UPDATE_TRIP, {
      updateTrip: trip
    })

    return trip
  }

  async cancelTripByPassenger(
    passenger: any,
    tripId: Types.ObjectId,
    reasonId: Types.ObjectId | null,
    reason: String | null,
    carCoordinate: any | null,
    language
  ) {
    let error: any = {}
    let canceledTrip: any
    const trip: any = await service.findTripById(tripId)
    this.checkThat(trip)
      .isRelatedTo(passenger)
      .as(this.userTripRoles.passenger)
    const { state, passedDestinationOrder } = trip
    const now = moment(new Date()).utc()
    if (
      state === 'ACCEPTED' ||
      state === 'COMING' ||
      state === 'ARRIVED' ||
      state === 'PICKED_UP' ||
      state === 'WAITING' ||
      state === 'RESERVED'
    ) {
      const driver: any = await driverService.findById(trip.driver)
      carService.changeIsInTrip(driver.defaultCar, false)
    }
    if (
      state === 'PENDING' ||
      state === 'SEARCHING' ||
      state === 'ACCEPTED' ||
      state === 'COMING' ||
      state === 'ARRIVED'
    ) {
      passengerCanceledTripController.cancelTrip(passenger, tripId, reasonId, reason)
      canceledTrip = await service.findOneAndUpdate(
        { _id: tripId },
        { state: 'PASSENGER_CANCELED', ended: true, endDate: now.toISOString() }
      )
      pubsub.publish(UPDATE_TRIP, {
        updateTrip: canceledTrip
      })
      pubsub.publish(REMOVE_TRIP, { removeTrip: trip._id })
      return canceledTrip
    }
    if (state === 'WAITING' || state === 'RESERVED') {
      passengerCanceledTripController.cancelTrip(passenger, tripId, reasonId, reason)
      canceledTrip = await service.findOneAndUpdate(
        { _id: tripId },
        { state: 'PASSENGER_CANCELED_DURING_TRIP', ended: true, endDate: now.toISOString() }
      )
    } else if (state === 'DRIVER_CANCELED') {
      error = await errorService.findOneFromView(
        { title: 'trip canceled by driver first' },
        language
      )
      throw new ApolloError(error.text, '403')
    } else if (state === 'PICKED_UP') {
      if (carCoordinate) {
        const newDestinations: Array<any> = trip.destinations
        const newDistancePriceDetails: Array<any> = trip.distancePriceDetails
        const tripPassedDestinationOrder = passedDestinationOrder || 0
        const removedDistancePrice = _.sum(
          newDistancePriceDetails.map(item => {
            if (item.order > tripPassedDestinationOrder) {
              return Number(item.price)
            }
            return 0
          })
        )
        const removedDistance = _.sum(
          newDistancePriceDetails.map(item => {
            if (item.order > tripPassedDestinationOrder) {
              return Number(item.distance)
            }
            return 0
          })
        )
        const removedDuration = _.sum(
          newDistancePriceDetails.map(item => {
            if (item.order > tripPassedDestinationOrder) {
              return Number(item.duration)
            }
            return 0
          })
        )
        const HST = await constantService.findOne({ attribute: 'TRIP_HST' })
        const COMMISSION = await constantService.findOne({ attribute: 'TRIP_COMMISSION' })
        _.remove(newDestinations, o => o.order > tripPassedDestinationOrder)
        _.remove(newDistancePriceDetails, o => o.order > tripPassedDestinationOrder)
        const newOrder = newDestinations.length + 1
        await service.findOneAndUpdate(
          { _id: tripId },
          { destinations: newDestinations, distancePriceDetails: newDistancePriceDetails }
        )
        const {
          totalPrice,
          tripDistance,
          addedReqCarTypePriceForDistance,
          addedReqCarTypePriceForTime,
          addedPriceCommission,
          addedPriceHST,
          usedReqCarType,
          addedTripDistancePrice,
          distancePriceDetails
        } = await (
          await (await calculation.calculatePrice()).updatePriceByNewOptions(tripId)
        ).addNewDestination(
          [
            {
              type: 'Point',
              coordinates: [carCoordinate.long, carCoordinate.lat],
              order: newOrder
            }
          ],
          passenger
        )
        const currentTrip = await service.findOne({ _id: tripId })
        const tripOrder = await tripOrderService.findOne({ trip: tripId })
        // const tripPromotionId = currentTrip.promotion
        // const tripPromotion = await promotionService.findById(tripPromotionId)
        // currentTrip._doc.promotion = tripPromotion.promotionCode
        newDestinations.push({
          type: 'Point',
          address: await this.getAddressFromLongLat(carCoordinate),
          coordinates: [carCoordinate.long, carCoordinate.lat],
          order: newOrder
        })
        const { waitTimesInMinutes } = currentTrip
        delete currentTrip._doc.waitTimesInMinutes
        const newCals: any = await calculation.calculateTripPriceWithOptions(
          { ...currentTrip._doc, destinations: newDestinations },
          passenger
        )
        const [reqCarTypeTrip] = newCals.filter(
          newCal => newCal.reqCarType.id.toString() == currentTrip.reqCarType.toString()
        )
        // console.log(JSON.stringify(reqCarTypeTrip))
        const {
          reqCarTypeDurationPrice,
          reqCarTypeDistancePrice,
          optionsPriceDetails,
          optionsPrice,
          waitTimePrice
        } = reqCarTypeTrip
        // const reqCarTypeDistancePrice = calculation.convertAmount(
        //   Number(currentTrip.reqCarTypeDistancePrice) +
        //     Number(addedReqCarTypePriceForDistance) -
        //     calculation.convertAmount(
        //       Number(removedDistance) * Number(usedReqCarType.DistanceBasePricePerKM)
        //     )
        // )
        // const reqCarTypeDurationPrice = calculation.convertAmount(
        //   Number(currentTrip.reqCarTypeDurationPrice) +
        //     Number(addedReqCarTypePriceForTime) -
        //     Number(removedDuration) * Number(usedReqCarType.PerMinute)
        // )
        const subTotal = calculation.convertAmount(
          Number(currentTrip.bookingFee) +
            Number(currentTrip.baseFare) +
            waitTimePrice +
            reqCarTypeDistancePrice +
            reqCarTypeDurationPrice +
            optionsPrice
        )

        let promotionPrice = 0
        if (currentTrip.promotion) {
          const promotion = await promotionService.findById(currentTrip.promotion)
          if (promotion.type === 'FIXED') {
            promotionPrice = promotion.maximumPromotion
          }
          if (promotion.type === 'PERCENT') {
            const { maximumPromotion, percent } = promotion
            promotionPrice =
              maximumPromotion < subTotal * (percent / 100)
                ? maximumPromotion
                : subTotal * (percent / 100)
          }
        }

        promotionPrice =
          promotionPrice > subTotal ? subTotal : calculation.convertAmount(promotionPrice)
        const subTotalWithPromotion = calculation.convertAmount(subTotal - promotionPrice)
        const hstPrice = calculation.convertAmount((subTotalWithPromotion * HST.value) / 100)
        canceledTrip = await service.findOneAndUpdate(
          { _id: tripId },
          {
            state: 'PASSENGER_CANCELED_DURING_TRIP',
            ended: true,
            passedDestinationOrder: newOrder,
            destinations: newDestinations,
            optionsPriceDetails,
            optionsPrice,
            waitTimesInMinutes,
            distancePriceDetails: [
              ...newDistancePriceDetails,
              {
                order: newDistancePriceDetails.length + 1,
                distance: calculation.convertAmount(
                  addedTripDistancePrice / usedReqCarType.DistanceBasePricePerKM
                ),
                duration: calculation.convertAmount(
                  addedReqCarTypePriceForTime / usedReqCarType.PerMinute
                ),
                price: calculation.convertAmount(addedTripDistancePrice)
              }
            ],
            endDate: now.toISOString(),
            distancePrice: reqCarTypeDistancePrice,
            reqCarTypeDistancePrice,
            reqCarTypeDurationPrice,
            driverTotalPrice: calculation.convertAmount(
              subTotal * (1 - COMMISSION.value / 100) + currentTrip.tipValue
            ),
            tripDistance: Number(
              calculation.convertAmount(Number(tripDistance) - Number(removedDistance))
            ),
            cost: calculation.convertAmount(subTotalWithPromotion + hstPrice + currentTrip.tipValue)
          }
        )
        tripOrder.HST = hstPrice
        tripOrder.discount = promotionPrice
        tripOrder.commission = (subTotal * COMMISSION.value) / 100

        tripOrder.finished = true

        await tripOrder.save()
      } else {
        error = await errorService.findOneFromView({ title: 'send car coordinates' }, language)
        throw new ApolloError(error.text, '400')
      }
    } else if (state === 'DESTINATION') {
      error = await errorService.findOneFromView(
        { title: 'trip is over you can not cancel trip' },
        language
      )
      throw new ApolloError(error.text, '403')
    } else if (state === 'PASSENGER_CANCELED') {
      error = await errorService.findOneFromView({ title: 'trip already canceled' }, language)
      throw new ApolloError(error.text, '403')
    }

    if (canceledTrip.shopOrder) {
      await orderController.rejectOrder(
        passenger,
        canceledTrip.shopOrder,
        'canceledByShopAdmin',
        false
      )
    }

    pubsub.publish(UPDATE_TRIP, {
      updateTrip: canceledTrip
    })
    //! Payment
    // paymentController.payForTrip(canceledTrip._id)

    return canceledTrip
  }

  async countCancelTripByDriver(driver: any): Promise<any> {
    const count: any = await service.count({
      state: 'DRIVER_CANCELED',
      driver: driver.userId
    })
    return count
  }

  async cancelTripByDriver(
    driver: any,
    tripId: Types.ObjectId,
    reasonId: Types.ObjectId,
    language: any
  ) {
    let error: any = {}
    let canceledTrip: any
    const trip: any = await service.findTripById(tripId)
    this.checkThat(trip)
      .isRelatedTo(driver)
      .as(this.userTripRoles.driver)
    const { state } = trip
    const now = moment(new Date()).utc()
    if (
      state === 'ACCEPTED' ||
      state === 'COMING' ||
      state === 'ARRIVED' ||
      state === 'WAITING' ||
      state === 'RESERVED'
    ) {
      driverCanceledTripController.cancelTrip(driver.userId, tripId, reasonId)
      canceledTrip = await service.findOneAndUpdate(
        { _id: tripId },
        { state: 'DRIVER_CANCELED', ended: true, endDate: now.toISOString() }
      )
    } else if (state === 'PASSENGER_CANCELED') {
      error = await errorService.findOneFromView(
        { title: 'trip canceled by passenger first' },
        language
      )
      throw new ApolloError(error.text, '403')
    } else {
      error = await errorService.findOneFromView({ title: 'you cant cancel this trip' }, language)
      throw new ApolloError(error.text, '403')
    }
    const driverDetails: any = await driverService.findById(trip.driver)
    carService.changeIsInTrip(driverDetails.defaultCar, false)

    // count cancel trip by driver
    const count: any = this.countCancelTripByDriver(driver)
    const countCancelTripConstant: any = await getConstantValue('COUNT_CANCEL_TRIP_BY_DRIVER', 5)
    if (count % countCancelTripConstant == 0) {
      driverDetails.state = 'SUSPENDED'
      await driverDetails.save()
    }

    if (canceledTrip.shopOrder) {
      await orderController.changeStatusToNotAccepted(canceledTrip.shopOrder)
    }

    await createNotificationAndSendToUser(
      trip.passenger,
      'IMPORTANT',
      'Trip Cancellation',
      'Your Trip has been canceled by driver.'
    )
    pubsub.publish(UPDATE_TRIP, {
      updateTrip: canceledTrip
    })

    return canceledTrip
  }

  async acceptTripByDriver(driverId: Types.ObjectId, tripId: Types.ObjectId, language: any) {
    // check trip
    let error: any = {}
    const trip = await service.findById(tripId)
    if (trip.state === 'PASSENGER_CANCELED') {
      error = await errorService.findOneFromView({ title: 'Trip is canceled by user.' }, language)
      throw new ApolloError(error.text, '400')
    }
    if (!trip || trip.driver) {
      error = await errorService.findOneFromView(
        { title: 'Trip is already accepted by another driver.' },
        language
      )
      throw new ApolloError(error.text, '400')
    }

    if (trip.ended) {
      error = await errorService.findOneFromView({ title: 'You accepted too late.' }, language)
      throw new ApolloError(error.text)
    }
    // change car status
    const driver: any = await driverService.findById(driverId)

    if (!driver) {
      error = await errorService.findOneFromView({ title: 'driver not found' }, language)
      throw new ApolloError(error.text, '400')
    }
    let reserveDate
    if (trip.reserved && trip.reserved.type) {
      reserveDate = moment(trip.reserved.date)
      if (reserveDate.isBefore()) {
        error = await errorService.findOneFromView(
          { title: 'please enter a valid date from today or later for reserved date' },
          language
        )
        throw new ApolloError(error.text, '400')
      }
    }

    // TODO -> check that driver has enough time for picking this trip
    const now = moment(new Date()).utc()
    trip.startDate = now.toISOString()
    await trip.save()
    // change trip state and accept
    const finalTrip = await service.addDriverToTrip(
      tripId,
      driver._id,
      driver.defaultCar,
      trip.reserved && trip.reserved.type
    )
    await TripPromotionUsedService.create({
      promotion: trip.promotion,
      user: trip.passenger,
      usedFor: trip._id
    })

    const car: any = await carService.findById(driver.defaultCar)

    if (!car) {
      error = await errorService.findOneFromView({ title: 'driver car not found' }, language)
      throw new ApolloError(error.text)
    }

    const reqCarType = await reqCarTypeService.findOne({
      tripType: trip.tripType,
      carTypes: car.carType
    })
    let carsAround: Array<any> = await this.aroundCarByReqType(reqCarType.carTypes, trip, true)
    carsAround = carsAround.flat(2)
    carsAround.forEach(async aroundCar => {
      if (!aroundCar || aroundCar.id === driver.defaultCar.toString()) {
        return
      }
      const availableCar: any = await carService.findById(aroundCar.id)
      if (availableCar && !availableCar.isInTrip) {
        const findDriver = await driverService.findOne({
          defaultCar: availableCar._id
        })

        if (!findDriver || findDriver._id.toString() === driver._id.toString()) {
          return
        }
        pubsub.publish(REMOVE_TRIP_FROM_FIND_DRIVER, {
          removeTripFromFindDriver: { ...trip.toObject(), driverId: findDriver._id }
        })
      }
    })

    pubsub.publish(ACCEPTED_TRIP, {
      acceptedTrip: { driver, trip: finalTrip }
    })

    if (!trip.reserved || !trip.reserved.date || !trip.reserved.type) {
      await carService.changeIsInTrip(driver.defaultCar, true)

      // publish start pubsub
      await RedisRemoveFromSet('tripForOfflineDrivers', trip._id)
      pubsub.publish(UPDATE_TRIP, {
        updateTrip: finalTrip
      })
      return finalTrip
    }

    const delay = reserveDate.utc().diff(moment(), 'milliseconds')
    const notificationDelay = Number(Number(delay) - Number(1800000))
    if (notificationDelay > 0 && !finalTrip.isForShopDelivery) {
      reservedTripsNotificationQueue.add(
        {
          trip: finalTrip.toObject()
        },
        {
          delay: notificationDelay
        }
      )
    }
    reservedTripsQueue.add(
      {
        trip: finalTrip.toObject(),
        driver: driver.toObject()
      },
      {
        delay
      }
    )
    return finalTrip
  }

  async getTripForOfflineDrivers({ userId: driverId }, language) {
    const error = await errorService.findOneFromView(
      { title: 'there is no trip for you.' },
      language
    )
    await updateTripsInRedis('tripForOfflineDrivers')
    const records = await RedisGetFromSet('tripForOfflineDrivers')
    if (records.length) {
      const sendingData = await this.calculateTripForOfflineDrivers(driverId)
      _.remove(sendingData, o => o === null)
      if (Number(sendingData.length) === 0) {
        throw new ApolloError(error.text, '204')
      }
      return sendingData
    }
    throw new ApolloError(error.text, '204')
  }

  async calculateTripForOfflineDrivers(driverId) {
    await updateTripsInRedis('tripForOfflineDrivers')
    const records = await RedisGetFromSet('tripForOfflineDrivers')
    const sendingData = await Promise.all(
      records.map(async item => {
        const trip = await tripService.findOne({ _id: item })
        if (trip.state !== 'SEARCHING' || trip.ended) return null
        const tripOptions = {
          inHurry: trip.inHurry.is,
          orderingForSomeoneElse: trip.orderingForSomeoneElse.is,
          pet: trip.pet.hasPet,
          bagsWithMe: trip.bagsWithMe.has,
          reserved: trip.reserved.type,
          airConditioner: trip.airConditioner,
          welcomeSign: trip.welcomeSign,
          driverAssistant: trip.driverAssistant,
          withInfant: trip.withInfant,
          waitTimesInMinutes: trip.staticWaitTime
          // tipValue: trip.tipValue ? true : false
        }
        const keySetOfTripOptionSet = Object.keys(tripOptions)
        keySetOfTripOptionSet.forEach(key => {
          tripOptions[key] =
            tripOptions[key] === undefined || !tripOptions[key] ? false : tripOptions[key]
        })
        const driver = await driverService.findOne({ _id: driverId })
        const car = await carService.findOne({ _id: driver.defaultCar })
        function isCarSupportTripOption(tripOptions, carOptions) {
          if (tripOptions.reserved) {
            if (Number(Object.keys(tripOptions.reserved)) === 0) tripOptions.reserved = false
            else tripOptions.reserved = true
          }
          // eslint-disable-next-line no-restricted-syntax
          for (const key in tripOptions) {
            if (tripOptions[key] === true) {
              if (!carOptions[key]) return false
            }
          }
          return true
        }
        function isCarTypeSupportReqCarType(carTypes, driverCarType) {
          for (let index = 0; index < carTypes.length; index++) {
            if (String(carTypes[index]) === String(driverCarType)) return true
          }
          return false
        }
        const { carTypes } = await reqCarTypeService.findById(trip.reqCarType)
        if (
          isCarTypeSupportReqCarType(carTypes, car.carType) &&
          !car.isInTrip &&
          isCarSupportTripOption(tripOptions, car.carOptions)
        ) {
          const radiusCoefficient = Number(trip.radiusCoefficient) || 1
          let { origin } = trip
          if (origin && origin.coordinates) {
            origin = {
              long: origin.coordinates[0],
              lat: origin.coordinates[1]
            }
          }
          const result = await Promise.all(
            carTypes.map(async carType => {
              const driversAround: any = await service.getCarsAround(
                origin,
                carType, // carType
                (await getConstantValue('FIND_DRIVER_RADIUS', 500000)) * radiusCoefficient
              )
              const index = _.findIndex(driversAround, o => {
                return String(o[0]) === String(car._id)
              })
              if (index !== -1) return trip
              return null
            })
          )
          // eslint-disable-next-line no-plusplus
          for (let index = 0; index < result.length; index++) {
            if (result[index]) return result[index]
          }
        }
        return null
      })
    )
    return sendingData
  }

  async addNewDestination(tripId: Types.ObjectId, newDestination: any, user: any, language: any) {
    let error: any = {}
    const trip = await service.findById(tripId)
    this.checkThat(trip)
      .isRelatedTo(user)
      .as(this.userTripRoles.passenger)

    await regionController.checkLocationIsInRegions(newDestination)
    const tripOrder = await tripOrderService.findOne({ trip: tripId })
    if (trip.tripType === 'RIDE') {
      const order = trip.destinations.length + 1
      const newDestinationAddress = await this.getAddressFromLongLat(newDestination)
      trip.destinations.push({
        type: 'Point',
        address: newDestinationAddress,
        coordinates: [newDestination.long, newDestination.lat],
        order
      })
      // console.log({})
      const newPrice = await (
        await (await calculation.calculatePrice()).updatePriceByNewOptions(tripId)
      ).addNewDestination(
        [
          {
            type: 'Point',
            address: newDestinationAddress,
            coordinates: [newDestination.long, newDestination.lat],
            order
          }
        ],
        user
      )

      trip.distancePriceDetails.push({
        order,
        distance: calculation.convertAmount(Number(newPrice.distancePriceDetails[0].distance)),
        duration: calculation.convertAmount(Number(newPrice.distancePriceDetails[0].duration)),
        price: calculation.convertAmount(Number(newPrice.addedReqCarTypePriceForDistance))
      })
      delete trip._doc.waitTimesInMinutes
      const newCals: any = await calculation.calculateTripPriceWithOptions(trip, user)
      const [reqCarTypeTrip] = newCals.filter(
        newCal => newCal.reqCarType.id.toString() === trip.reqCarType.toString()
      )

      trip.cost = calculation.convertAmount(reqCarTypeTrip.cost + trip.tipValue)
      trip.tripDistance = reqCarTypeTrip.tripDistance
      trip.requestFromFarPrice = reqCarTypeTrip.requestFromFarPrice
      trip.distancePrice = reqCarTypeTrip.distancePrice
      trip.optionsPriceDetails = reqCarTypeTrip.optionsPriceDetails
      trip.reqCarTypeDistancePrice = reqCarTypeTrip.reqCarTypeDistancePrice
      trip.reqCarTypeDurationPrice = reqCarTypeTrip.reqCarTypeDurationPrice
      trip.waitTimePrice = reqCarTypeTrip.waitTimePrice
      trip.optionsPrice = reqCarTypeTrip.optionsPrice
      trip.driverTotalPrice = calculation.convertAmount(
        reqCarTypeTrip.driverTotalPrice + trip.tipValue
      )
      trip.staticMapImageUrl = await this.getStaticMap(trip)
      tripOrder.commission = reqCarTypeTrip.commissionPrice
      tripOrder.discount = reqCarTypeTrip.promotionPrice ? Number(reqCarTypeTrip.promotionPrice) : 0
      tripOrder.HST = reqCarTypeTrip.hstPrice
      await trip.save()
      await tripOrder.save()

      pubsub.publish(UPDATE_TRIP, {
        updateTrip: trip
      })

      return trip.toObject()
    }
    error = await errorService.findOneFromView({ title: 'type of trip is Delivery' }, language)
    throw new ApolloError(error.text, '403')
  }

  async changeDropOffLocation(
    tripId: Types.ObjectId,
    order: number,
    receiverInfo: any,
    newDestination: any,
    orderingForSomeoneElse: any,
    user: any,
    language: any
  ) {
    let error: any = {}
    let passedDestination: number = 0
    const trip = await service.findById(tripId)
    this.checkThat(trip)
      .isRelatedTo(user)
      .as(this.userTripRoles.passenger)
    if (trip.tripType !== 'DELIVERY') {
      error = await errorService.findOneFromView(
        { title: 'this trip not a delivery trip' },
        language
      )
      throw new ApolloError(error.text, '400')
    }
    await regionController.checkLocationIsInRegions(newDestination)
    const tripOrder = await tripOrderService.findOne({ trip: tripId })
    const {
      _id,
      destinations,
      parcelDestinations,
      passedDestinationOrder,
      distancePriceDetails
    } = trip
    const isNextOrderAvailable = order !== destinations.length
    const DestinationOrderIndex = _.findIndex(destinations, o => o.order === order)
    const ParcelDestinationOrderIndex = _.findIndex(parcelDestinations, o => o.order === order)
    const DistancePriceDetailesOrderIndex = _.findIndex(
      distancePriceDetails,
      o => o.order === order
    )
    if (parcelDestinations[ParcelDestinationOrderIndex].delivered) {
      error = await errorService.findOneFromView(
        { title: 'this parcel has been delivered before' },
        language
      )
      throw new ApolloError(error.text, '400')
    }
    if (passedDestinationOrder) {
      passedDestination = passedDestinationOrder
    }
    const newDestinationAddress = await this.getAddressFromLongLat(newDestination)
    destinations[DestinationOrderIndex].order = -1
    distancePriceDetails[DistancePriceDetailesOrderIndex].order = -1
    destinations.push({
      type: 'Point',
      address: newDestinationAddress,
      coordinates: [newDestination.long, newDestination.lat],
      order
    })
    let cost: any = null
    const oldDestination =
      DestinationOrderIndex === 0
        ? trip.origin.coordinates
        : destinations[DestinationOrderIndex - 1].coordinates
    if (isNextOrderAvailable) {
      cost = await (
        await (await calculation.calculatePrice()).updatePriceByNewOptions(tripId)
      ).changeDropOffLocation(
        [
          {
            coordinates: [newDestination.long, newDestination.lat]
          }
        ],
        {
          coordinates: oldDestination
        },
        user,
        isNextOrderAvailable,
        order
      )
    } else {
      cost = (
        await (await calculation.calculatePrice()).updatePriceByNewOptions(_id)
      ).changeDropOffLocation(
        [
          {
            coordinates: [newDestination.long, newDestination.lat]
          }
        ],
        {
          coordinates: oldDestination
        },
        user,
        isNextOrderAvailable,
        order
      )
    }
    parcelDestinations[ParcelDestinationOrderIndex].receiverInfo = receiverInfo
    parcelDestinations[ParcelDestinationOrderIndex].orderingForSomeoneElse = orderingForSomeoneElse
    // trip.cost = calculation.convertAmount(Number((await cost).newCost))
    // trip.distancePrice = calculation.convertAmount(
    //   Number(cost.distancePrice) + Number(trip.distancePrice)
    // )
    // trip.driverTotalPrice = calculation.convertAmount(
    //   Number(cost.totalAddedPriceForDriver) + Number(trip.driverTotalPrice)
    // )
    let orderedNewCostDetails: any
    if (isNextOrderAvailable) {
      distancePriceDetails.splice(DistancePriceDetailesOrderIndex + 1, 1)
      orderedNewCostDetails = (await cost).newCostDetails
      // .map((item, index) => {
      //   if (index === 0) {
      //     return {
      //       ...item
      //     }
      //   }
      //   return {
      //     ...item,
      //     order: item.order + 1
      //   }
      // })
    } else {
      orderedNewCostDetails = (await cost).newCostDetails
      orderedNewCostDetails[0].order = order
    }
    trip.distancePriceDetails = _.orderBy(
      [...distancePriceDetails, ...orderedNewCostDetails],
      ['order'],
      ['asc']
    )
    trip.destinations = _.orderBy(trip.destinations, ['order'], ['asc'])
    trip.tripDistance = _.sumBy(trip.distancePriceDetails, o => {
      if (o.order > 0) return Number(o.distance)
      return 0
    })
    // trip.tripDistance = calculation.convertAmount(
    //   Number(cost.tripDistance) + Number(trip.tripDistance)
    // )
    // trip.reqCarTypeDistancePrice = calculation.convertAmount(
    //   Number(trip.reqCarTypeDistancePrice) + Number(cost.addedReqCarTypePriceForDistance)
    // )
    // trip.reqCarTypeDurationPrice = calculation.convertAmount(
    //   Number(trip.reqCarTypeDurationPrice) + Number(cost.addedReqCarTypePriceForTime)
    // )
    // // trip.reqCarTypePrice = calculation.convertAmount(
    // //   Number(cost.reqCarTypeAddedPrice) + Number(trip.reqCarTypePrice)
    // // )
    // trip.staticMapImageUrl = await this.getStaticMap(trip)
    // tripOrder.HST = calculation.convertAmount(Number(cost.addedPriceHST) + Number(tripOrder.HST))
    // tripOrder.commission = calculation.convertAmount(
    //   Number(cost.addedPriceCommission) + Number(tripOrder.commission)
    // )
    delete trip._doc.waitTimesInMinutes
    const removedDestinations = trip.destinations.filter(item => item.order === -1)
    const availableDestinations = trip.destinations.filter(item => item.order !== -1)
    trip.destinations = availableDestinations
    const newCals: any = await calculation.calculateTripPriceWithOptions(trip, user)
    const [reqCarTypeTrip] = newCals.filter(
      newCal => newCal.reqCarType.id.toString() === trip.reqCarType.toString()
    )
    trip.destinations = [...removedDestinations, ...availableDestinations]
    trip.cost = calculation.convertAmount(reqCarTypeTrip.cost + trip.tipValue)
    trip.tripDistance = reqCarTypeTrip.tripDistance
    trip.requestFromFarPrice = reqCarTypeTrip.requestFromFarPrice
    trip.distancePrice = reqCarTypeTrip.distancePrice
    trip.optionsPriceDetails = reqCarTypeTrip.optionsPriceDetails
    trip.reqCarTypeDistancePrice = reqCarTypeTrip.reqCarTypeDistancePrice
    trip.reqCarTypeDurationPrice = reqCarTypeTrip.reqCarTypeDurationPrice
    trip.waitTimePrice = reqCarTypeTrip.waitTimePrice
    trip.optionsPrice = reqCarTypeTrip.optionsPrice
    trip.driverTotalPrice = calculation.convertAmount(
      reqCarTypeTrip.driverTotalPrice + trip.tipValue
    )
    trip.staticMapImageUrl = await this.getStaticMap(trip)
    tripOrder.discount = reqCarTypeTrip.promotionPrice ? Number(reqCarTypeTrip.promotionPrice) : 0
    tripOrder.commission = reqCarTypeTrip.commissionPrice
    tripOrder.HST = reqCarTypeTrip.hstPrice
    await trip.save()
    await tripOrder.save()
    pubsub.publish(UPDATE_TRIP, {
      updateTrip: trip
    })
    return trip
    // return trip.toObject()

    // console.log('cost', await cost)
    // parcelDestinations[ParcelDestinationOrderIndex].receiverInfo = receiverInfo
    // parcelDestinations[ParcelDestinationOrderIndex].orderingForSomeoneElse = orderingForSomeoneElse
    // destinations[DestinationOrderIndex].coordinates = [newDestination.long, newDestination.lat]
    // destinations[DestinationOrderIndex].address = newDestinationAddress
    // trip.cost = (await cost).newCost
    // trip.driverTotalPrice = calculation.convertAmount(
    //   Number((await cost).totalAddedPriceForDriver) + Number(trip.driverTotalPrice)
    // )
    // distancePriceDetails.splice(DistancePriceDetailesOrderIndex, 1)
    // const [newCostDetails] = (await cost).newCostDetails
    // trip.distancePriceDetails = [
    //   ...distancePriceDetails,
    //   { ...newCostDetails, order: distancePriceDetails.length + 1 }
    // ]
    // trip.tripDistance = calculation.convertAmount(
    //   Number((await cost).tripDistance) + Number(trip.tripDistance)
    // )
    // trip.distancePrice = calculation.convertAmount(
    //   Number((await cost).distancePrice) + Number(trip.distancePrice)
    // )
    // trip.reqCarTypeDistancePrice = calculation.convertAmount(
    //   Number(trip.reqCarTypeDistancePrice) + Number((await cost).addedReqCarTypePriceForDistance)
    // )
    // trip.reqCarTypeDurationPrice = calculation.convertAmount(
    //   Number(trip.reqCarTypeDurationPrice) + Number((await cost).addedReqCarTypePriceForTime)
    // )
    // // trip.reqCarTypePrice = calculation.convertAmount(
    // //   Number((await cost).reqCarTypeAddedPrice) + Number(trip.reqCarTypePrice)
    // // )
    // trip.staticMapImageUrl = await this.getStaticMap(trip)
    // tripOrder.HST = calculation.convertAmount(
    //   Number((await cost).addedPriceHST) + Number(tripOrder.HST)
    // )
    // tripOrder.commission = calculation.convertAmount(
    //   Number((await cost).addedPriceCommission) + Number(tripOrder.commission)
    // )
    // await trip.save()
    // await tripOrder.save()
    // pubsub.publish(UPDATE_TRIP, {
    //   updateTrip: trip
    // })

    // return trip
  }

  async returnTo(tripId: Types.ObjectId, order: number, user: any, language: any) {
    let error: any = {}
    const trip = await service.findById(tripId)
    this.checkThat(trip)
      .isRelatedTo(user)
      .as(this.userTripRoles.passenger)
    const tripOrder = await tripOrderService.findOne({ trip: tripId })
    let newDestination
    if (order === 0) {
      newDestination = trip.origin
    } else {
      const index = _.findIndex(trip.destinations, o => o.order === order)
      if (index === -1) {
        error = await errorService.findOneFromView(
          { title: 'destiantion with this order not found' },
          language
        )
        throw new ApolloError(error.text, '400')
      }
      newDestination = trip.destinations[index]
    }
    const newOrder = trip.destinations.length + 1

    const newDestinationAddress =
      newDestination.address ||
      (await this.getAddressFromLongLat({
        long: newDestination.coordinates[0],
        lat: newDestination.coordinates[1]
      }))
    trip.destinations.push({
      ...newDestination.toObject(),
      address: newDestinationAddress,
      order: newOrder
    })
    const newPrice = await (
      await (await calculation.calculatePrice()).updatePriceByNewOptions(tripId)
    ).addNewDestination(
      [
        {
          type: 'Point',
          address: newDestinationAddress,
          coordinates: [newDestination.coordinates[0], newDestination.coordinates[1]],
          order
        }
      ],
      user
    )
    // console.log(JSON.stringify(newPrice))
    trip.distancePriceDetails.push({
      order: newOrder,
      distance: calculation.convertAmount(Number(newPrice.distancePriceDetails[0].distance)),
      duration: calculation.convertAmount(Number(newPrice.distancePriceDetails[0].duration)),
      price: calculation.convertAmount(Number(newPrice.addedReqCarTypePriceForDistance))
    })
    // trip.tripDistance = newPrice.tripDistance
    // trip.distancePrice = calculation.convertAmount(
    //   Number(trip.distancePrice) + Number(newPrice.addedPrice)
    // )
    // trip.cost = calculation.convertAmount(Number(newPrice.totalPrice))
    // trip.driverTotalPrice = calculation.convertAmount(
    //   Number(newPrice.totalAddedPriceForDriver) + Number(trip.driverTotalPrice)
    // )
    // trip.reqCarTypeDistancePrice = calculation.convertAmount(
    //   Number(trip.reqCarTypeDistancePrice) + Number(newPrice.addedReqCarTypePriceForDistance)
    // )
    // trip.reqCarTypeDurationPrice = calculation.convertAmount(
    //   Number(trip.reqCarTypeDurationPrice) + Number(newPrice.addedReqCarTypePriceForTime)
    // )
    // // trip.reqCarTypePrice = calculation.convertAmount(
    // //   Number(newPrice.reqCarTypeAddedPrice) + Number(trip.reqCarTypePrice)
    // // )
    delete trip._doc.waitTimesInMinutes
    const newCals: any = await calculation.calculateTripPriceWithOptions(trip, user)
    const [reqCarTypeTrip] = newCals.filter(
      newCal => newCal.reqCarType.id.toString() === trip.reqCarType.toString()
    )
    console.log(JSON.stringify(reqCarTypeTrip))
    trip.cost = calculation.convertAmount(reqCarTypeTrip.cost + trip.tipValue)
    trip.tripDistance = reqCarTypeTrip.tripDistance
    trip.requestFromFarPrice = reqCarTypeTrip.requestFromFarPrice
    trip.distancePrice = reqCarTypeTrip.distancePrice
    trip.optionsPriceDetails = reqCarTypeTrip.optionsPriceDetails
    trip.reqCarTypeDistancePrice = reqCarTypeTrip.reqCarTypeDistancePrice
    trip.reqCarTypeDurationPrice = reqCarTypeTrip.reqCarTypeDurationPrice
    trip.waitTimePrice = reqCarTypeTrip.waitTimePrice
    trip.optionsPrice = reqCarTypeTrip.optionsPrice
    trip.driverTotalPrice = calculation.convertAmount(
      reqCarTypeTrip.driverTotalPrice + trip.tipValue
    )
    trip.staticMapImageUrl = await this.getStaticMap(trip)
    tripOrder.discount = reqCarTypeTrip.promotionPrice ? Number(reqCarTypeTrip.promotionPrice) : 0
    tripOrder.commission = reqCarTypeTrip.commissionPrice
    tripOrder.HST = reqCarTypeTrip.hstPrice
    await trip.save()
    await tripOrder.save()

    pubsub.publish(UPDATE_TRIP, {
      updateTrip: trip
    })

    return trip.toObject()
  }

  async carArrivedAtStartingPoint(tripId: String | Types.ObjectId, user: any, language: any) {
    let error: any = {}
    // get trip
    const trip = await service.findById(tripId)
    // check that user is valid for this
    this.checkThat(trip)
      .isRelatedTo(user)
      .as(this.userTripRoles.driver)

    // check that is in the right state
    if (!['COMING', 'ACCEPTED'].includes(trip.state)) {
      error = await errorService.findOneFromView({ title: 'state not match' }, language)
      throw new ApolloError(error.text, '400')
    }
    // check that trip already don't have waiting for pickup wait time
    const waitForPickup =
      trip.tripType === 'DELIVERY'
        ? 'DELIVERY_PICK_UP_PACKAGE_HOLD_TIME'
        : 'AT_THE_ORIGIN_UNTIL_PICK_UP_THE_PASSENGER'

    // update trip
    const result = await service.findOneAndUpdate(tripId, {
      state: 'ARRIVED',
      $push: {
        waitTimesInMinutes: {
          title: waitForPickup,
          start: moment(new Date())
            .utc()
            .toISOString(),
          end: null
        }
      }
    })

    pubsub.publish(UPDATE_TRIP, {
      updateTrip: result
    })

    return result
  }

  async startTrip(tripId: String | Types.ObjectId, user: any, language: any) {
    let error: any = {}
    // get trip
    const trip = await service.findById(tripId)

    // check that user is valid for this
    this.checkThat(trip)
      .isRelatedTo(user)
      .as(this.userTripRoles.driver)

    const { tripType, waitTimesInMinutes, state } = trip
    // check that is in the right state
    if (state !== 'ARRIVED') {
      error = await errorService.findOneFromView({ title: 'state not match' }, language)
      throw new ApolloError(error.text, '400')
    }

    let index = -1
    if (tripType === 'DELIVERY') {
      index = _.findIndex(waitTimesInMinutes, o => o.title === 'DELIVERY_PICK_UP_PACKAGE_HOLD_TIME')
    } else if (tripType === 'RIDE') {
      index = _.findIndex(
        waitTimesInMinutes,
        o => o.title === 'AT_THE_ORIGIN_UNTIL_PICK_UP_THE_PASSENGER'
      )
    }

    // if difference is not more that 5 minutes
    // or title of last waiting is not pick up
    const result = await service.findOneAndUpdate(tripId, {
      state: 'PICKED_UP',
      [`waitTimesInMinutes.${index}.end`]: moment(new Date())
        .utc()
        .toISOString()
    })

    if (result.shopOrder) {
      await orderController.changeStatusToShipping(result.shopOrder)
    }

    pubsub.publish(UPDATE_TRIP, {
      updateTrip: result
    })

    return result
  }

  // async carStopped(tripId: String | Types.ObjectId, user: any) {
  //   checkThatUserExists(user)

  //   // get trip
  //   const trip = await service.findById(tripId)

  //   // check that user is valid for this
  //   this.checkThat(trip)
  //     .isRelatedTo(user)
  //     .as('passenger')

  //   // check that is in the right state
  //   if (!['PICKED_UP', 'COMING'].includes(trip.state)) {
  //     throw new ApolloError('car is stopped already', '400')
  //   }

  //   this.checkThatTripDoesNotHaveAnActiveWaiting(trip)

  //   // update trip
  //   return service.findOneAndUpdate(tripId, {
  //     state: 'WAITING',
  //     $push: {
  //       waitTimesInMinutes: {
  //         title: 'DURING_RIDE_HOLD_TIME',
  //         start: new Date(),
  //         end: null
  //       }
  //     }
  //   })
  // }

  async carArrivedAtDestination(
    tripId: Types.ObjectId,
    destinationOrder: Number,
    user: any,
    language: any
  ) {
    let error: any = {}
    const trip = await service.findById(tripId)

    this.checkThat(trip)
      .isRelatedTo(user)
      .as(this.userTripRoles.driver)
    const { destinations } = trip
    if (!['PICKED_UP', 'COMING'].includes(trip.state)) {
      error = await errorService.findOneFromView({ title: 'the car has moved already' }, language)
      throw new ApolloError(error.text, '400')
    }
    const maxOrder = Math.max(...destinations.map(destination => destination.order))
    if (trip.tripType === 'RIDE') {
      if (Number(maxOrder) === Number(destinationOrder)) {
        return this.endTrip(tripId, user)
      }
      if (Number(maxOrder) < Number(destinationOrder)) {
        error = await errorService.findOneFromView({ title: 'incorrect order' }, language)
        throw new ApolloError(error.text, '400')
      }
    }
    const result = await service.findOneAndUpdate(tripId, {
      passedDestinationOrder: destinationOrder
    })

    pubsub.publish(UPDATE_TRIP, {
      updateTrip: result
    })

    return result
  }

  async forceEndTripTest(tripId: Types.ObjectId) {
    // const trip: any = await service.findById(tripId)
    // if (!trip || trip.driver != driverId || trip.state == 'DESTINATION')
    // throw new ApolloError(' you cant end this trip')
    const now = moment(new Date()).utc()
    const endTrip = await service.findOneAndUpdate(
      { _id: tripId },
      {
        $set: {
          state: 'DESTINATION',
          endDate: now.toISOString()
        }
      }
    )
    const driver: any = await driverService.findById(endTrip.driver)
    carService.changeIsInTrip(driver.defaultCar, false)
    return endTrip
  }

  async getTrip(_id: Types.ObjectId, user) {
    let { roles }: any = user
    roles = roles.toLowerCase()
    if (roles === 'user') {
      roles = 'passenger'
    }
    return service.findOne({ _id, [roles]: user.userId })
  }

  async getTrips(user, filters, pagination, sort) {
    let { roles }: any = user
    roles = roles.toLowerCase()
    if (roles === 'user') {
      roles = 'passenger'
    }
    return service.find(
      { ...filters, [roles]: user.userId },
      pagination,
      sort ? { ...sort } : { createdAt: -1 }
    )
  }

  async getTripsByAdmin(filters: any = {}, pagination: Pagination, sort: Object) {
    filters = await driverOrPassengerFilters(filters)
    if ('inHurry' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['inHurry.is'] = filters.inHurry
      // eslint-disable-next-line no-param-reassign
      filters = _.omit(filters, 'inHurry')
    }
    if ('orderingForSomeoneElse' in filters) {
      // eslint-disable-next-line no-param-reassign,no-param-reassign
      filters['orderingForSomeoneElse.is'] = filters.orderingForSomeoneElse
      // eslint-disable-next-line no-param-reassign
      filters = _.omit(filters, 'orderingForSomeoneElse')
    }
    if ('bagsWithMe' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['bagsWithMe.has'] = filters.bagsWithMe
      // eslint-disable-next-line no-param-reassign
      filters = _.omit(filters, 'bagsWithMe')
    }
    if ('reserved' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['reserved.type'] = filters.reserved
      // eslint-disable-next-line no-param-reassign
      filters = _.omit(filters, 'reserved')
    }
    if ('pet' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['pet.hasPet'] = filters.pet.hasPet
      // eslint-disable-next-line no-param-reassign
      filters['pet.hasCarrier'] = filters.pet.hasCarrier
      // eslint-disable-next-line no-param-reassign
      filters = _.omit(filters, 'pet')
    }
    if ('createdAt' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.createdAt = {
        $gte: moment(new Date(filters.createdAt))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.createdAt))
          .utc()
          .endOf('date')
          .toDate()
      }
    }
    if ('updatedAt' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.updatedAt = {
        $gte: moment(new Date(filters.updatedAt))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.updatedAt))
          .utc()
          .endOf('date')
          .toDate()
      }
    }

    if ('startDate' in filters && 'startDateFrom' in filters) {
      filters.startDate = {
        $gte: moment(new Date(filters.startDateFrom))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.startDate))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.startDateFrom
    } else if ('startDateFrom' in filters) {
      filters.startDate = {
        $gte: moment(new Date(filters.startDateFrom))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.startDateFrom
    } else if ('startDate' in filters) {
      filters.startDate = {
        $lte: moment(new Date(filters.startDate))
          .utc()
          .startOf('date')
          .toDate()
      }
    }

    if ('endDate' in filters && 'endDateFrom' in filters) {
      filters.endDate = {
        $gte: moment(new Date(filters.endDateFrom))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.endDate))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.endDateFrom
    } else if ('endDateFrom' in filters) {
      filters.endDate = {
        $gte: moment(new Date(filters.endDateFrom))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.endDateFrom
    } else if ('endDate' in filters) {
      filters.endDate = {
        $lte: moment(new Date(filters.endDate))
          .utc()
          .startOf('date')
          .toDate()
      }
    }
    if ('cost' in filters && 'costFrom' in filters) {
      filters.cost = {
        $gte: filters.costFrom,
        $lte: filters.cost
      }
      delete filters.costFrom
    } else if ('costFrom' in filters) {
      filters.cost = {
        $gte: filters.costFrom
      }
      delete filters.costFrom
    } else if ('cost' in filters) {
      filters.cost = {
        $lte: filters.cost
      }
    }

    if (filters.state) {
      // eslint-disable-next-line no-param-reassign
      filters.state = { $eq: filters.state, $nin: ['FINISHED_DUE_TO_NOT_PAYING'] }
    }

    if (!filters.state) {
      // eslint-disable-next-line no-param-reassign
      filters.state = { $nin: ['FINISHED_DUE_TO_NOT_PAYING'] }
    }
    return service.find(filters, pagination, sort)
  }

  async getTripsByAdminCount(filters: any = {}) {
    filters = await driverOrPassengerFilters(filters)
    if ('inHurry' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['inHurry.is'] = filters.inHurry
      // eslint-disable-next-line no-param-reassign
      filters = _.omit(filters, 'inHurry')
    }
    if ('orderingForSomeoneElse' in filters) {
      // eslint-disable-next-line no-param-reassign,no-param-reassign
      filters['orderingForSomeoneElse.is'] = filters.orderingForSomeoneElse
      // eslint-disable-next-line no-param-reassign
      filters = _.omit(filters, 'orderingForSomeoneElse')
    }
    if ('bagsWithMe' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['bagsWithMe.has'] = filters.bagsWithMe
      // eslint-disable-next-line no-param-reassign
      filters = _.omit(filters, 'bagsWithMe')
    }
    if ('reserved' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['reserved.type'] = filters.reserved
      // eslint-disable-next-line no-param-reassign
      filters = _.omit(filters, 'reserved')
    }
    if ('pet' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['pet.hasPet'] = filters.pet.hasPet
      // eslint-disable-next-line no-param-reassign
      filters['pet.hasCarrier'] = filters.pet.hasCarrier
      // eslint-disable-next-line no-param-reassign
      filters = _.omit(filters, 'pet')
    }

    if ('startDate' in filters && 'startDateFrom' in filters) {
      filters.startDate = {
        $gte: moment(new Date(filters.startDateFrom))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.startDate))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.startDateFrom
    } else if ('startDateFrom' in filters) {
      filters.startDate = {
        $gte: moment(new Date(filters.startDateFrom))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.startDateFrom
    } else if ('startDate' in filters) {
      filters.startDate = {
        $lte: moment(new Date(filters.startDate))
          .utc()
          .startOf('date')
          .toDate()
      }
    }

    if ('endDate' in filters && 'endDateFrom' in filters) {
      filters.endDate = {
        $gte: moment(new Date(filters.endDateFrom))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.endDate))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.endDateFrom
    } else if ('endDateFrom' in filters) {
      filters.endDate = {
        $gte: moment(new Date(filters.endDateFrom))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.endDateFrom
    } else if ('endDate' in filters) {
      filters.endDate = {
        $lte: moment(new Date(filters.endDate))
          .utc()
          .startOf('date')
          .toDate()
      }
    }
    if ('cost' in filters && 'costFrom' in filters) {
      filters.cost = {
        $gte: filters.costFrom,
        $lte: filters.cost
      }
      delete filters.costFrom
    } else if ('costFrom' in filters) {
      filters.cost = {
        $gte: filters.costFrom
      }
      delete filters.costFrom
    } else if ('cost' in filters) {
      filters.cost = {
        $lte: filters.cost
      }
    }
    if ('createdAt' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.createdAt = {
        $gte: moment(new Date(filters.createdAt))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.createdAt))
          .utc()
          .endOf('date')
          .toDate()
      }
    }
    if ('updatedAt' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.updatedAt = {
        $gte: moment(new Date(filters.updatedAt))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.updatedAt))
          .utc()
          .endOf('date')
          .toDate()
      }
    }

    if (filters.state) {
      // eslint-disable-next-line no-param-reassign
      filters.state = { $eq: filters.state, $nin: ['FINISHED_DUE_TO_NOT_PAYING'] }
    }

    if (!filters.state) {
      // eslint-disable-next-line no-param-reassign
      filters.state = { $nin: ['FINISHED_DUE_TO_NOT_PAYING'] }
    }

    return service.count(filters)
  }

  async changeStateOfTripByAdmin(id, newState) {
    return service.findOneAndUpdate(id, {
      state: newState
    })
  }

  async sendMessage(
    senderId: Types.ObjectId,
    receiverId: Types.ObjectId,
    tripId: Types.ObjectId,
    message: String,
    language: any
  ) {
    let error: any = {}
    const trip = await service.findOne({
      _id: tripId,
      driver: { $in: [receiverId, senderId] },
      passenger: { $in: [receiverId, senderId] }
    })
    if (!trip) {
      error = await errorService.findOneFromView({ title: 'trip does not exists' }, language)
      throw new ApolloError(error.text, '400')
    }
    if (trip.ended) {
      error = await errorService.findOneFromView({ title: 'trip has been finished' }, language)
      throw new ApolloError(error.text, '400')
    }
    pubsub.publish(TRIP_CHAT, {
      trip,
      tripChat: {
        message,
        senderId,
        receiverId
      }
    })
    return 'message send'
  }

  async createReceipt(user, tripId: Types.ObjectId, language: any) {
    let error: any = {}
    const trip = await service.findById(tripId)
    if (user.roles !== 'SUPER_ADMIN') {
      this.checkThat(trip)
        .isRelatedTo(user)
        .as(this.userTripRoles.passenger)
    }
    if (!trip) {
      error = await errorService.findOneFromView({ title: 'trip does not exists' }, language)
      throw new ApolloError(error.text, '400')
    }
    const tripOrder = await tripOrderService.findOne({ trip: tripId })
    const receipt = {
      BaseFare:
        trip.state === 'PASSENGER_CANCELED_DURING_TRIP' || trip.state === 'DRIVER_CANCELED'
          ? calculation.convertAmount(Number(trip.baseFare))
          : 0,
      Distance: calculation.convertAmount(Number(trip.distancePrice)),
      WaitTimes: calculation.convertAmount(Number(trip.waitTimePrice)),
      BookingFee: trip.bookingFee,
      CarTypeDistancePrice: calculation.convertAmount(Number(trip.reqCarTypeDistancePrice)),
      CarTypeDurationPrice: calculation.convertAmount(Number(trip.reqCarTypeDurationPrice)),
      CarType: calculation.convertAmount(
        Number(trip.reqCarTypeDistancePrice) + Number(trip.reqCarTypeDurationPrice)
      ),
      MoreOption: calculation.convertAmount(Number(trip.optionsPrice)),
      Promotion:
        trip.promotion && tripOrder ? calculation.convertAmount(Number(tripOrder.discount)) : 0,
      RequestFromFarPrice: trip.requestFromFarPrice,
      SubTotal: calculation.convertAmount(
        (trip.state === 'PASSENGER_CANCELED_DURING_TRIP'
          ? calculation.convertAmount(Number(trip.baseFare))
          : 0) +
          Number(trip.waitTimePrice) +
          Number(trip.optionsPrice) +
          Number(trip.reqCarTypeDistancePrice) +
          Number(trip.reqCarTypeDurationPrice) +
          Number(trip.bookingFee) -
          Number(tripOrder && tripOrder.discount ? tripOrder.discount : 0)
      ),
      HST: calculation.convertAmount(Number(tripOrder.HST)),
      Total: calculation.convertAmount(Number(trip.cost))
    }
    return receipt
  }

  async createReceiptForDriver(user, tripId: Types.ObjectId, language: any) {
    const trip = await service.findById(tripId)
    if (user.roles !== 'SUPER_ADMIN') {
      this.checkThat(trip)
        .isRelatedTo(user)
        .as(this.userTripRoles.driver)
    }
    if (!trip) {
      const error = await errorService.findOneFromView({ title: 'trip does not exists' }, language)
      throw new ApolloError(error.text, '400')
    }
    const holdTimes = _.sum(
      trip.waitTimesInMinutes.map(item => {
        const time = (new Date(item.end).getTime() - new Date(item.start).getTime()) / 60000
        if (
          item.title === 'AT_THE_ORIGIN_UNTIL_PICK_UP_THE_PASSENGER' ||
          item.title === 'DELIVERY_PICK_UP_PACKAGE_HOLD_TIME'
        ) {
          if (time > 5) return time
          return 0
        }
        return time
      })
    )
    const staticWaitTime = trip.staticWaitTime ? trip.staticWaitTime : 0
    const receipt = {
      driverTotalPrice: calculation.convertAmount(Number(trip.driverTotalPrice)),
      tripDistance: calculation.convertAmount(trip.tripDistance),
      holdTimesInMinutes:
        holdTimes > staticWaitTime
          ? calculation.convertAmount(Number(holdTimes))
          : calculation.convertAmount(staticWaitTime),
      tripTimeInMinutes: Math.ceil(
        (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 60000
      )
    }
    return receipt
  }

  async enterSignature(
    tripId: Types.ObjectId,
    deliveryOrder: number,
    signatures: Array<string>,
    user: any,
    language: any
  ) {
    let error: any = {}
    const trip = await service.findById(tripId)
    this.checkThat(trip)
      .isRelatedTo(user)
      .as(this.userTripRoles.driver)

    if (trip.tripType === 'DELIVERY') {
      const { parcelDestinations } = trip
      if (parcelDestinations.length !== 0) {
        const orderIndex = _.findIndex(parcelDestinations, o => o.order === deliveryOrder)
        if (orderIndex !== -1) {
          const parcelDestination = parcelDestinations[orderIndex]
          parcelDestination.signaturePhoto = signatures.map(url => {
            return {
              url
            }
          })
          await trip.save()

          pubsub.publish(UPDATE_TRIP, {
            updateTrip: trip
          })

          return trip
        }
        error = await errorService.findOneFromView({ title: 'invalid order' }, language)
        throw new ApolloError(error.text, '400')
      }
      error = await errorService.findOneFromView({ title: 'destinations is empty' }, language)
      throw new ApolloError(error.text, '404')
    }
    error = await errorService.findOneFromView({ title: 'kind of trip is not delivery' }, language)
    throw new ApolloError(error.text, '400')
  }

  async parcelDelivered(tripId: Types.ObjectId, deliveryOrder: number, user: any, language: any) {
    let error: any = {}
    const trip = await service.findById(tripId)
    this.checkThat(trip)
      .isRelatedTo(user)
      .as(this.userTripRoles.driver)

    if (trip.tripType === 'DELIVERY') {
      const { parcelDestinations } = trip
      if (parcelDestinations.length !== 0) {
        const orderIndex = _.findIndex(parcelDestinations, o => o.order === deliveryOrder)
        if (orderIndex !== -1) {
          const parcelDestination = parcelDestinations[orderIndex]
          parcelDestination.delivered = true

          await trip.save()

          pubsub.publish(UPDATE_TRIP, {
            updateTrip: trip
          })
          const maxOrder = Math.max(...parcelDestinations.map(destination => destination.order))
          if (Number(maxOrder) === Number(deliveryOrder)) {
            return this.endTrip(tripId, user)
          }
          return trip
        }
        error = await errorService.findOneFromView({ title: 'invalid order' }, language)
        throw new ApolloError(error.text, '400')
      }
      error = await errorService.findOneFromView({ title: 'destinations is empty' }, language)
      throw new ApolloError(error.text, '404')
    }
    error = await errorService.findOneFromView({ title: 'kind of trip is not delivery' }, language)
    throw new ApolloError(error.text, '400')
  }

  async getDriverReservedTrips(driver: any, pagination: any, sort: any) {
    return service.find({ driver: driver.userId, state: 'RESERVED' }, pagination, sort)
  }

  async getUserReservedTrips(user: any, pagination: any, sort: any) {
    return service.find({ passenger: user.userId, state: 'RESERVED' }, pagination, sort)
  }

  async sendCancelTripReservationEmailAndNotification(receiverId, to, reservationDate) {
    const title = 'Scheduled trip'
    if (to === 'DRIVER') {
      const driver: any = await driverService.findById(receiverId)
      const body = `Your scheduled trip at ${moment(reservationDate)
        .tz('America/Toronto')
        .format('D MMM hh:mm z')} has been canceled by passenger.`
      sendEmail(driver.email, title, body)
      await createNotificationAndSendToDriver(receiverId, 'IMPORTANT', title, body)
    }
    if (to === 'PASSENGER') {
      const passenger: any = await userService.findById(receiverId)
      const body = `Your scheduled trip at ${moment(reservationDate)
        .tz('America/Toronto')
        .format('D MMM hh:mm z')} has been canceled by driver.`
      sendEmail(passenger.email, title, body)
      await createNotificationAndSendToUser(receiverId, 'IMPORTANT', title, body)
    }
  }

  async cancelTripReservationByPassenger(
    tripId: Types.ObjectId,
    reasonId: Types.ObjectId,
    reason: string,
    user: any,
    language: any
  ) {
    let error: any = {}
    const cancelReservationConstants = await cancelReservationConstantService.find()
    const now = moment(new Date())
      .utc()
      .unix()
    const trip = await service.findById(tripId)
    this.checkThat(trip)
      .isRelatedTo(user)
      .as(this.userTripRoles.passenger)
    if (trip.state !== 'RESERVED') {
      error = await errorService.findOneFromView(
        { title: 'it is not allowed to cancel this trip' },
        language
      )
      throw new ApolloError(error.text, '400')
    }
    const reservedTime = moment(trip.reserved.date).unix()
    const difference = (Number(reservedTime) - Number(now)) / 3600
    for (let index = 0; index < cancelReservationConstants.length; index++) {
      const item = cancelReservationConstants[index]
      if (
        (Number(item.from) <= difference &&
          Number(item.to) > difference &&
          item.forType === 'PASSENGER') ||
        (Number(item.from) <= difference && !item.to && item.forType === 'PASSENGER')
      ) {
        const passenger: any = await userService.findById(trip.passenger)
        if (passenger) {
          // passenger.averageRate = Number(passenger.averageRate) - Number(item.ratePunishment)
          // passenger.sumRate = Number(passenger.averageRate) * Number(passenger.numberOfRates)
          // await passenger.save()
          await userService.findOneAndUpdate(passenger._id, {
            averageRate: Number(passenger.averageRate) - Number(item.ratePunishment),
            sumRate: Number(passenger.averageRate) * Number(passenger.numberOfRates)
          })
          await paymentController.createPunishmentPayment(
            'USER',
            passenger._id,
            item.costPunishment,
            trip.tripType,
            'penalty for canceling reserved Trip'
          )
          const result = await this.cancelTripByPassenger(
            user,
            tripId,
            reasonId,
            reason,
            null,
            language
          )
          await this.sendCancelTripReservationEmailAndNotification(
            trip.driver,
            'DRIVER',
            trip.reserved.date
          )
          return result
        }
      }
    }
    error = await errorService.findOneFromView(
      { title: 'The cancellation time has passed.' },
      language
    )
    throw new ApolloError(error.text, '400')
  }

  async cancelTripReservationByDriver(
    tripId: Types.ObjectId,
    reasonId: Types.ObjectId,
    user: any,
    language: any
  ) {
    let error: any = {}
    const cancelReservationConstants = await cancelReservationConstantService.find()
    const now = moment(new Date())
      .utc()
      .unix()
    const trip = await service.findById(tripId)
    this.checkThat(trip)
      .isRelatedTo(user)
      .as(this.userTripRoles.driver)
    if (trip.state !== 'RESERVED') {
      error = await errorService.findOneFromView(
        { title: 'it is not allowed to cancel this trip' },
        language
      )
      throw new ApolloError(error.text, '400')
    }

    const reservedTime = moment(trip.reserved.date).unix()
    const difference = (Number(reservedTime) - Number(now)) / 3600
    console.log({ difference }, trip.reserved.date, new Date())
    for (let index = 0; index < cancelReservationConstants.length; index++) {
      const item = cancelReservationConstants[index]
      if (
        (Number(item.from) <= difference &&
          Number(item.to) > difference &&
          item.forType === 'DRIVER') ||
        (Number(item.from) <= difference && !item.to && item.forType === 'DRIVER')
      ) {
        const driver: any = await driverService.findById(trip.driver)
        if (driver) {
          driver.averageRate = Number(driver.averageRate) - Number(item.ratePunishment)
          driver.sumRate = Number(driver.averageRate) * Number(driver.numberOfRates)
          await driver.save()
          await paymentController.createPunishmentPayment(
            'DRIVER',
            driver._id,
            item.costPunishment,
            trip.tripType,
            'penalty for canceling reserved Trip'
          )
          const result = await this.cancelTripByDriver(user, tripId, reasonId, language)
          await this.sendCancelTripReservationEmailAndNotification(
            trip.passenger,
            'PASSENGER',
            trip.reserved.date
          )
          return result
        }
      }
    }
    error = await errorService.findOneFromView(
      { title: 'The cancellation time has passed.' },
      language
    )
    throw new ApolloError(error.text, '400')
  }

  async endTripByAdmin(tripId: Types.ObjectId) {
    const trip: any = await service.findById(tripId)
    if (!trip) {
      throw new ApolloError('trip not found.', '400')
    }
    if (trip.ended) {
      throw new ApolloError('trip  has been ended before.', '400')
    }
    const driver: any = await driverService.findById(trip.driver)
    if (!driver) {
      throw new ApolloError('you are not allowed to end a trip which is in searching state.', '400')
    }
    const { destinations } = trip
    const lastOrder = destinations.length
    const now = moment(new Date()).utc()
    const endTrip = await service.findOneAndUpdate(
      { _id: tripId },
      {
        $set: {
          state: 'DESTINATION',
          ended: true,
          passedDestinationOrder: lastOrder,
          endDate: now.toISOString()
        }
      }
    )
    await tripOrderService.findOneAndUpdate({ trip: endTrip._id }, { finished: true })
    // const receipt = this.createReceipt(endTrip._id)
    carService.changeIsInTrip(driver.defaultCar, false)
    await paymentController.payForTrip(trip._id)
    pubsub.publish(UPDATE_TRIP, {
      updateTrip: endTrip
    })
    return endTrip
  }

  async getTripReceiptForPassengerByAdmin(user: any, tripId: Types.ObjectId) {
    return this.createReceipt(user, tripId, 'en')
  }

  async getTripReceiptForDriverByAdmin(user: any, tripId: Types.ObjectId) {
    return this.createReceiptForDriver(user, tripId, 'en')
  }
})()
