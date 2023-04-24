import * as rules from '../rules'

export default {
  Query: {
    getOrderPromotionsByAdmin: rules.isAdmin,
    getOrderPromotionsByAdminCount: rules.isAdmin,
    getOrderPromotions: rules.isUser,
    getOrderPromotion: rules.isAuthenticated,
    getOrderPromotionsCount: rules.isUser,
    getMyOrderPromotions: rules.isUser,
    getOrderPromotionsByShopAdmin: rules.isShopAdmin,
    getOrderPromotionsByShopAdminCount: rules.isShopAdmin,
    checkPromotionIsValid: rules.isUser
  },
  Mutation: {
    createOrderPromotionByShopAdmin: rules.isShopAdmin,
    updateOrderPromotionByShopAdmin: rules.isShopAdmin,
    deleteOrderPromotionByAdmin: rules.isAdmin,
    deleteOrderPromotionByShopAdmin: rules.isShopAdmin
  }
}
