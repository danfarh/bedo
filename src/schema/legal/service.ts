// database request
import { Types } from 'mongoose'
import Legal, { legalsViews } from './schema'
import ServiceBase from '../../utils/serviceBase'

export default new (class service extends ServiceBase {
  async findById(_id) {
    return Legal.findOne({ _id })
  }
})(Legal, legalsViews)
