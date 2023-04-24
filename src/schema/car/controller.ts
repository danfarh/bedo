/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
import { ApolloError } from 'apollo-server-express'
import moment from 'moment'
import _ from 'lodash'
import { Types } from 'mongoose'
import service from './service'
import controllerBase from '../../utils/controllerBase'
import driverService from '../driver/service'
import driverSchema from '../driver/schema'
import carSchema from './schema'
import { Pagination } from '../../utils/interfaces'
import carTypeService from '../carType/service'
import { addOrUpdateCarValidation } from '../../utils/validation/validation'
import carBrandService from '../carBrand/service'
import carModelService from '../carModel/service'
import carColorService from '../carColor/service'
import errorService from '../errors/service'

export default new (class Controller extends controllerBase {
  async addCar(addCarInput, driverId: Types.ObjectId, language: any) {
    let error: any = {}
    const {
      color,
      plate,
      carType,
      brand,
      model,
      manufacturingYear,
      registrationDocumentUrl,
      description
    } = addCarInput

    await addOrUpdateCarValidation.validateAsync({
      color,
      plate,
      carType,
      brand,
      model,
      manufacturingYear,
      registrationDocumentUrl,
      description
    })
    const foundCar = await service.findOne({ plate })
    if (foundCar) {
      error = await errorService.findOneFromView(
        { title: 'This plate number is used by another car.' },
        language
      )
      throw new ApolloError(error.text, '400')
    }

    const brandExists = await carBrandService.findById(brand)
    if (!brandExists) {
      error = await errorService.findOneFromView({ title: 'your brand does not exists' }, language)
      throw new ApolloError(error.text)
    }
    const modelExists = await carModelService.findOne({ _id: model, brand })
    if (!modelExists) {
      error = await errorService.findOneFromView({ title: 'your model does not exists' }, language)
      throw new ApolloError(error.text)
    }

    const colorExists = await carColorService.findById(color)
    if (!colorExists) {
      error = await errorService.findOneFromView({ title: 'your color does not exists' }, language)
      throw new ApolloError(error.text)
    }
    const type = await carTypeService.findById(carType)

    if (!type) {
      error = await errorService.findOneFromView(
        { title: 'your car type does not exists' },
        language
      )
      throw new ApolloError(error.text, '404')
    }

    const driver: any = await driverService.findById(driverId)
    if (!driver) {
      error = await errorService.findOneFromView({ title: 'driver does not exists' }, language)
      throw new ApolloError(error.text, '404')
    }
    const newCar = await service.create(addCarInput)
    await driverService.addCar(driver._id, newCar._id)
    if (!driver.defaultCar) {
      await driverService.findOneAndUpdate({ _id: driver._id }, { defaultCar: newCar._id })
    }
    return newCar
  }

  async getSingleCar(_id) {
    return service.findOne({ _id })
  }

  // eslint-disable-next-line no-shadow
  async getDriversCarsByAdmin(driver: Types.ObjectId, Pagination, language: any) {
    await this.getDriversCars(driver, Pagination, language)
  }

  // eslint-disable-next-line no-shadow
  async getDriversCars(id: Types.ObjectId, Pagination, language: any) {
    const driver: any = await driverService.findById(id)
    if (!driver) {
      const error = await errorService.findOneFromView(
        { title: 'driver does not exists' },
        language
      )
      throw new ApolloError(error.text, '404')
    }
    const result: any = await service.find({ _id: { $in: driver.car } }, Pagination)
    const defaultCar = await service.findById(driver.defaultCar) // Todo Cannot read property 'defaultCar' of null
    return {
      driverCars: result,
      defaultCar
    }
  }

  async getCarsByAdmin(
    filters: any = {},
    pagination: any = {
      skip: 0,
      limit: 15
    },
    sort: any = { createdAt: -1 },
    state
  ) {
    if ('carOptions' in filters) {
      filters['carOptions.orderingForSomeoneElse'] = filters.orderingForSomeoneElse
      filters['carOptions.pet'] = filters.pet
      filters['carOptions.bagsWithMe'] = filters.bagsWithMe
      filters['carOptions.reserved'] = filters.reserved
      filters['carOptions.airConditioner'] = filters.airConditioner
      filters['carOptions.welcomeSign'] = filters.welcomeSign
      filters['carOptions.driverAssistant'] = filters.driverAssistant
      filters['carOptions.withInfant'] = filters.withInfant
      filters['carOptions.waitTimesInMinutes'] = filters.waitTimesInMinutes
      filters['carOptions.tipValue'] = filters.tipValue
      filters = _.omit(filters, 'carOptions')
    }
    if ('plate' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.plate = new RegExp(filters.plate, 'gi')
    }
    if ('description' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.description = new RegExp(filters.description, 'gi')
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

    if ('driverPhoneNumber' in filters) {
      filters['driver.phoneNumber'] = { $regex: `.*${filters.driverPhoneNumber}.*` }
      delete filters.driverPhoneNumber
    }

    if ('driverFullName' in filters) {
      filters['driver.fullName'] = { $regex: `.*${filters.driverFullName}.*` }
      delete filters.driverFullName
    }

    if ('carStatus' in filters) {
      filters.status = filters.carStatus
      delete filters.carStatus
    }
    if (state === 'COUNT')
      return carSchema.aggregate([
        {
          $lookup: {
            from: 'drivers',
            let: { carId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $ne: [{ $type: '$car' }, 'missing'] }, { $in: ['$$carId', '$car'] }]
                  }
                }
              },
              {
                $lookup: {
                  from: 'cars',
                  localField: 'defaultCar',
                  foreignField: '_id',
                  as: 'defaultCar'
                }
              },
              { $unwind: '$defaultCar' }
            ],
            as: 'driver'
          }
        },
        { $unwind: '$driver' },
        {
          $addFields: {
            status: {
              $cond: [
                { $eq: ['$driver.defaultCar._id', '$_id'] },
                {
                  $cond: [
                    { $eq: ['$driver.defaultCar.isInTrip', true] },
                    'INTRIP',
                    {
                      $cond: [
                        { $not: [{ $not: ['$driver.workStatus'] }] }, // if workStatus field exists in driver record
                        {
                          $cond: [{ $eq: ['$driver.workStatus', 'ACTIVE'] }, 'ONLINE', 'OFFLINE']
                        },
                        'OFFLINE'
                      ]
                    }
                  ]
                },
                'OFFLINE'
              ]
            }
          }
        },
        { $match: { ...filters } },
        { $sort: { ...sort } }
      ])
    return carSchema.aggregate([
      {
        $lookup: {
          from: 'drivers',
          let: { carId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $ne: [{ $type: '$car' }, 'missing'] }, { $in: ['$$carId', '$car'] }]
                }
              }
            },
            {
              $lookup: {
                from: 'cars',
                localField: 'defaultCar',
                foreignField: '_id',
                as: 'defaultCar'
              }
            },
            { $unwind: '$defaultCar' }
          ],
          as: 'driver'
        }
      },
      { $unwind: '$driver' },
      {
        $addFields: {
          status: {
            $cond: [
              { $eq: ['$driver.defaultCar._id', '$_id'] },
              {
                $cond: [
                  { $eq: ['$driver.defaultCar.isInTrip', true] },
                  'INTRIP',
                  {
                    $cond: [
                      { $not: [{ $not: ['$driver.workStatus'] }] }, // if workStatus field exists in driver record
                      {
                        $cond: [{ $eq: ['$driver.workStatus', 'ACTIVE'] }, 'ONLINE', 'OFFLINE']
                      },
                      'OFFLINE'
                    ]
                  }
                ]
              },
              'OFFLINE'
            ]
          }
        }
      },
      { $match: { ...filters } },
      { $sort: { ...sort } },
      { $skip: pagination.skip },
      { $limit: pagination.limit }
    ])
  }

  async getSortDrivers(filters: any = {}) {
    if ('carOptions' in filters) {
      filters['carOptions.orderingForSomeoneElse'] = filters.orderingForSomeoneElse
      filters['carOptions.pet'] = filters.pet
      filters['carOptions.bagsWithMe'] = filters.bagsWithMe
      filters['carOptions.reserved'] = filters.reserved
      filters['carOptions.airConditioner'] = filters.airConditioner
      filters['carOptions.welcomeSign'] = filters.welcomeSign
      filters['carOptions.driverAssistant'] = filters.driverAssistant
      filters['carOptions.withInfant'] = filters.withInfant
      filters['carOptions.waitTimesInMinutes'] = filters.waitTimesInMinutes
      filters['carOptions.tipValue'] = filters.tipValue
      filters = _.omit(filters, 'carOptions')
    }
    if ('plate' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.plate = new RegExp(filters.plate, 'gi')
    }
    if ('description' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.description = new RegExp(filters.description, 'gi')
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

    if ('driverPhoneNumber' in filters) {
      filters['driver.phoneNumber'] = { $regex: `.*${filters.driverPhoneNumber}.*` }
      delete filters.driverPhoneNumber
    }

    if ('driverFullName' in filters) {
      filters['driver.fullName'] = { $regex: `.*${filters.driverFullName}.*` }
      delete filters.driverFullName
    }

    if ('carStatus' in filters) {
      filters.status = filters.carStatus
      delete filters.carStatus
    }

    if ('shop' in filters) {
      filters['driver.shop'] = Types.ObjectId(filters.shop)
      delete filters.shop
    }

    return carSchema.aggregate([
      {
        $lookup: {
          from: 'drivers',
          let: { carId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $ne: [{ $type: '$car' }, 'missing'] }, { $in: ['$$carId', '$car'] }]
                }
              }
            },
            {
              $lookup: {
                from: 'cars',
                localField: 'defaultCar',
                foreignField: '_id',
                as: 'defaultCar'
              }
            },
            { $unwind: '$defaultCar' }
          ],
          as: 'driver'
        }
      },
      { $unwind: '$driver' },
      {
        $addFields: {
          status: {
            $cond: [
              { $eq: ['$driver.defaultCar._id', '$_id'] },
              {
                $cond: [
                  { $eq: ['$driver.defaultCar.isInTrip', true] },
                  'INTRIP',
                  {
                    $cond: [
                      { $not: [{ $not: ['$driver.workStatus'] }] }, // if workStatus field exists in driver record
                      {
                        $cond: [{ $eq: ['$driver.workStatus', 'ACTIVE'] }, 'ONLINE', 'OFFLINE']
                      },
                      'OFFLINE'
                    ]
                  }
                ]
              },
              'OFFLINE'
            ]
          }
        }
      },
      {
        $addFields: {
          sortId: {
            $cond: [
              { $eq: ['$status', 'ONLINE'] },
              0,
              {
                $cond: [{ $eq: ['$status', 'INTRIP'] }, 1, 2]
              }
            ]
          }
        }
      },
      { $sort: { sortId: 1 } },
      { $match: { ...filters } }
    ])
  }

  async updateCar(id: Types.ObjectId, updateCarInput, driverId, language: any) {
    let error: any = {}
    const {
      color,
      plate,
      carType,
      brand,
      model,
      manufacturingYear,
      registrationDocumentUrl,
      description
    } = updateCarInput

    await addOrUpdateCarValidation.validateAsync({
      color,
      plate,
      carType,
      brand,
      model,
      manufacturingYear,
      registrationDocumentUrl,
      description
    })
    const foundCar = await service.findOne({ plate, _id: { $ne: id } })
    if (foundCar) {
      error = await errorService.findOneFromView(
        { title: 'This plate number is used by another car.' },
        language
      )
      throw new ApolloError(error.text, '400')
    }

    const brandExists = await carBrandService.findById(brand)
    if (!brandExists) {
      error = await errorService.findOneFromView({ title: 'your brand does not exists' }, language)
      throw new ApolloError(error.text)
    }
    const modelExists = await carModelService.findOne({ _id: model, brand })
    if (!modelExists) {
      error = await errorService.findOneFromView({ title: 'your model does not exists' }, language)
      throw new ApolloError(error.text)
    }

    const colorExists = await carColorService.findById(color)
    if (!colorExists) {
      error = await errorService.findOneFromView({ title: 'your color does not exists' }, language)
      throw new ApolloError(error.text)
    }
    const type = await carTypeService.findById(carType)
    if (!type) {
      error = await errorService.findOneFromView(
        { title: 'your car type does not exists' },
        language
      )
      throw new ApolloError(error.text, '404')
    }
    const driver: any = await driverService.findById(driverId)
    if (!driver) {
      error = await errorService.findOneFromView({ title: 'driver does not exists' }, language)
      throw new ApolloError(error.text, '404')
    }
    if (!driver.car.includes(id)) {
      error = await errorService.findOneFromView({ title: 'car is not related to you' }, language)
      throw new ApolloError(error.text, '403')
    }

    return service.findOneAndUpdate(id, updateCarInput)
  }

  async removeCar(id: Types.ObjectId, driverId: Types.ObjectId, language: any) {
    let error: any = {}
    const car = await service.findOne({ _id: id })
    if (!car) {
      error = await errorService.findOneFromView({ title: 'your car does not exists' }, language)
      throw new ApolloError(error.text, '403')
    }
    let driver: any = await driverService.findById(driverId)
    if (!driver) {
      error = await errorService.findOneFromView({ title: 'driver does not exists' }, language)
      throw new ApolloError(error.text, '403')
    }
    if (!driver.car.includes(id)) {
      error = await errorService.findOneFromView({ title: 'car is not related to you' }, language)
      throw new ApolloError(error.text, '403')
    }
    if (String(driver.defaultCar) === String(id)) {
      error = await errorService.findOneFromView(
        { title: 'you can not remove your favorite car' },
        language
      )
      throw new ApolloError(error.text, '403')
    }
    await service.findOneAndRemove(id)
    driver = await driverService.removeCar(driverId, id)
    const msg = await errorService.findOneFromView({ title: 'Your car has been removed' }, language)
    return {
      message: msg.text
    }
  }

  async addCarByAdmin(input, driverId) {
    const driver: any = await driverService.findById(driverId)
    if (!driver) {
      throw new ApolloError('driver does not exists', '404')
    }
    const {
      color,
      plate,
      carType,
      brand,
      model,
      manufacturingYear,
      registrationDocumentUrl,
      description
    } = input

    await addOrUpdateCarValidation.validateAsync({
      color,
      plate,
      carType,
      brand,
      model,
      manufacturingYear,
      registrationDocumentUrl,
      description
    })
    const foundCar = await service.findOne({ plate })
    if (foundCar) throw new ApolloError('This plate number is used by another car.', '400')

    const brandExists = await carBrandService.findById(brand)
    if (!brandExists) {
      throw new ApolloError('your brand does not exists')
    }
    const modelExists = await carModelService.findOne({ _id: model, brand })
    if (!modelExists) {
      throw new ApolloError('your model does not exists')
    }

    const colorExists = await carColorService.findById(color)
    if (!colorExists) {
      throw new ApolloError('your color does not exists')
    }
    const type = await carTypeService.findById(carType)

    if (!type) {
      throw new ApolloError('your car type does not exists', '404')
    }

    const newCar = await service.create(input)
    await driverService.addCar(driver._id, newCar._id)
    if (!driver.defaultCar) {
      await driverService.findOneAndUpdate(driver._id, { defaultCar: newCar._id })
    }
    return newCar
  }

  async findCarOwner(carId) {
    const [owner] = await driverService.find({ car: carId })
    return owner
  }

  async updateCarByAdmin(input, carId) {
    const {
      color,
      plate,
      carType,
      brand,
      model,
      manufacturingYear,
      registrationDocumentUrl,
      description,
      insurance
    } = input

    await addOrUpdateCarValidation.validateAsync({
      color,
      plate,
      carType,
      brand,
      model,
      manufacturingYear,
      registrationDocumentUrl,
      description
    })
    const foundCar = await service.findOne({ plate, _id: { $ne: carId } })
    if (foundCar) throw new ApolloError('This plate number is used by another car.', '400')

    const brandExists = await carBrandService.findById(brand)
    if (!brandExists) {
      throw new ApolloError('your brand does not exists')
    }
    const modelExists = await carModelService.findOne({ _id: model, brand })
    if (!modelExists) {
      throw new ApolloError('your model does not exists')
    }

    const colorExists = await carColorService.findById(color)
    if (!colorExists) {
      throw new ApolloError('your color does not exists')
    }
    const type = await carTypeService.findById(carType)
    if (!type) {
      throw new ApolloError('your car type does not exists', '404')
    }
    return service.findOneAndUpdate({ _id: carId }, input)
  }

  async deleteCarByAdmin(idSet: Types.ObjectId[]) {
    for (let index = 0; index < idSet.length; index++) {
      const carId = idSet[index]
      const car: any = await service.findById(carId)
      if (!car) throw new ApolloError('Car does not exist.', '400')
      if (car.isInTrip) throw new ApolloError('Car is on a trip.', '400')
      const driverSet: any[] = await driverSchema.find({ car: { $all: [carId] } })
      driverSet.forEach(driver => {
        if (driver.workStatus === 'ACTIVE' && String(driver.defaultCar) === String(carId))
          throw new ApolloError('Driver is online with this car.', '400')
      })
    }
    for (let index = 0; index < idSet.length; index++) {
      const carId = idSet[index]
      const driverSet: any[] = await driverSchema.find({ car: { $all: [carId] } })
      driverSet.map(async driver => {
        _.remove(driver.car, o => String(o) === String(carId))
        await driverService.findOneAndUpdate(driver._id, {
          car: driver.car,
          defaultCar: String(carId) === String(driver.defaultCar) ? null : driver.defaultCar
        })
      })
    }

    return idSet.map(id => service.findOneAndUpdate(id, { isDeleted: true }))
  }
})(service)
