// database request
import { Types } from 'mongoose'
import ErrorSchema, { errorsViews } from './schema'
import ServiceBase from '../../utils/serviceBase'

export default new (class service extends ServiceBase {
  async findById(_id) {
    return ErrorSchema.findOne({ _id })
  }
})(ErrorSchema, errorsViews)
