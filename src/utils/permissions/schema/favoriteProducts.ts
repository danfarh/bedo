import * as rules from '../rules'

const permissions = {
  Query: {
    getFavoritesProducts: rules.isUser,
    getFavoritesProduct: rules.isUser,
    getFavoritesProductsCount: rules.isUser
  }
}

export default permissions
