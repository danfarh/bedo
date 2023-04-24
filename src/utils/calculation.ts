/* eslint-disable no-nested-ternary */
/* eslint-disable no-lonely-if */
/* eslint-disable prettier/prettier */
/* eslint-disable max-classes-per-file */
/* eslint-disable indent */
import _ from 'lodash'
import moment from 'moment'
import { Types } from 'mongoose'
import { ApolloError } from 'apollo-server-express'
import { RedisPushList, RedisGetListAll } from './redis'
import ConstantService from '../schema/constant/service'
import TripService from '../schema/trip/service'
import ReqCarTypeService from '../schema/reqCarType/service'
import orderPromotionUsedService from '../schema/orderPromotionUsed/service'
import usePromotionController from '../schema/tripPromotionUsed/controller'
// import TripPromotionService from '../schema/tripPromotion/service'
import ParcelWeightService from '../schema/parcelWeight/service'
import ParcelVolumeService from '../schema/parcelVolume/service'
import googleCalculation from './calculateTimeAndDistance'
import orderService from '../schema/order/service'
import constant from '../schema/constant'

// => خواندن ثابت های مربوط به محاسبه قیمت از ردیس
export const readConstants = async () => {
  let constants: Array<any> = []
  const constantsStringList: any = await RedisGetListAll('constants')
  if (constantsStringList) {
    constants = constantsStringList.map((item: string) => {
      return JSON.parse(item)
    })
  }
  return constants
}

// => خواندن ثابت های مربوط به محاسبه قیمت بسته های دلیوری از ردیس
const readParcelConstants = async () => {
  let constants: Array<any> = []
  const constantsStringList: any = await RedisGetListAll('parcelConstants')
  if (constantsStringList) {
    constants = constantsStringList.map((item: string) => {
      return JSON.parse(item)
    })
  }
  return constants
}

// => خواندن ریکوئست کار تایپ های موجود در سیستم از ردیس
const readReqCarTypes = async () => {
  let constants: Array<any> = []
  const constantsStringList: any = await RedisGetListAll('reqCarTypes')
  if (constantsStringList) {
    constants = constantsStringList.map((item: string) => {
      return JSON.parse(item)
    })
  }
  return constants
}

// => حذف اعشار اعداد تا دو رقم اعشار
export const convertAmount = (amount: any) => {
  return Number((Math.round(amount * 100) / 100).toFixed(2))
}

// => در این فانکشن نقطه ی ابتدایی و آرایه ای از مقاصد سفر گرفته میشود و بر اساس طول مسیر قیمت سفر محاسبه میشود
// => بولین ایزآپدیت برای این گذاشته شده است که اگر هدف از صدا زدن فانکشن آپدیت کردن قیمت بر اساس مسیر باشد بتوان محاسبات را انجام داد
// => اردر برای زمانی هست که وقتی تصمیم آپدیت داریم بدانیم کدام اردر آپدیت میشود
// => radiusCoefficient هم برای بررسی این گذاشته شده است که آیا درخواست ماشین از فواصل دورتر انجام میشود یا نه
// const calculateTripDistancesPrice = async (
//   initialPointCoordinates: any,
//   destinationPointCoordinates: any,
//   isUpdate: Boolean,
//   order: number | null,
//   radiusCoefficient: number
// ) => {
//   const thisTime: Number = moment(new Date())
//     .utc()
//     .hour()
//   const initialPoint = {
//     lat: initialPointCoordinates.coordinates[1],
//     long: initialPointCoordinates.coordinates[0]
//   }
//   const destinationPoint = destinationPointCoordinates.map(item => {
//     return {
//       lat: item.coordinates[1],
//       long: item.coordinates[0]
//     }
//   })
//   const distances = await googleCalculation(initialPoint, destinationPoint)
//   let price: number = 0
//   const distancePriceDetails: Array<any> = []
//   let totalPrice: number = 0
//   let tripDistance: number = 0
//   let tripDuration: number = 0

//   // => این بخش بر اساس جدول ارسالی کارفرما زده شده است و داینامیک نیست
//   // => و باید داینامیک شود...چون شاید ادمین بخواهد تعرفه ها را عوض کند
//   await distances.forEach(({ distance, duration }, index: number) => {
//     tripDistance += distance
//     tripDuration += duration
//     // => 8 <= time < 12 => per km price 2 dollar
//     if (thisTime >= 8 && thisTime < 12) {
//       // => distance <= 10 => no percent added
//       if (distance <= 10) {
//         price = 2 * distance
//         // => 10 < distance <= 20 => 5 percent added
//       } else if (distance > 10 && distance <= 20) {
//         price = 2 * distance + 2 * distance * 0.05
//         // => distance > 20 => 10 percent added
//       } else {
//         price = 2 * distance + 2 * distance * 0.1
//       }
//       // => 12 <= time < 16 => per km price 1.5 dollar
//     } else if (thisTime >= 12 && thisTime <= 16) {
//       if (distance <= 10) {
//         price = 1.5 * distance
//       } else if (distance > 10 && distance <= 20) {
//         price = 1.5 * distance + 1.5 * distance * 0.05
//       } else {
//         price = 1.5 * distance + 1.5 * distance * 0.1
//       }
//       // => 16 <= time < 8 => per km price 1.5 dollar
//     } else {
//       if (distance <= 10) {
//         price = 1.5 * distance
//       } else if (distance > 10 && distance <= 20) {
//         price = 1.5 * distance + 1.5 * distance * 0.05
//       } else {
//         price = 1.5 * distance + 1.5 * distance * 0.1
//       }
//     }
//     if (isUpdate) {
//       distancePriceDetails.push({
//         order: order || index + 1,
//         distance,
//         duration,
//         price: convertAmount(Number(price) * 0.5)
//       })
//       totalPrice += price * 0.5
//     } else {
//       if (index === 0) {
//         distancePriceDetails.push({
//           order: index + 1,
//           distance,
//           duration,
//           price: convertAmount(Number(price))
//         })
//         totalPrice += price
//       } else {
//         distancePriceDetails.push({
//           order: index + 1,
//           distance,
//           duration,
//           price: convertAmount(Number(price) * 0.5)
//         })
//         totalPrice += price * 0.5
//       }
//     }
//   })

