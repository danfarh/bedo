import * as rules from '../rules'

const permissions = {
  Query: {
    getUserCart: rules.isUser,
    getCart: rules.isUser
  },
  Mutation: {
    updateCart: rules.isUser,
    resetCart: rules.isUser,
    cartVerification: rules.isUser,
    cartRejection: rules.isUser
  }
}

export default permissions
