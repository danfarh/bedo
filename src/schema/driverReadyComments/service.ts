import { Types } from 'mongoose'
import Model from './schema'
import serviceBase from '../../utils/serviceBase'
import { driverReadyCommentsViews } from './schema'

export default new (class service extends serviceBase {
  // async getDriverReadyCommentsByAdmin(
  //   filters: any = {},
  //   pagination: any = { skip: 0, limit: 15 },
  //   sort: any = { createdAt: -1 }
  // ) {
  //   return Model.find({
  //     ...filters
  //   })
  //     .skip(pagination.skip)
  //     .limit(pagination.limit)
  //     .sort(sort)
  // }
})(Model, driverReadyCommentsViews)
