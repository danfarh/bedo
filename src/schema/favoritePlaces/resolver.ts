import controller from './controller'
import userService from '../user/service'

const resolver: any = {
  Query: {
    async favoritePlaces(parent, args, { user }) {
      return controller.getFavoritePlaces(user)
    },
    async guessAddress(parent, { query }) {
      return controller.guessAddress(query)
    },
    async getAddressDetails(parent, { addressId }) {
      return controller.getAddressDetails(addressId)
    }
  },
  Mutation: {
    async addFavoritePlace(parent, { favoritePlaceInput }, { user }) {
      return controller.addFavoritePlace(user, favoritePlaceInput)
    },
    async updateFavoritePlace(parent, { _id, favoritePlaceInput }, { user }) {
      return controller.updateFavoritePlace(user, _id, favoritePlaceInput)
    },
    async removeFavoritePlace(parent, { _id }, { user }) {
      return controller.removeFavoritePlace(user, _id)
    }
  },
  FavoritePlaces: {
    async user(parent) {
      return userService.findById(parent.user)
    }
  }
}

export default resolver
