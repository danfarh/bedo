import { Types } from 'mongoose'
import { ApolloError } from 'apollo-server-express'
import Model from './schema'
import serviceBase from '../../utils/serviceBase'
import { Pagination } from '../../utils/interfaces'

export default new (class service extends serviceBase {
  async find(
    filters: Object = {},
    pagination: Pagination = {
      skip: 0,
      limit: 15
    },
    sort: Object = { createdAt: -1 }
  ): Promise<Array<any>> {
    return this.model
      .find({ ...filters, isDeleted: false })
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
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

  async findById(_id: String | Types.ObjectId): Promise<any> {
    return this.findOne(_id)
  }

  async count(filters: Object = {}): Promise<number> {
    return this.model.countDocuments({ ...filters, isDeleted: false })
  }
})(Model)
