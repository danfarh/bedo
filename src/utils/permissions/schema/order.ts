import * as rules from '../rules'

export default {
  Query: {
    getOrdersDetailByAdmin: rules.isAdmin,
    getOrderByAdmin: rules.isAdmin,
    getOrdersByAdminCount: rules.isAdmin,
    getOrdersByAdmin: rules.isAdmin,
    getOrdersHistory: rules.isUser,
    getOrdersByShopAdmin: rules.isShopAdmin,
    getOrdersByShopAdminCount: rules.isShopAdmin,
    getOrder: rules.isAuthenticated,
    getOrdersCount: rules.isAuthenticated,
    getOrdersHistoryByShopAdmin: rules.isShopAdmin,
    getOrderTracking: rules.isAuthenticated,
    getLastShopOrder: rules.isUser,
    getOrdersHistoryByShopAdminCount: rules.isShopAdmin,
    getOrderByShopAdmin: rules.isShopAdmin,
    getOrdersStatisticsListByShopAdmin: rules.isShopAdmin,
    getOrderStatisticsListCountValuesByShopAdmin: rules.isShopAdmin,
    getFullReportByShopAdmin: rules.isShopAdmin,
    getOrdersStatisticsListByAdmin: rules.isAdmin,
    getOrderStatisticsListCountValuesByAdmin: rules.isAdmin,
    getFullReportByAdmin: rules.isAdmin
  },
  Mutation: {
    // cancelOrderReservation: rules.isUser,
    createOrder: rules.isUser,
    applyPromotionToOrder: rules.isUser,
    orderAcceptance: rules.isUser,
    orderRejection: rules.isUser,
    reCreateOrderDeliveryByShopAdmin: rules.isShopAdmin,
    rejectOrderByShopAdmin: rules.isShopAdmin,
    acceptOrderByShopAdmin: rules.isShopAdmin,
    updateOrderByAdmin: rules.isAdmin,
    deleteOrderByAdmin: rules.isAdmin
  }
}
