import controller from './controller'
import adminController from './adminController'
// const { AuthenticationError } = require('apollo-server-express')

const resolver: any = {
  Query: {
    getTripPromotion: async (parent, { promotionId }, { user }, info) => {
      const result = await controller.get(user, promotionId)
      return result
    },
    getTripPromotions: async (parent, { filters, pagination }, { user }, info) => {
      const result = await controller.index(user, filters, pagination)
      return result
    },
    getMyTripPromotions: async (parent, { pagination, sort }, { user }, info) => {
      const result = await controller.getMyTripPromotions(user, pagination, sort)
      return result
    },
    getTripPromotionsByAdmin: async (parent, { filters, pagination, sort }) => {
      return controller.getTripPromotionsByAdmin(filters, pagination, sort)
    },
    getTripPromotionsByAdminCount: async (parent, { filters }) => {
      return controller.getTripPromotionsByAdminCount(filters)
    }
  },
  Mutation: {
    createTripPromotionByAdmin: async (parent, { data }) => {
      return controller.createTripPromotionByAdmin(data)
    },
    updateTripPromotionByAdmin: async (parent, { data, promotionId }, { user }, info) => {
      const result = await controller.updateTripPromotionByAdmin(promotionId, data)
      return result
    },
    deleteTripPromotionByAdmin: async (parent, { idSet }, { user }, info) => {
      return controller.deleteTripPromotionByAdmin(idSet)
    }
  }
}

export default resolver
