// database request
import { Types } from 'mongoose'
import Help, { helpsViews } from './schema'
import ServiceBase from '../../utils/serviceBase'

export default new (class service extends ServiceBase {
  async findById(_id) {
    return Help.findOne({ _id })
  }
})(Help, helpsViews)
