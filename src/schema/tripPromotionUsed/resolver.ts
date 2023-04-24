import controller from './controller'
// const { AuthenticationError } = require('apollo-server-express')

const resolver: any = {
  Query: {},
  Mutation: {
    usePromotion: async (parent, { data }, { user }, info) => {
      const { promotionCode, usedFor } = data
      const result = await controller.usePromotion(promotionCode, usedFor, user, false, null)
      return result
    },
    checkTripPromotion: async (parent, { promotionCode, tripType, totalPrice }, { user }) => {
      const result = await controller.checkPromotion(promotionCode, tripType, user, totalPrice)
      return result
    }
  }
}

export default resolver
