import { AuthenticationError } from 'apollo-server-express'
import controller from './controller'
import orderService from '../order/service'
import userService from '../user/service'

const resolver: any = {
  Query: {
    getShopReceipt: async (_, { id }, { user }): Promise<Object> => {
      return controller.getShopReceipt(id, user)
    },
    getShopReceiptByOrderId: async (_, { orderId }, { user }): Promise<Object> => {
      return controller.getShopReceiptByOrderId(orderId, user)
    }
  },
  Mutation: {},
  ShopReceipt: {
    order: async parent => {
      return orderService.findById(parent.order)
    },
    user: async parent => {
      return userService.findById(parent.user)
    }
  }
}

export default resolver
