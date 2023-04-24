import Model from './schema'
import serviceBase from '../../utils/serviceBase'

export default new (class service extends serviceBase {
  async findAll() {
    const result = await Model.find().exec()
    return result
  }

  async getParcelWeights(
    filters: any = {},
    pagination: any = { skip: 0, limit: 15 },
    sort: any = { order: 1 }
  ) {
    return Model.find({
      ...filters
    })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .sort(sort)
  }
})(Model)