//   if (radiusCoefficient !== 1) {
//     const coefficientConstant = await ConstantService.findOne({ attribute: 'TRIP_COEFFICIENT' })
//     return {
//       totalPriceByDistances: convertAmount(totalPrice),
//       requestFromFarPrice: convertAmount(radiusCoefficient * Number(coefficientConstant.value)),
//       distancePriceDetails,
//       tripDistance: convertAmount(tripDistance),
//       tripDuration
//     }
//   }
//   return {
//     totalPriceByDistances: convertAmount(totalPrice),
//     requestFromFarPrice: 0,
//     distancePriceDetails,
//     tripDistance: convertAmount(tripDistance),
//     tripDuration
//   }
// }

// => این فانکشن برای محاسبه ی قیمت بر اساس ریکوئست کارتایپ ها میباشد
// => بر اساس ثابت های مربوط به هر ریکوئست کارتایپ که در قیمت اثر دارند این فانکشن قیمت را محاسبه میکند
// => مقادیر ورودی آیدی ریکوئست کارتایپ و طول مسیر و مقدار زمان محاسبه شده توسط گوگل میباشد
// => مقادیر خروجی آبجکتی میباشد که شامل بوکینگ فی و بیس فیر و قیمت میباشد
const calculateTripPriceByReqCarType = async (
  reqCarTypeId: Types.ObjectId,
  distances: any,
  isMidNight: Boolean,
  constants: any,
  radiusCoefficient: number
) => {
  const reqCarTypes: Array<any> = []
  const reqCarTypesStringList: any = await RedisGetListAll('reqCarTypes')
  if (reqCarTypesStringList) {
    await reqCarTypesStringList.forEach((item: string) => {
      reqCarTypes.push(JSON.parse(item))
    })
  }

  let newPrice: any
  let reqBookingFee: number = 0
  let reqBaseFare: number = 0
  let tripDistance: number = 0
  let tripDuration: number = 0
  let requestFromFarPrice: number = 0
  let distancePriceDetails: Array<any> = []
  const midNightFactor = _.findIndex(constants, o => o.attribute === 'MIDNIGHT_FACTOR')
  const coefficientConstant = await ConstantService.findOne({ attribute: 'TRIP_COEFFICIENT' })
  distances.forEach(({ distance, duration }, index) => {
    distancePriceDetails.push({
      order: index + 1,
      duration,
      distance
    })
    tripDistance += distance
    tripDuration += duration
  })
  reqCarTypes.forEach(item => {
    const { id, DistanceBasePricePerKM, BaseFare, BookingFee, PerMinute } = item
    if (String(reqCarTypeId) === String(id)) {
      distancePriceDetails = distancePriceDetails.map(distance => {
        return {
          order: distance.order,
          distance: distance.distance,
          duration: distance.duration,
          price: convertAmount(Number(distance.distance) * Number(DistanceBasePricePerKM))
        }
      })
      if (radiusCoefficient !== 1) {
        requestFromFarPrice = convertAmount(radiusCoefficient * Number(coefficientConstant.value))
      }
      reqBaseFare = BaseFare
      reqBookingFee = BookingFee
      newPrice = {
        reqCarTypeDistancePrice: Number(tripDistance) * Number(DistanceBasePricePerKM),
        reqCarTypeDurationPrice: isMidNight
          ? Number(tripDuration) * (Number(PerMinute) + Number(midNightFactor.value))
          : Number(tripDuration) * Number(PerMinute)
      }
    }
  })
  if (newPrice !== 0)
    return {
      tripDistance,
      distancePriceDetails,
      requestFromFarPrice,
      BookingFee: reqBookingFee,
      BaseFare: reqBaseFare,
      reqCarTypePrice: newPrice,
      tripDuration
    }
}

// => این فانکشن برای محاسبه ی قیمت بر اساس تریپ تایپ میباشد
// => هر تریپ تایپ شامل چند ریکوئست کارتایپ میباشد
// => این فانکشن تریپ تایپ و طول سفر و طول زمانی سفر را به عنوان پارامتر های ورودی میگیرد
// => و از فانکشن خط 182 استفاده میکند که قیمت هر ریکوئست کارتایپ را حساب کند
// => و به عنوان دیتای خروجی لیستی از آبجکت ها شامل دیتای کامل ریکوئست کارتایپ به همراه قیمتها بر میگرداند
const calculateTripPriceByTripType = async (
  tripType: string,
  initialPointCoordinates: any,
  destinationPointCoordinates: any,
  constants: any,
  radiusCoefficient: number
) => {
  const thisTime: Number = moment(new Date())
    .utc()
    .hour()
  let isMidNight: Boolean = false
  if (thisTime > 23) {
    isMidNight = true
  }
  const initialPoint = {
    lat: initialPointCoordinates.coordinates[1],
    long: initialPointCoordinates.coordinates[0]
  }
  const destinationPoint = destinationPointCoordinates.map(item => {
    return {
      lat: item.coordinates[1],
      long: item.coordinates[0]
    }
  })
  const distances = await googleCalculation(initialPoint, destinationPoint)
  console.log({ distances })
  if (distances.length === 0)
    throw new ApolloError('There is no routes between your origin and destination(s).', '400')
  let newPrices: Array<any> = []
  const reqCarTypes: Array<any> = await ReqCarTypeService.find({ tripType })
  newPrices = await Promise.all(
    reqCarTypes.map(async item => {
      const {
        _id,
        name,
        logoUrl,
        maximumPassengersCount,
        maximumWeight,
        BaseFare,
        BookingFee
      } = item
      return {
        reqCarType: {
          id: _id,
          name,
          tripType,
          BaseFare,
          BookingFee,
          maximumPassengersCount,
          maximumWeight,
          logoUrl
        },
        cost: await calculateTripPriceByReqCarType(
          _id,
          distances,
          isMidNight,
          constants,
          radiusCoefficient
        )
      }
    })
  )
  return newPrices
}

