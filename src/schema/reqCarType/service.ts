import Model from './schema'
import serviceBase from '../../utils/serviceBase'

export default new (class service extends serviceBase {
  async findAll() {
    const result = await Model.find().exec()
    return result
  }

  async findOneWithCarTypes(whereCondition: Object) {
    const result = await Model.findOne(whereCondition)
      .populate('carTypes')
      .exec()
    return result
  }
})(Model)
