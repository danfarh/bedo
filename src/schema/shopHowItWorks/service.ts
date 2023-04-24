// database request
import { Types } from 'mongoose'
import Model, { shopHowItWorksViews } from './schema'
import ServiceBase from '../../utils/serviceBase'

export default new (class service extends ServiceBase {
  async findById(_id) {
    return Model.findOne({ _id })
  }
})(Model, shopHowItWorksViews)
