import { ApolloError } from 'apollo-server-express'
import { Types } from 'mongoose'
import service from './service'
import controllerBase from '../../utils/controllerBase'
import calculation from '../../utils/calculation'
import { RedisDelete } from '../../utils/redis'

export default new (class Controller extends controllerBase {
  async updateReqCarTypeByAdmin(filters: Object, data: Object) {
    const {
      increasePricePercent,
      description,
      DistanceBasePricePerKM,
      PerMinute,
      BookingFee,
      BaseFare,
      maximumPassengersCount,
      maximumWeight
    }: any = data
    const { _id }: any = filters
    if (increasePricePercent < 0) {
      throw new ApolloError('invalid increasePricePercent', '400')
    }
    if (DistanceBasePricePerKM < 0) {
      throw new ApolloError('invalid DistanceBasePricePerKM', '400')
    }
    if (PerMinute < 0) {
      throw new ApolloError('invalid PerMinute ', '400')
    }
    if (BookingFee < 0) {
      throw new ApolloError('invalid BookingFee', '400')
    }
    if (BaseFare < 0) {
      throw new ApolloError('invalid BaseFare', '400')
    }
    if (maximumPassengersCount < 0) {
      throw new ApolloError('invalid maximumPassengersCount', '400')
    }
    if (maximumWeight < 0) {
      throw new ApolloError('invalid maximumWeight', '400')
    }
    if (!description) {
      throw new ApolloError('description cannot be empty', '400')
    }
    const reqCarType = await service.findOneAndUpdate(filters, data)
    if (!reqCarType) {
      throw new ApolloError('reqCarType does not exists', '400')
    }
    await RedisDelete('reqCarTypes')
    await service.findOneAndUpdate(_id, data)
    await calculation.insertReqCarTypesToRedis()
    return reqCarType
  }

  async getReqCarTypesByAdmin(filters: any = {}, pagination, sort) {
    if ('description' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.description = new RegExp(filters.description, 'gi')
    }

    if ('carTypes' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.carTypes = { $in: filters.carTypes }
    }
    return service.find(filters, pagination, sort)
  }

  async getReqCarTypesByAdminCount(filters: any = {}) {
    if ('description' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.description = new RegExp(filters.description, 'gi')
    }

    if ('carTypes' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.carTypes = { $in: filters.carTypes }
    }

    return service.count(filters)
  }

  async getReqCarType(id: Types.ObjectId) {
    const reqCarType = await service.findById(id)
    if (!reqCarType) {
      throw new ApolloError('reqCarType does not exists', '400')
    }
    return reqCarType
  }
})(service)
