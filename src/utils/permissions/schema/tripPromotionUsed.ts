import * as rules from '../rules'

export default {
  Mutation: {
    usePromotion: rules.isUser,
    checkTripPromotion: rules.isUser
  }
}
