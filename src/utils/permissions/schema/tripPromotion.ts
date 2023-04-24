import * as rules from '../rules'

export default {
  Query: {
    getTripPromotionsByAdmin: rules.isAdmin,
    getTripPromotionsByAdminCount: rules.isAdmin,
    getMyTripPromotions: rules.isUser,
    getTripPromotion: rules.isAuthenticated,
    getTripPromotions: rules.isAuthenticated
  },
  Mutation: {
    createTripPromotionByAdmin: rules.isAdmin,
    updateTripPromotionByAdmin: rules.isAdmin,
    deleteTripPromotionByAdmin: rules.isAdmin
  }
}
