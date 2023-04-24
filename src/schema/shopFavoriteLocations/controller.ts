/* eslint-disable no-restricted-syntax */
import { ApolloError } from 'apollo-server-express'
import service from './service'
import controllerBase from '../../utils/controllerBase'
import googleMap from '../../utils/googleMap'

export default new (class Controller extends controllerBase {
  mapFavoritePlaceInput(data) {
    if (!data || !data.title || !data.address) {
      throw new ApolloError('favorite location input is invalid')
    }

    if (!data.location || !data.location.lat || !data.location.long) {
      throw new ApolloError('favorite location is invalid')
    }

    return {
      title: data.title,
      type: 'POINT',
      address: data.address,
      coordinates: [data.location.long, data.location.lat]
    }
  }

  async getShopFavoriteLocations(user: any) {
    return service.findOneForUserOrCreate({
      user: user.userId
    })
  }

  async addShopFavoriteLocation(user: any, input: any) {
    const data = this.mapFavoritePlaceInput(input)

    const currentFavoritePlaces = await service.findOneForUserOrCreate({
      user: user.userId
    })
    const updatedResource = service.findOneAndUpdate(
      { _id: currentFavoritePlaces },
      {
        $push: {
          favorites: data
        }
      }
    )
    return updatedResource
  }

  async updateShopFavoriteLocation(user: any, _id, input) {
    const currentFavoriteLocations = await service.findOneForUserOrCreate({
      user: user.userId
    })
    const data = this.mapFavoritePlaceInput(input)

    let index
    if (!currentFavoriteLocations.favorites.length) {
      index = 0
    } else {
      for (const i in currentFavoriteLocations.favorites) {
        if (currentFavoriteLocations.favorites[i]._id.toString() === _id) {
          index = Number(i)
          break
        }
      }
    }
    if (index == null) {
      throw new ApolloError('favorite location not found')
    }

    // update favorites location by index
    const updatedResource = service.findOneAndUpdate(
      {
        _id: currentFavoriteLocations._id
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

  async removeShopFavoriteLocation(user: any, _id) {
    const currentFavoriteLocations = await service.findOneForUserOrCreate({
      user: user.userId
    })

    if (!currentFavoriteLocations.favorites || !currentFavoriteLocations.favorites.length) {
      return currentFavoriteLocations
    }

    const newFavoritesArray = currentFavoriteLocations.favorites.filter(
      i => i._id.toString() !== _id
    )

    // update favorites location by index
    const updatedResource = service.findOneAndUpdate(
      {
        _id: currentFavoriteLocations._id
      },
      {
        $set: { favorites: newFavoritesArray }
      }
    )
    return updatedResource
  }

  async shopFavoriteLocationsGuessAddress(query) {
    const locations = await googleMap
      .placesAutoComplete({
        input: query
      })
      .asPromise()
    return locations.json.predictions.map(i => ({ address: i.description, id: i.place_id }))
  }

  async shopFavoriteLocationsGetAddressDetails(addressId) {
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
    const locationDetails = data.json.result
    const { formatted_address: address } = locationDetails
    const { lng: long, lat } = locationDetails.geometry.location
    return {
      id: addressId,
      address,
      location: {
        long,
        lat
      }
    }
  }
})(service)
