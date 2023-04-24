// database request
import { Types } from 'mongoose'
import Notification from './schema'
import ServiceBase from '../../utils/serviceBase'

export default new (class service extends ServiceBase {
  async findById(_id) {
    return Notification.findOne({ _id })
  }
})(Notification)
