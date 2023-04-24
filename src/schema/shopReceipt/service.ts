// database request
import { Types } from 'mongoose'
import ShopReceipt from './schema'
import ServiceBase from '../../utils/serviceBase'

export default new (class service extends ServiceBase {
  async findById(_id) {
    return ShopReceipt.findOne({ _id })
  }
})(ShopReceipt)
