import Model, { readMessagesViews } from './schema'
import serviceBase from '../../utils/serviceBase'

export default new (class service extends serviceBase {
  async getReadyMessagesByAdmin(
    filters: any = {},
    pagination: any = { skip: 0, limit: 15 },
    sort: any = { createdAt: -1 }
  ) {
    return Model.find({
      ...filters
    })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .sort(sort)
  }
})(Model, readMessagesViews)
