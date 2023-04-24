import { ApolloError } from 'apollo-server-express'
import { Types } from 'mongoose'
import service from './service'
import controllerBase from '../../utils/controllerBase'

export default new (class Controller extends controllerBase {
  async getShopReceipt(_id: Types.ObjectId, user) {
    return service.findOne({ _id, user: user.userId })
  }

  async getShopReceiptByOrderId(orderId: Types.ObjectId, user) {
    return service.findOne({ user: user.userId, order: orderId })
  }
})(service)
