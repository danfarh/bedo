import Model, { carTypesViews } from './schema'
import serviceBase from '../../utils/serviceBase'

export default new (class service extends serviceBase {
  async findAll() {
    const result = await Model.find().exec()
    return result
  }
})(Model, carTypesViews)
