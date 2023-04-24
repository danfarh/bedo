// database request
import { Types } from 'mongoose'
import { ApolloError } from 'apollo-server-express'
import Car from './schema'
import driverService from '../driver/service'
import tripService from '../trip/service'
import ServiceBase from '../../utils/serviceBase'
import { Pagination } from '../../utils/interfaces'

export default new (class service extends ServiceBase {
  async find(
    filters: Object = {},
    pagination: Pagination = {
      skip: 0,
      limit: 15
    },
    sort: Object = { createdAt: -1 }
  ): Promise<Array<any>> {
    const carSet = await this.model
      .find({ ...filters, isDeleted: false })
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
    return Promise.all(
      carSet.map(async car => {
        const driverWorkStatus = await this.findDriverWorkStatus(car)
        car.status = driverWorkStatus
        return car
      })
    )
  }

  async findDriverWorkStatus(car) {
    const driver = await driverService.findOne({ car: { $in: [car._id] } })
    if (String(car._id) === String(driver.defaultCar)) {
      const driverDefaultCar = await this.findById(driver.defaultCar)
      if (driverDefaultCar.isInTrip) return 'INTRIP'
      if (!driver.workStatus) return 'OFFLINE'
      return driver.workStatus === 'ACTIVE' ? 'ONLINE' : 'OFFLINE'
    }
    return 'OFFLINE'
  }

  async findOne(filters: String | Types.ObjectId | Object): Promise<any> {
    if (typeof filters === 'string' || filters instanceof Types.ObjectId) {
      // eslint-disable-next-line no-param-reassign
      filters = {
        _id: filters
      }
    }
    return this.model.findOne({ ...filters, isDeleted: false })
  }

  async count(filters: Object = {}): Promise<number> {
    return this.model.countDocuments({ ...filters, isDeleted: false })
  }

  async changeIsInTrip(id: Types.ObjectId, value: boolean) {
    return Car.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          isInTrip: value
        }
      },
      {
        new: true
      }
    )
  }

  async findById(_id) {
    return this.findOne({ _id })
  }
})(Car)
