import { ApolloError } from 'apollo-server-express'
import googleMap from '../../utils/googleMap'
import service from './service'
import controllerBase from '../../utils/controllerBase'

export default new (class Controller extends controllerBase {
  async addRegion(regions) {
    await service.deleteMany()
    regions.forEach(async name => {
      await service.create({ name })
    })
    return true
  }

  async getRegions(pagination, sort) {
    return service.find({}, pagination, sort)
  }

  async updateRegion(id, name) {
    return service.findOneAndUpdate(id, { name })
  }

  async checkTripIsInRegions(tripInput) {
    const dbRegions = await service.find()
    const Regions = dbRegions.map(r => r.name)
    // check origin
    const OriginStates = await this.getStateFromLongLat(tripInput.origin)
    if (OriginStates.length === 0) {
      throw new ApolloError('we do not provide service in your starting point.', '400')
    }
    if (!this.isRegionsIncludeStates(Regions, OriginStates)) {
      throw new ApolloError(
        `starting point of your trip is in ${OriginStates[0]} which we currently don't provide service yet.`,
        '400'
      )
    }

    // check destinations
    const states = await Promise.all(
      tripInput.destinations.map(async destination => {
        const result = await this.getStateFromLongLat(destination)
        return result
      })
    )
    states.forEach((state: any, index) => {
      if (state.length === 0) {
        throw new ApolloError(
          `we do not provide service in your ${this.getOrdinalNumber(index + 1)} destination.`,
          '400'
        )
      }
      if (!this.isRegionsIncludeStates(Regions, state)) {
        throw new ApolloError(
          `your ${this.getOrdinalNumber(index + 1)} destination is in ${
            state[0]
          } which we currently don't provide service yet.`,
          '400'
        )
      }
    })
  }

  getOrdinalNumber(number) {
    if (number % 10 === 1) return `${number}st`
    if (number % 10 === 2) return `${number}nd`
    if (number % 10 === 3) return `${number}rd`
    return `${number}th`
  }

  async checkLocationIsInRegions(location) {
    const dbRegions = await service.find()
    const Regions = dbRegions.map(r => r.name)
    // check origin
    const OriginStates = await this.getStateFromLongLat(location)
    if (!this.isRegionsIncludeStates(Regions, OriginStates)) {
      throw new ApolloError(
        `your are in ${OriginStates[0]} which currently we don't provide service yet`,
        '400'
      )
    }
  }

  isRegionsIncludeStates(regions, states) {
    return !!regions.find(region => {
      return states.find(state => state.toLocaleLowerCase() === region.toLocaleLowerCase())
    })
  }

  async getStateFromLongLat(location) {
    const states: String[] = []
    const locationArray = Array.isArray(location)
      ? Object.values(location)
      : [location.lat, location.long]
    try {
      const res: any = await googleMap
        .reverseGeocode({ latlng: locationArray.join(',') })
        .asPromise()
      // console.log('res from geocode :', res)
      if (!res || !res.json || !res.json.results || !res.json.results[0]) {
        return []
      }
      res.json.results.forEach(result => {
        result.address_components.forEach(AC => {
          if (AC.types.includes('administrative_area_level_2')) {
            states.push(AC.long_name)
          }
        })
      })
    } catch (e) {
      console.log(e.json.error_message)
    }
    return states
  }
})(service)
