import * as rules from '../rules'

export default {
  Query: {
    getTripOrdersDetailByAdmin: rules.isAdmin,
    getLastTripOrder: rules.isUser,
    getTripOrdersHistory: rules.isUser,
    getTripOrder: rules.isAuthenticated,
    getTripOrdersCount: rules.isAuthenticated,
    getTripOrders: rules.isAuthenticated
  },
  Mutation: {
    createTripOrder: rules.isAuthenticated,
    skipCommentOnTrip: rules.isUser
  }
}
