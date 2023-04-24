import controller from './controller'
import ResolverBase from '../../utils/resolverBase'
import userService from '../user/service'
import cartService from '../cart/service'
import paymentService from '../payment/service'
import productService from '../product/service'
import promotionService from '../orderPromotion/service'
import categoryService from '../category/service'
import shopService from '../shop/service'
import pubsub, { withFilter } from '../../utils/pubsub'
import { UPDATE_ORDER, CREATE_ORDER } from '../../utils/pubsubKeys'
import tripService from '../trip/service'

const resolverBase = new ResolverBase(controller)

const resolver: any = {
  Query: {
    getOrdersByAdmin: async (_, { filters, pagination, sort }, { user }) => {
      return controller.getOrdersByAdmin(filters, pagination, sort)
    },
    getOrdersByAdminCount: async (_, { filters }, { user }) => {
      return controller.getOrdersByAdminCount(filters)
    },
    getOrderByAdmin: async (_, { id }, { user }) => {
      return controller.getOrderByAdmin(id)
    },
    getOrder: resolverBase.query.get,
    getOrdersCount: resolverBase.query.count,
    getOrdersHistory(parent, { filters, pagination, sort }, { user }) {
      return controller.getHistory(user, filters, pagination, sort)
    },
    getOrdersHistoryByShopAdmin(parent, { filters, pagination, sort }, { user }) {
      return controller.getOrdersHistoryByShopAdmin(user, filters, pagination, sort)
    },
    getOrdersHistoryByShopAdminCount: async (parent, { filters }, { user }) => {
      return controller.getOrdersHistoryByShopAdminCount(user, filters)
    },
    getOrderTracking(parent, { trackId }, { user }) {
      return controller.get(user, { orderTracking: { trackId } })
    },
    getOrdersDetailByAdmin(parent, { filters, sort }, ctx, info) {
      return controller.getOrdersDetailByAdmin(filters, sort)
    },
    getLastShopOrder: async (_, args, { user }) => {
      return controller.getLastShopOrder(user)
    },
    getOrdersByShopAdmin: async (parent, { filters, pagination, sort }, { user }) => {
      return controller.getOrdersByShopAdmin(user, filters, pagination, sort)
    },
    getOrderByShopAdmin: async (parent, { id }, { user }) => {
      return controller.getOrderByShopAdmin(user, id)
    },
    getOrdersByShopAdminCount: async (parent, { filters }, { user }) => {
      return controller.getOrdersByShopAdminCount(user, filters)
    },
    getShopTotalOrdersCountAndTotalAmountByShopAdmin: (parent, { filters }, { user }, info) => {
      return controller.getShopTotalOrdersAndTotalAmountByShopAdmin(filters, user.shop)
    },
    getOrderStatisticsListCountValuesByShopAdmin: async (parent, { filters }, { user }) => {
      return controller.getOrderStatisticsListCountValuesByShopAdmin(user, filters)
    },
    getFullReportByShopAdmin: async (parent, { pagination }, { user }) => {
      return controller.getFullReportByShopAdmin(user, pagination)
    },
    getOrdersStatisticsListByShopAdmin: (parent, { filters }, { user }) => {
      return controller.getOrdersStatisticsListByShopAdmin(user, filters)
    },
    getOrderStatisticsListCountValuesByAdmin: async (parent, { shopId, filters }, { user }) => {
      return controller.getOrderStatisticsListCountValuesByAdmin(shopId, filters)
    },
    getFullReportByAdmin: async (parent, { shopId, pagination }, { user }) => {
      return controller.getFullReportByAdmin(shopId, pagination)
    },
    getOrdersStatisticsListByAdmin: (parent, { shopId, filters }, { user }) => {
      return controller.getOrdersStatisticsListByAdmin(shopId, filters)
    }
  },
  Mutation: {
    createOrder: async (parent, { inputs, onlyCalculate }, { user, language }) => {
      return controller.createOrder(user, inputs, onlyCalculate, language)
    },
    applyPromotionToOrder: async (parent, { _id, inputs }, { user, language }) => {
      return controller.applyPromotionToOrder(user, _id, inputs, language)
    },
    orderAcceptance(parent, { category }, { user }, info) {
      return controller.orderAcceptance(category, user)
    },
    // cancelOrderReservation: async (parent, { orderId }, { user }) => {
    //   return controller.cancelReservation(orderId, user.sub)
    // },
    reCreateOrderDeliveryByShopAdmin: async (parent, { orderId, reserve }, { user }) => {
      return controller.reCreateOrderDelivery(user, orderId, reserve)
    },
    rejectOrderByShopAdmin: async (parent, { orderId, rejectedFor }, { user }) => {
      return controller.rejectOrder(user, orderId, rejectedFor)
    },
    acceptOrderByShopAdmin: async (parent, { inputs, orderId }, { user }) => {
      return controller.acceptOrder(inputs, orderId, user)
    },
    updateOrderByAdmin: async (parent, { inputs, orderId }, { user }) => {
      return controller.updateOrderByAdmin(inputs, orderId)
    },
    deleteOrderByAdmin: async (parent, { orderId }, { user }) => {
      return controller.deleteOrderByAdmin(orderId)
    },
    finishedOrder: async (parent, { orderId }) => {
      return controller.finishedOrder(orderId)
    }
  },
  Subscription: {
    updateOrder: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(UPDATE_ORDER),
        async (payload, { orderId }, { user }) => {
          if (orderId && payload.updateOrder._id.toString() !== orderId) {
            return false
          }
          if (user.roles === 'SUPER_ADMIN') {
            return true
          }
          if (payload.updateOrder.user.toString() === user.sub) {
            return true
          }
          const shop = await shopService.findById(payload.updateOrder.shop)
          if (!shop) {
            return false
          }
          const shopId = shop._id.toString()
          return !!(user.roles === 'SHOP_ADMIN' && user.shop === shopId)
        }
      )
    },
    createOrder: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(CREATE_ORDER),
        async (payload, variables, { user }) => {
          if (user.roles === 'SUPER_ADMIN') {
            return true
          }
          const shop = await shopService.findById(payload.createOrder.shop)
          if (!shop) {
            return false
          }
          const shopId = shop._id.toString()
          return !!(user.roles === 'SHOP_ADMIN' && user.shop === shopId)
        }
      )
    }
  },
  Order: {
    user(parent, args, ctx, info) {
      return userService.findById(parent.user)
    },
    cart(parent, args, ctx, info) {
      return cartService.findById(parent.cart)
    },
    payment(parent, args, ctx, info) {
      return paymentService.findById(parent.payment)
    },
    shop(parent, args, ctx, info) {
      return shopService.findById(parent.shop)
    },
    promotion(parent, args, ctx, info) {
      return promotionService.findById(parent.promotion)
    },
    trip(parent, args, ctx, info) {
      return tripService.findOne({ shopOrder: parent._id })
    }
  },
  Cart: {
    rootCategory(parent, args, ctx, info) {
      return categoryService.findById(parent.rootCategory)
    },
    shop(parent, args, ctx, info) {
      return shopService.findById(parent.shop)
    }
  },
  CartProduct: {
    product: async (parent, _, { language }) => {
      const product: any = await productService.findOneFromView({ _id: parent.product }, language)
      if (product) {
        return productService.fixProduct(product, parent.detailId)
      }
      return product
    }
  }
}

export default resolver
