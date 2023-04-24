import * as rules from '../rules'

const permissions = {
  Query: {
    getShopFavoriteLocations: rules.isUser,
    shopFavoriteLocationsGuessAddress: rules.isAuthenticated,
    shopFavoriteLocationsGetAddressDetails: rules.isAuthenticated
  },
  Mutation: {
    addShopFavoriteLocation: rules.isUser,
    updateShopFavoriteLocation: rules.isUser,
    removeShopFavoriteLocation: rules.isUser
  }
}

export default permissions