const calculateTripPriceWithOptionsByConstants = (
  array: any[],
  constants: any[],
  basePrice: number,
  staticWaitTime: number | null
): any => {
  let addedPrice: number = 0
  let optionsPrice: number = 0
  let newBasePrice: number = basePrice
  const optionsPriceDetails: Array<any> = []
  array.forEach(
    (item: {
      isTrue: any
      value: string
      minutes: number
      givingMoney: any
      costPercentage: any
      attribute: string
    }) => {
      if (item.isTrue) {
        let optionPrice: number = 0
        const index = _.findIndex(
          constants,
          (o: { attribute: any; id: string }) => o.attribute === item.value || o.id === item.value
        )
        if (index !== -1 && item.value !== 'IN_HURRY') {
          if (item.minutes) {
            if (staticWaitTime) {
              if (Number(item.minutes) > Number(staticWaitTime)) {
                if (constants[index].typeOfAttribute === 'NUMBER') {
                  addedPrice = Number(item.minutes) * Number(constants[index].value)
                } else if (constants[index].typeOfAttribute === 'PERCENTAGE') {
                  addedPrice =
                    Number(basePrice) *
                    (Number(constants[index].value) / 100) *
                    Number(item.minutes)
                }
              } else {
                if (constants[index].typeOfAttribute === 'NUMBER') {
                  addedPrice = Number(staticWaitTime) * Number(constants[index].value)
                } else if (constants[index].typeOfAttribute === 'PERCENTAGE') {
                  addedPrice =
                    Number(basePrice) *
                    (Number(constants[index].value) / 100) *
                    Number(staticWaitTime)
                }
              }
            } else {
              if (constants[index].typeOfAttribute === 'NUMBER') {
                addedPrice = Number(item.minutes) * Number(constants[index].value)
              } else if (constants[index].typeOfAttribute === 'PERCENTAGE') {
                addedPrice =
                  Number(basePrice) * (Number(constants[index].value) / 100) * Number(item.minutes)
              }
            }
          } else {
            if (constants[index].typeOfAttribute === 'NUMBER') {
              optionPrice = Number(constants[index].value)
              newBasePrice = Number(basePrice) + Number(constants[index].value)
              optionsPrice = optionPrice + optionsPrice
            } else if (constants[index].typeOfAttribute === 'PERCENTAGE') {
              optionPrice = Number(basePrice) * (Number(constants[index].value) / 100)
              newBasePrice = Number(basePrice) * (1 + Number(constants[index].value) / 100)
              optionsPrice = optionPrice + optionsPrice
            }
            // optionsPriceDetails.push({
            //   option: item.attribute ? item.attribute : item.value,
            //   name: item.attribute,
            //   price: convertAmount(Number(optionPrice))
            // })
          }
        } else if (item.value === 'IN_HURRY') {
          if (item.givingMoney) {
            optionPrice = Number(item.givingMoney)
            newBasePrice = Number(basePrice) + Number(item.givingMoney)
            optionsPrice = optionPrice + optionsPrice
          } else if (item.costPercentage) {
            optionPrice = Number(basePrice) * (Number(item.costPercentage) / 100)
            newBasePrice = Number(basePrice) * (1 + Number(item.costPercentage) / 100)
            optionsPrice = optionPrice + optionsPrice
          }
          // optionsPriceDetails.push({
          //   option: item.attribute ? item.attribute : item.value,
          //   price: convertAmount(Number(optionPrice))
          // })
        }
        if (item.isTrue) {
          optionsPriceDetails.push({
            option: item.attribute ? item.attribute : item.value,
            price: convertAmount(Number(optionPrice || addedPrice))
          })
        }
      }
    }
  )
  return {
    optionsPriceDetails,
    optionsPrice: convertAmount(Number(optionsPrice)),
    waitTimePrice: convertAmount(Number(addedPrice))
  }
}

