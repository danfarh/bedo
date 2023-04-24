import * as rules from '../rules'

const permissions = {
  Query: {
    favoritePlaces: rules.isUser,
    guessAddress: rules.isAuthenticated,
    getAddressDetails: rules.isAuthenticated
  },
  Mutation: {
    addFavoritePlace: rules.isUser,
    updateFavoritePlace: rules.isUser,
    removeFavoritePlace: rules.isUser
  }
}

export default permissions
