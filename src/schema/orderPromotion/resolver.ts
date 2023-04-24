import controller from './controller'
import shopService from '../shop/service'
// const { AuthenticationError } = require('apollo-server-express')

const resolver: any = {
  Query: {
    getOrderPromotionsByAdmin: async (parent, { filters, pagination, sort }) => {
      return controller.getOrderPromotionsByAdmin(filters, pagination, sort)
    },
    getOrderPromotionsByAdminCount: async (parent, { filters }) => {
      return controller.getOrderPromotionsByAdminCount(filters)
    },
    getOrderPromotions: async (parent, { filters, pagination, sort }, { user }) => {
      return controller.getOrderPromotions(user.sub, filters, pagination, sort)
    },
    getMyOrderPromotions: async (parent, { pagination, sort }, { user }) => {
      return controller.getMyOrderPromotions(user.sub, pagination, sort)
    },
    checkPromotionIsValid: async (parent, { code, shop, order, totalPrice }, { user }, info) => {
      return controller.checkPromotionCodeIsValid(user, shop, code, order, totalPrice)
    },
    getOrderPromotionsCount: async (parent, { filters }, { user }) => {
      return controller.getOrderPromotionsCount(user.sub, filters)
    },
    getOrderPromotion: async (parent, { _id }, { user }) => {
      return controller.getOrderPromotion(_id, user.sub)
    },
    getOrderPromotionsByShopAdmin: async (parent, { filters, pagination, sort }, { user }) => {
      return controller.getOrderPromotionsByShopAdmin(user.shop, filters, pagination, sort)
    },
    getOrderPromotionsByShopAdminCount: async (parent, { filters }, { user }) => {
      return controller.getOrderPromotionsByShopAdminCount(user.shop, filters)
    }
  },
  Mutation: {
    createOrderPromotionByShopAdmin: async (parent, { data }, { user }, info) => {
      return controller.createOrderPromotionByShopAdmin(data, user)
    },
    updateOrderPromotionByShopAdmin: async (parent, { data, promotionId }, { user }, info) => {
      return controller.updateOrderPromotionByShopAdmin(promotionId, data, user)
    },
    deleteOrderPromotionByAdmin: async (parent, { idSet }, { user }) => {
      return controller.deleteOrderPromotionByAdminOrShopAdmin(idSet)
    },
    expireOrderPromotionByShopAdmin: async (parent, { orderPromotionId }, { user }) => {
      return controller.expireOrderPromotionByShopAdmin(orderPromotionId)
    },
    deleteOrderPromotionByShopAdmin: async (parent, { idSet }, { user }) => {
      return controller.deleteOrderPromotionByAdminOrShopAdmin(idSet)
    }
  },
  OrderPromotion: {
    shop: async parent => {
      return shopService.findById(parent.shop)
    }
  }
}

export default resolver
