import controller from './controller'
import userService from '../user/service'

const resolver: any = {
  Query: {
    async getShopFavoriteLocations(parent, args, { user }) {
      return controller.getShopFavoriteLocations(user)
    },
    async shopFavoriteLocationsGuessAddress(parent, { query }) {
      return controller.shopFavoriteLocationsGuessAddress(query)
    },
    async shopFavoriteLocationsGetAddressDetails(parent, { addressId }) {
      return controller.shopFavoriteLocationsGetAddressDetails(addressId)
    }
  },
  Mutation: {
    async addShopFavoriteLocation(parent, { favoriteLocationInput }, { user }) {
      return controller.addShopFavoriteLocation(user, favoriteLocationInput)
    },
    async updateShopFavoriteLocation(parent, { _id, favoriteLocationInput }, { user }) {
      return controller.updateShopFavoriteLocation(user, _id, favoriteLocationInput)
    },
    async removeShopFavoriteLocation(parent, { _id }, { user }) {
      return controller.removeShopFavoriteLocation(user, _id)
    }
  },
  ShopFavoriteLocations: {
    async user(parent) {
      return userService.findById(parent.user)
    }
  }
}

export default resolver
