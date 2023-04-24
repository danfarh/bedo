// database request
import { Types } from 'mongoose'
import { ApolloError } from 'apollo-server-express'
import moment from 'moment'
import Advertisement, { advertisementsViews } from './schema'
import ServiceBase from '../../utils/serviceBase'

export default new (class service extends ServiceBase {
  async findById(_id) {
    return this.findOne(_id)
  }

  async find(query, pagination, sort) {
    if (query && query.startAt) {
      query.startAt = { $gte: query.startAt }
    }
    if (query && query.endAt) {
      query.endAt = { $lte: query.endAt }
    }
    if ('onlyActiveAds' in query && query.onlyActiveAds) {
      query.startAt = {
        $lte: moment()
          .utc()
          .endOf('date')
          .toDate()
      }
      delete query.onlyActiveAds
    }
    return Advertisement.find({ ...query, isDeleted: false })
      .sort(sort)
      .skip(pagination ? pagination.skip : 0)
      .limit(pagination ? pagination.limit : 15)
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
})(Advertisement, advertisementsViews)