const calculateTripPriceWithOptions = async (
  data: {
    tripType: any
    promotion: any
    origin: any
    destinations: any
    parcelDestinations: any
    waitTimesInMinutes: any
    staticWaitTime: any
    inHurry: any
    bagsWithMe: any
    withInfant: any
    pet: any
    driverAssistant: any
    welcomeSign: any
    airConditioner: any
    doorToDoorInBuilding: any
    accompanyParcel: any
    parcelWeight: any
    parcelPacked: any
    parcelVolume: any
    radiusCoefficient: any
  },
  user: any
) => {
  const constants: Array<any> = await readConstants()
  const parcelConstants: Array<any> = await readParcelConstants()
  let allCost: Array<any> = []
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    const {
      tripType,
      promotion,
      origin,
      destinations,
      parcelDestinations,
      waitTimesInMinutes,
      inHurry,
      bagsWithMe,
      withInfant,
      pet,
      driverAssistant,
      welcomeSign,
      airConditioner,
      doorToDoorInBuilding,
      accompanyParcel,
      parcelPacked,
      radiusCoefficient
    } = data

    const staticWaitTime =
      !data.staticWaitTime || data.staticWaitTime === undefined ? 0 : data.staticWaitTime
    let parcelsVolumeArray: Array<string> = []
    let parcelsWeightArray: Array<string> = []
    if (parcelDestinations) {
      if (parcelDestinations.length !== 0) {
        parcelsVolumeArray = await Promise.all(
          parcelDestinations.map(async des => {
            const volumeIndex = _.findIndex(
              parcelConstants,
              o => String(o.id) === String(des.parcelsInfo.parcelsVolume)
            )
            if (volumeIndex !== -1) {
              const parcelVolume = parcelConstants[volumeIndex]
              return {
                isTrue: true,
                attribute: parcelVolume.attribute,
                value: parcelVolume.id
              }
            }
            return {
              isTrue: false,
              value: 0
            }
          })
        )
        parcelsWeightArray = await Promise.all(
          parcelDestinations.map(async des => {
            const weightIndex = _.findIndex(
              parcelConstants,
              o => String(o.id) === String(des.parcelsInfo.parcelsWeight)
            )
            if (weightIndex !== -1) {
              const parcelWeight = parcelConstants[weightIndex]
              return {
                isTrue: true,
                attribute: parcelWeight.attribute,
                value: parcelWeight.id
              }
            }
            return {
              isTrue: false,
              value: 0
            }
          })
        )
      }
    }
    const waitTimesInMinutesTime =
      waitTimesInMinutes && waitTimesInMinutes.length
        ? _.sum(
            waitTimesInMinutes.map(item => {
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
        : 0
    const passengerRequests = [
      {
        isTrue: withInfant,
        value: 'TRIP_WITH_INFANT'
      },
      {
        isTrue: bagsWithMe ? bagsWithMe.has : false,
        value: 'TRIP_BAGS_WITH_ME'
      },
      {
        isTrue: pet ? pet.hasPet : false,
        value: pet ? (pet.hasCarrier ? 'TRIP_PET_WITH_CARRIER' : 'TRIP_PET_WITHOUT_CARRIER') : false
      },
      {
        isTrue: driverAssistant,
        value: 'TRIP_DRIVER_ASSISTANT'
      },
      {
        isTrue: welcomeSign,
        value: 'TRIP_WELCOME_SIGN'
      },
      {
        isTrue:
          !inHurry || Number(Object.keys(inHurry)) === 0 ? false : inHurry ? inHurry.is : false,
        givingMoney:
          !inHurry || Number(Object.keys(inHurry)) === 0
            ? false
            : inHurry
            ? inHurry.givingMoney
            : false,
        costPercentage:
          !inHurry || Number(Object.keys(inHurry)) === 0
            ? false
            : inHurry
            ? inHurry.costPercentage
            : false,
        value: 'IN_HURRY'
      },
      {
        isTrue: airConditioner,
        value: 'TRIP_AIR_CONDITIONER'
      },
      {
        isTrue: doorToDoorInBuilding,
        value: 'DOOR_TO_DOOR_IN_BUILDING'
      },
      {
        isTrue: accompanyParcel,
        value: 'ACCOMPANY_PARCEL'
      },
      {
        isTrue: parcelPacked,
        value: 'PARCEL_PACKED'
      },
      ...parcelsWeightArray,
      ...parcelsVolumeArray,
      {
        isTrue:
          !!staticWaitTime ||
          (waitTimesInMinutes
            ? waitTimesInMinutes.length !== 0
              ? waitTimesInMinutesTime > 0
              : false
            : false),
        minutes:
          !!staticWaitTime || (waitTimesInMinutes && waitTimesInMinutes.length)
            ? waitTimesInMinutesTime > staticWaitTime
              ? waitTimesInMinutesTime
              : staticWaitTime
            : false,
        // !!staticWaitTime ||
        // (waitTimesInMinutes
        //   ? waitTimesInMinutes.length !== 0
        // ? waitTimesInMinutesTime > staticWaitTime
        //   ? waitTimesInMinutesTime
        //   : staticWaitTime
        //     : false
        //   : false),
        value: 'WAIT_TIMES_IN_MINUTES'
      }
    ]
    // calculateTripDistancesPrice(origin, destinations, false, null, radiusCoefficient)
    //   .then((basePrice: any) => {
    //     const {
    //       totalPriceByDistances,
    //       distancePriceDetails,
    //       requestFromFarPrice,
    //       tripDistance,
    //       tripDuration
    //     } = basePrice
    calculateTripPriceByTripType(tripType, origin, destinations, constants, radiusCoefficient)
      .then(async basePricesByTripType => {
        allCost = await Promise.all(
          basePricesByTripType.map(async price => {
            const {
              reqCarTypePrice,
              BookingFee,
              BaseFare,
              distancePriceDetails,
              requestFromFarPrice,
              tripDistance
            } = price.cost
            const commissionIndex = _.findIndex(constants, o => o.attribute === 'TRIP_COMMISSION')
            const hstIndex = _.findIndex(constants, o => o.attribute === 'TRIP_HST')
            const commission = constants[commissionIndex]
            const hst = constants[hstIndex]
            const priceBeforeOptions =
              Number(reqCarTypePrice.reqCarTypeDistancePrice) +
              Number(reqCarTypePrice.reqCarTypeDurationPrice)
            const newCost = await calculateTripPriceWithOptionsByConstants(
              passengerRequests,
              [...constants, ...parcelConstants],
              priceBeforeOptions,
              staticWaitTime
            )
            // const parcelCost = await calculateTripPriceWithOptionsByConstants(
            //   [...parcelsWeightArray ,...parcelsVolumeArray],
            //   [...constants, ...parcelConstants],
            //   priceBeforeOptions,
            //   staticWaitTime
            // )
            const { optionsPrice, waitTimePrice, optionsPriceDetails } = newCost
            const subTotalPrice =
              convertAmount(Number(optionsPrice)) +
              convertAmount(Number(waitTimePrice)) +
              convertAmount(Number(priceBeforeOptions)) +
              convertAmount(Number(requestFromFarPrice)) +
              convertAmount(Number(BookingFee))
            const driverTotalPrice = convertAmount(
              Number(subTotalPrice * (1 - Number(commission.value) / 100))
            )
            if (promotion) {
              const { tripPrice } = await usePromotionController.usePromotion(
                promotion,
                data,
                user,
                true,
                Number(subTotalPrice)
              )
              const hstPrice = convertAmount(Number(tripPrice) * (Number(hst.value) / 100))
              return {
                ...price,
                tripDistance: convertAmount(Number(tripDistance)),
                requestFromFarPrice: convertAmount(Number(requestFromFarPrice)),
                distancePrice: convertAmount(Number(reqCarTypePrice.reqCarTypeDistancePrice)),
                distancePriceDetails,
                reqCarTypeDistancePrice: convertAmount(
                  Number(reqCarTypePrice.reqCarTypeDistancePrice)
                ),
                reqCarTypeDurationPrice: convertAmount(
                  Number(reqCarTypePrice.reqCarTypeDurationPrice)
                ),
                waitTimePrice: convertAmount(Number(waitTimePrice)),
                optionsPrice: convertAmount(Number(optionsPrice)),
                optionsPriceDetails,
                hstPrice: convertAmount(Number(hstPrice)),
                baseFare: convertAmount(Number(BaseFare)),
                bookingFee: convertAmount(Number(BookingFee)),
                hstPercent: Number(hst.value),
                commissionPrice: convertAmount(subTotalPrice * (Number(commission.value) / 100)),
                driverTotalPrice,
                commissionPercent: Number(commission.value),
                cost: convertAmount(Number(tripPrice) + Number(hstPrice)),
                promotionPrice: convertAmount(Number(subTotalPrice) - Number(tripPrice))
              }
            }
            const hstPrice = convertAmount(Number(subTotalPrice) * (Number(hst.value) / 100))
            return {
              ...price,
              tripDistance: convertAmount(tripDistance),
              requestFromFarPrice: convertAmount(Number(requestFromFarPrice)),
              distancePrice: convertAmount(Number(reqCarTypePrice.reqCarTypeDistancePrice)),
              distancePriceDetails,
              reqCarTypeDistancePrice: convertAmount(
                Number(reqCarTypePrice.reqCarTypeDistancePrice)
              ),
              reqCarTypeDurationPrice: convertAmount(
                Number(reqCarTypePrice.reqCarTypeDurationPrice)
              ),
              waitTimePrice: convertAmount(Number(waitTimePrice)),
              optionsPrice: convertAmount(Number(optionsPrice)),
              optionsPriceDetails,
              hstPrice: convertAmount(Number(hstPrice)),
              baseFare: convertAmount(Number(BaseFare)),
              bookingFee: convertAmount(Number(BookingFee)),
              hstPercent: Number(hst.value),
              commissionPrice: convertAmount(subTotalPrice * (Number(commission.value) / 100)),
              driverTotalPrice,
              commissionPercent: Number(commission.value),
              cost: convertAmount(Number(subTotalPrice) + Number(hstPrice))
            }
          })
        )
        resolve(allCost)
      })
      .catch(err => reject(err))
  })
}

const calculatePrice = async () => {
  const constants: Array<any> = await readConstants()
  const reqCarTypes: Array<any> = await readReqCarTypes()
  return {
    async calculatePriceByOptions(options: any, user: any, onlyCalculate: Boolean) {
      const result = await calculateTripPriceWithOptions(options, user)
      return result
    },
    async updatePriceByNewOptions(tripId: Types.ObjectId) {
      const trip = await TripService.findById(tripId)
      if (trip) {
        return {
          async addNewDestination(destinations: any, user: any) {
            console.log({ destinations })
            const lastOrderIndex = trip.destinations.length - 1
            const lastOrderCoordinates = _.orderBy(trip.destinations, ['order'], ['asc'])[
              lastOrderIndex
            ]
            let initialPoint: any
            if (lastOrderIndex !== -1) {
              initialPoint = {
                lat: lastOrderCoordinates.coordinates[1],
                long: lastOrderCoordinates.coordinates[0]
              }
            } else {
              initialPoint = {
                lat: trip.origin.coordinates[1],
                long: trip.origin.coordinates[0]
              }
            }
            const destinationPoint = destinations.map(item => {
              return {
                lat: item.coordinates[1],
                long: item.coordinates[0]
              }
            })
            const distances = await googleCalculation(initialPoint, destinationPoint)
            console.log({ distances, initialPoint, destinationPoint })
            const thisTime: Number = moment(new Date())
              .utc()
              .hour()
            let isMidNight: Boolean = false
            if (thisTime > 23) {
              isMidNight = true
            }
            const addedPrice: any = await calculateTripPriceByReqCarType(
              trip.reqCarType,
              distances,
              isMidNight,
              constants,
              1
            )
            console.log({ addedPrice: addedPrice.distancePriceDetails })
            const commissionIndex = _.findIndex(constants, o => o.attribute === 'TRIP_COMMISSION')
            const hstIndex = _.findIndex(constants, o => o.attribute === 'TRIP_HST')
            const reqCarTypeIndex = _.findIndex(
              reqCarTypes,
              o => String(o.id) === String(trip.reqCarType)
            )
            const usedReqCarType = reqCarTypes[reqCarTypeIndex]
            const addedReqCarTypePriceForDistance = Number(
              addedPrice.reqCarTypePrice.reqCarTypeDistancePrice
            )
            const addedReqCarTypePriceForTime = Number(
              addedPrice.reqCarTypePrice.reqCarTypeDurationPrice
            )
            const commission = constants[commissionIndex]
            const hst = constants[hstIndex]
            const totalAddedPriceForDriver =
              (Number(addedReqCarTypePriceForDistance) + Number(addedReqCarTypePriceForTime)) *
              (1 - Number(commission.value) / 100)
            const totalAddedPrice =
              Number(addedReqCarTypePriceForTime) + Number(addedReqCarTypePriceForDistance)

            const reqCarTypeAddedPrice =
              Number(addedReqCarTypePriceForDistance) + Number(addedReqCarTypePriceForTime)
            // if (trip.promotion) {
            //   const usedPromotion = await TripPromotionService.findById(trip.promotion)
            //   const { tripPrice } = await usePromotionController.usePromotion(
            //     usedPromotion.promotionCode,
            //     null,
            //     user,
            //     true,
            //     Number(totalAddedPrice)
            //   )
            //   return {
            //     totalPrice: convertAmount(
            //       Number(tripPrice) * (1 + Number(hst.value) / 100) + Number(trip.cost)
            //     ),
            //     addedPrice: convertAmount(Number(tripPrice) * (1 + Number(hst.value) / 100)),
            //     totalAddedPriceForDriver: convertAmount(totalAddedPriceForDriver)
            //   }
            // }
            return {
              totalPrice: convertAmount(
                Number(totalAddedPrice) * (1 + Number(hst.value) / 100) + Number(trip.cost)
              ),
              addedPrice: convertAmount(Number(totalAddedPrice)),
              addedPriceCommission: Number(totalAddedPrice) * (Number(commission.value) / 100),
              addedPriceHST: Number(totalAddedPrice) * (Number(hst.value) / 100),
              totalAddedPriceForDriver: convertAmount(totalAddedPriceForDriver),
              tripDistance: convertAmount(
                Number(addedPrice.tripDistance) + Number(trip.tripDistance)
              ),
              addedReqCarTypePriceForDistance: convertAmount(
                Number(addedReqCarTypePriceForDistance)
              ),
              addedReqCarTypePriceForTime: convertAmount(Number(addedReqCarTypePriceForTime)),
              reqCarTypeAddedPrice: convertAmount(Number(reqCarTypeAddedPrice)),
              tripDuration: Number(addedPrice.tripDuration),
              usedReqCarType,
              addedTripDistancePrice: addedReqCarTypePriceForDistance,
              distancePriceDetails: addedPrice.distancePriceDetails
            }
          },
          async addHoldTime(waitTimesInMinutes: any, user: any) {
            const requests = [
              {
                isTrue: waitTimesInMinutes ? waitTimesInMinutes.length !== 0 : false,
                minutes: waitTimesInMinutes
                  ? waitTimesInMinutes.length !== 0
                    ? _.sum(
                        waitTimesInMinutes.map(
                          (item: { end: string | number | Date; start: string | number | Date }) =>
                            (new Date(item.end).getTime() - new Date(item.start).getTime()) / 60000
                        )
                      )
                    : false
                  : false,
                value: 'WAIT_TIMES_IN_MINUTES'
              }
            ]
            const { waitTimePrice } = await calculateTripPriceWithOptionsByConstants(
              requests,
              constants,
              Number(trip.cost),
              null
            )
            const commissionIndex = _.findIndex(constants, o => o.attribute === 'TRIP_COMMISSION')
            const hstIndex = _.findIndex(constants, o => o.attribute === 'TRIP_HST')
            const commission = constants[commissionIndex]
            const hst = constants[hstIndex]
            const totalAddedPriceForDriver = convertAmount(
              Number(waitTimePrice) * (1 - Number(commission.value) / 100)
            )
            const totalAddedPrice = convertAmount(Number(waitTimePrice))
            // if (trip.promotion) {
            //   const usedPromotion = await TripPromotionService.findById(trip.promotion)
            //   const { tripPrice } = await usePromotionController.usePromotion(
            //     usedPromotion.promotionCode,
            //     null,
            //     user,
            //     true,
            //     Number(totalAddedPrice)
            //   )
            //   return {
            //     totalAddedPrice: convertAmount(
            //       Number(tripPrice) * (1 + Number(hst.value) / 100) + Number(trip.cost)
            //     ),
            //     totalAddedPriceForDriver
            //   }
            // }
            return {
              totalAddedPrice: convertAmount(
                Number(totalAddedPrice) * (1 + Number(hst.value) / 100) + Number(trip.cost)
              ),
              addedWaitTimesPrice: convertAmount(Number(waitTimePrice)),
              addedPriceHST: convertAmount(Number(totalAddedPrice) * (Number(hst.value) / 100)),
              addedPriceCommission: convertAmount(
                Number(totalAddedPrice) * (Number(commission.value) / 100)
              ),
              totalAddedPriceForDriver
            }
          },
          async changeDropOffLocation(
            newDestination: any,
            oldDestination: any,
            user: any,
            isNextOrder: boolean,
            order: number
          ) {
            let addedPrice: any
            const initialPoint = {
              lat: oldDestination.coordinates[1],
              long: oldDestination.coordinates[0]
            }
            const orderIndexInPriceDetails = _.findIndex(
              trip.distancePriceDetails,
              o => o.order === order
            )
            const nextOrderIndex = _.findIndex(trip.destinations, o => o.order === order + 1)
            const maxOrder = Math.max(...trip.destinations.map(destination => destination.order))
            const thisTime: Number = moment(new Date())
              .utc()
              .hour()
            let isMidNight: Boolean = false
            if (thisTime >= 23 && thisTime < 4) {
              isMidNight = true
            }
            if (isNextOrder && order < maxOrder) {
              const destinationPoint = [...newDestination, trip.destinations[nextOrderIndex]].map(
                item => {
                  return {
                    lat: item.coordinates[1],
                    long: item.coordinates[0]
                  }
                }
              )
              const distances = await googleCalculation(initialPoint, destinationPoint)
              addedPrice = await calculateTripPriceByReqCarType(
                trip.reqCarType,
                distances,
                isMidNight,
                constants,
                1
              )
            } else {
              const destinationPoint = newDestination.map(item => {
                return {
                  lat: item.coordinates[1],
                  long: item.coordinates[0]
                }
              })
              const distances = await googleCalculation(initialPoint, destinationPoint)
              addedPrice = await calculateTripPriceByReqCarType(
                trip.reqCarType,
                distances,
                isMidNight,
                constants,
                1
              )
            }
            const commissionIndex = _.findIndex(constants, o => o.attribute === 'TRIP_COMMISSION')
            const hstIndex = _.findIndex(constants, o => o.attribute === 'TRIP_HST')
            const reqCarTypeIndex = _.findIndex(
              reqCarTypes,
              o => String(o.id) === String(trip.reqCarType)
            )
            const usedReqCarType = reqCarTypes[reqCarTypeIndex]
            const addedReqCarTypePriceForDistance =
              isNextOrder && order < maxOrder
                ? Number(addedPrice.tripDistance) * Number(usedReqCarType.DistanceBasePricePerKM) -
                  (Number(
                    trip.distancePriceDetails[orderIndexInPriceDetails].distance *
                      Number(usedReqCarType.DistanceBasePricePerKM)
                  ) +
                    Number(trip.distancePriceDetails[orderIndexInPriceDetails + 1].distance) *
                      Number(usedReqCarType.DistanceBasePricePerKM))
                : (Number(addedPrice.tripDistance) -
                    Number(trip.distancePriceDetails[orderIndexInPriceDetails].distance)) *
                  Number(usedReqCarType.DistanceBasePricePerKM)
            const addedReqCarTypePriceForTime =
              isNextOrder && order < maxOrder
                ? Number(addedPrice.tripDuration) * Number(usedReqCarType.PerMinute) -
                  (Number(trip.distancePriceDetails[orderIndexInPriceDetails].duration) *
                    Number(usedReqCarType.PerMinute) +
                    Number(trip.distancePriceDetails[orderIndexInPriceDetails + 1].duration) *
                      Number(usedReqCarType.PerMinute))
                : (Number(addedPrice.tripDuration) -
                    Number(trip.distancePriceDetails[orderIndexInPriceDetails].duration)) *
                  Number(usedReqCarType.PerMinute)
            const commission = constants[commissionIndex]
            const hst = constants[hstIndex]
            const totalAddedPrice =
              isNextOrder && order < maxOrder
                ? Number(addedReqCarTypePriceForDistance) + Number(addedReqCarTypePriceForTime)
                : // -
                // (
                //   (Number(trip.distancePriceDetails[orderIndexInPriceDetails].distance) + Number(trip.distancePriceDetails[orderIndexInPriceDetails + 1].distance))*Number(usedReqCarType.DistanceBasePricePerKM) +
                //   (Number(trip.distancePriceDetails[orderIndexInPriceDetails].duration) + Number(trip.distancePriceDetails[orderIndexInPriceDetails + 1].duration) ) *Number(usedReqCarType.PerMinute)

                //     )
                !isNextOrder
                ? Number(addedReqCarTypePriceForDistance) + Number(addedReqCarTypePriceForTime)
                : Number(addedReqCarTypePriceForDistance) + Number(addedReqCarTypePriceForTime)
            const totalAddedPriceForDriver =
              isNextOrder && order < maxOrder
                ? convertAmount(totalAddedPrice * (1 - Number(commission.value) / 100))
                : !isNextOrder
                ? convertAmount(totalAddedPrice * (1 - Number(commission.value) / 100))
                : convertAmount(totalAddedPrice * (1 - Number(commission.value) / 100))

            const reqCarTypeAddedPrice =
              Number(addedReqCarTypePriceForDistance) + Number(addedReqCarTypePriceForTime)
            // if (trip.promotion) {
            //   const usedPromotion = await TripPromotionService.findById(trip.promotion)
            //   const { tripPrice } = await usePromotionController.usePromotion(
            //     usedPromotion.promotionCode,
            //     null,
            //     user,
            //     true,
            //     Number(totalAddedPrice)
            //   )
            //   return {
            //     newCost: convertAmount(
            //       Number(tripPrice) * (1 + Number(hst.value) / 100) + Number(trip.cost)
            //     ),
            //     distancePrice: convertAmount(
            //       Number(totalAddedPrice) * (1 + Number(hst.value) / 100)
            //     ),
            //     newCostDetails: addedPrice.distancePriceDetails,
            //     totalAddedPriceForDriver,
            //     tripDistance: addedPrice.tripDistance
            //   }
            // }
            return {
              newCost: convertAmount(
                Number(totalAddedPrice) * (1 + Number(hst.value) / 100) + Number(trip.cost)
              ),
              distancePrice:
                isNextOrder && order < maxOrder
                  ? convertAmount(
                      Number(addedReqCarTypePriceForDistance) -
                        Number(trip.distancePriceDetails[orderIndexInPriceDetails + 1].price)
                    )
                  : !isNextOrder
                  ? convertAmount(
                      Number(addedReqCarTypePriceForDistance) -
                        Number(trip.distancePriceDetails[orderIndexInPriceDetails].price)
                    )
                  : convertAmount(Number(addedReqCarTypePriceForDistance)),
              newCostDetails: addedPrice.distancePriceDetails,
              addedPriceCommission: convertAmount(
                (Number(totalAddedPrice) * Number(commission.value)) / 100
              ),
              addedPriceHST: convertAmount((Number(totalAddedPrice) * Number(hst.value)) / 100),
              reqCarTypeAddedPrice: convertAmount(reqCarTypeAddedPrice),
              addedReqCarTypePriceForDistance: convertAmount(addedReqCarTypePriceForDistance),
              addedReqCarTypePriceForTime: convertAmount(addedReqCarTypePriceForTime),
              totalAddedPriceForDriver,
              tripDistance:
                isNextOrder && order < maxOrder
                  ? convertAmount(
                      Number(addedPrice.tripDistance) -
                        (Number(trip.distancePriceDetails[orderIndexInPriceDetails].distance) +
                          Number(trip.distancePriceDetails[orderIndexInPriceDetails + 1].distance))
                    )
                  : !isNextOrder
                  ? convertAmount(
                      Number(addedPrice.tripDistance) -
                        Number(trip.distancePriceDetails[orderIndexInPriceDetails].distance)
                    )
                  : convertAmount(Number(addedPrice.tripDistance))
            }
          }
        }
      }
      throw new Error('trip not found')
    }
  }
}
const insertConstantsToRedis = async () => {
  const constants: Array<any> = await ConstantService.findAll()
  if (constants.length !== 0) {
    constants.forEach(item => {
      const { attribute, value, typeOfAttribute } = item
      RedisPushList('constants', {
        attribute,
        value,
        typeOfAttribute
      })
    })
  }
}

const insertParcelConstantsToRedis = async () => {
  const parcelVolume: Array<any> = await ParcelVolumeService.findAll()
  const parcelWeight: Array<any> = await ParcelWeightService.findAll()
  const parcelConst = [...parcelVolume, ...parcelWeight]
  if (parcelConst.length !== 0) {
    parcelConst.forEach(item => {
      const { _id, name, value, typeOfAttribute } = item
      RedisPushList('parcelConstants', {
        id: _id,
        attribute: name,
        value,
        typeOfAttribute
      })
    })
  }
}

const insertReqCarTypesToRedis = async () => {
  const reqCarTypes: Array<any> = await ReqCarTypeService.findAll()
  if (reqCarTypes.length !== 0) {
    reqCarTypes.forEach(item => {
      const {
        name,
        increasePricePercent,
        BaseFare,
        BookingFee,
        DistanceBasePricePerKM,
        PerMinute
      } = item
      RedisPushList('reqCarTypes', {
        id: item._id,
        DistanceBasePricePerKM,
        BaseFare,
        BookingFee,
        PerMinute,
        name,
        increasePricePercent
      })
    })
  }
}

export async function calculateOrder(cartTotalPrice: number) {
  const constants: Array<any> = await readConstants()
  const commissionIndex = _.findIndex(constants, o => o.attribute === 'ORDER_COMMISSION')
  const hstIndex = _.findIndex(constants, o => o.attribute === 'ORDER_HST')
  const commission = constants[commissionIndex]
  const hst = constants[hstIndex]

  const totalPrice = cartTotalPrice * (1 + Number(commission.value) / 100)
  const hstPrice = Number(totalPrice) * (Number(hst.value) / 100)

  return {
    hstPrice: convertAmount(Number(hstPrice)),
    hstPercent: Number(hst.value),
    commissionPrice: convertAmount(totalPrice * (Number(commission.value) / 100)),
    commissionPercent: Number(commission.value),
    totalPrice: convertAmount(Number(totalPrice) + Number(hstPrice))
  }
}
// promotion calculation

interface IPromotionCalculator {
  calculate(price: number, promotion: any, additionalData?: any): Promise<Number>
  calculateSync(price: number, promotion: any, additionalData?: any): Number
}

class ProductPromotionCalculator implements IPromotionCalculator {
  calculate(price: number, promotion: any, additionalData?: any): Promise<number> {
    throw new Error('Method not implemented.')
  }

  calculateSync(price: number, promotion: any, additionalData?: any): Number {
    const totalPrice = price * additionalData.count
    if (promotion) {
      if (promotion.type === 'FIXED') {
        return totalPrice - Number(promotion.maximumDiscount * additionalData.count)
      }
      return totalPrice * (1 - 0.01 * Number(promotion.percent))
    }
    return price
  }
}

class OrderPromotionCalculator implements IPromotionCalculator {
  calculateSync(price: number, promotion: any, additionalData?: any): Number {
    throw new Error('Method not implemented.')
  }

  async calculate(
    price: number,
    promotion: any,
    additionalData?: any,
    checkOnly = false,
    promotionUsedService: any = null
  ): Promise<number> {
    if (!promotionUsedService) {
      promotionUsedService = orderPromotionUsedService
    }
    let discount = 0
    if (promotion) {
      const usedPromotionsCount = await promotionUsedService.usedPromotionCount(
        promotion,
        additionalData.userId,
        additionalData.usedFor
      )
      if (promotion.condition === 'TIMELY' || promotion.condition === 'PERCENTAGE') {
        const currentTime = Date.now()
        const from = new Date(promotion.from).getTime()
        const to = new Date(promotion.to).getTime()

        if (currentTime >= from && currentTime <= to) {
          if (promotion.useLimitCount && usedPromotionsCount < promotion.useLimitCount) {
            let orderPromotionUsed
            if (!checkOnly) {
              orderPromotionUsed = await promotionUsedService.create({
                promotion: promotion._id,
                user: additionalData.userId,
                usedFor: additionalData.usedFor
              })
            }

            if (checkOnly || orderPromotionUsed) {
              if (promotion.type === 'FIXED') {
                discount = Number(promotion.maximumPromotion)
              } else {
                discount = price * 0.01 * Number(promotion.percent)
                if (discount > promotion.maximumPromotion) {
                  discount = Number(promotion.maximumPromotion)
                }
              }
              if (discount >= price) discount = price
            }
          } else {
            throw new ApolloError('this promotion is used for this order', '403')
          }
        }
      } else if (promotion.condition === 'FIRST_ORDER') {
        const userHasAnyOrder = await orderService.findOne({
          ...(promotion.shop && { shop: promotion.shop }),
          user: additionalData.userId
        })
        if (
          !userHasAnyOrder &&
          promotion.useLimitCount &&
          usedPromotionsCount < promotion.useLimitCount
        ) {
          let orderPromotionUsed
          if (!checkOnly) {
            orderPromotionUsed = await promotionUsedService.create({
              promotion: promotion._id,
              user: additionalData.userId,
              usedFor: additionalData.usedFor
            })
          }
          if (checkOnly || orderPromotionUsed) {
            if (promotion.type === 'FIXED') {
              discount = Number(promotion.maximumPromotion)
            } else {
              discount = price * 0.01 * Number(promotion.percent)
              if (discount > promotion.maximumPromotion) {
                discount = Number(promotion.maximumPromotion)
              }
            }
            if (discount >= price) discount = price
          }
        } else {
          throw new ApolloError('this promotion is used for this order', '403')
        }
      }
    }
    return discount
  }
}

export enum PromotionFor {
  Product,
  order
}

export class PromotionFactory {
  static setCalculationFor(type: PromotionFor) {
    // TODO use switch instead of if
    if (type === PromotionFor.order) return new OrderPromotionCalculator()
    return new ProductPromotionCalculator()
  }
}

export function calculateShipmentCost(userLocation: any, shopLocation: any) {
  // check type of shipment is with spark or shop
  // if shop -> get distance and calculate delivery price
  // else calculate price using spark delivery calculation
  return 2000
}

export default {
  convertAmount,
  calculatePrice,
  calculateTripPriceWithOptions,
  insertConstantsToRedis,
  insertReqCarTypesToRedis,
  insertParcelConstantsToRedis,
  calculateOrder
}
