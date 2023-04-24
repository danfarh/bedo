import { ApolloError } from 'apollo-server-express'
import favoritePlacesService from './service'
import checkThatUserExists from '../../utils/checkIfUserExists'
import googleMap from '../../utils/googleMap'

export default new (class Controller {
  mapFavoritePlaceInput(data) {
    if (!data || !data.title || !data.address) {
      throw new ApolloError('favorite place input is invalid')
    }

    if (!data.location || !data.location.lat || !data.location.long) {
      throw new ApolloError('favorite place location is invalid')
    }

    return {
      title: data.title,
      type: 'POINT',
      address: data.address,
      coordinates: [data.location.long, data.location.lat]
    }
  }

  async getFavoritePlaces(user: any) {
    checkThatUserExists(user)
    return favoritePlacesService.findOneForUserOrCreate({
      user: user.userId
    })
  }

  async addFavoritePlace(user: any, input: any) {
    checkThatUserExists(user)
    const data = this.mapFavoritePlaceInput(input)

    const currentFavoritePlaces = await favoritePlacesService.findOneForUserOrCreate({
      user: user.userId
    })
    const updatedResource = favoritePlacesService.findOneAndUpdate(
      { _id: currentFavoritePlaces },
      {
        $push: {
          favorites: data
        }
      }
    )
    return updatedResource
  }

  async updateFavoritePlace(user: any, _id, input) {
    checkThatUserExists(user)
    const currentFavoritePlaces = await favoritePlacesService.findOneForUserOrCreate({
      user: user.userId
    })
    const data = this.mapFavoritePlaceInput(input)

    let index
    if (!currentFavoritePlaces.favorites.length) {
      index = 0
    } else {
      for (const i in currentFavoritePlaces.favorites) {
        if (currentFavoritePlaces.favorites[i]._id.toString() === _id) {
          index = Number(i)
          break
        }
      }
    }
    if (index == null) {
      throw new ApolloError('favorite place not found')
    }

    // update favorites place by index
    const updatedResource = favoritePlacesService.findOneAndUpdate(
      {
        _id: currentFavoritePlaces._id
      },
      {
        [`favorites.${index}`]: {
          _id,
          ...data
        }
      }
    )
    return updatedResource
  }

  async removeFavoritePlace(user: any, _id) {
    checkThatUserExists(user)
    const currentFavoritePlaces = await favoritePlacesService.findOneForUserOrCreate({
      user: user.userId
    })

    if (!currentFavoritePlaces.favorites || !currentFavoritePlaces.favorites.length) {
      return currentFavoritePlaces
    }

    const newFavoritesArray = currentFavoritePlaces.favorites.filter(i => i._id.toString() !== _id)

    // update favorites place by index
    const updatedResource = favoritePlacesService.findOneAndUpdate(
      {
        _id: currentFavoritePlaces._id
      },
      {
        $set: { favorites: newFavoritesArray }
      }
    )
    return updatedResource
  }

  async guessAddress(query) {
    const places = await googleMap
      .placesAutoComplete({
        input: query
      })
      .asPromise()
    return places.json.predictions.map(i => ({ address: i.description, id: i.place_id }))
  }

  async getAddressDetails(addressId) {
    let data
    try {
      data = await googleMap
        .place({
          placeid: addressId
        })
        .asPromise()
    } catch (e) {
      // PM: because of bug in throwing error from module we should handle it
      throw new ApolloError(e.message, '400')
    }
    const placeDetails = data.json.result
    const { formatted_address: address } = placeDetails
    const { lng: long, lat } = placeDetails.geometry.location
    return {
      id: addressId,
      address,
      location: {
        long,
        lat
      }
    }
  }
})()
