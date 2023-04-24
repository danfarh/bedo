/* eslint-disable no-await-in-loop */
import { ApolloError } from 'apollo-server-express'
import { Types } from 'mongoose'
import service from './service'
import tripService from '../trip/service'
import controllerBase from '../../utils/controllerBase'

export default new (class Controller extends controllerBase {
  async createParcelWeightByAdmin(input) {
    if (!input.name) {
      throw new ApolloError('name can not be empty', '400')
    }
    return service.create(input)
  }

  async updateParcelWeightByAdmin(id, input) {
    if (!input.name) {
      throw new ApolloError('name can not be empty', '400')
    }
    return service.findOneAndUpdate({ _id: id }, input)
  }

  async removeParcelWeightByAdmin(idSet: Types.ObjectId[]) {
    for (let index = 0; index < idSet.length; index++) {
      const id = idSet[index]
      const parcelWeight = await service.findOne({ _id: id, isDeleted: false })
      if (!parcelWeight) throw new ApolloError('Parcel weight does not exist.')
      const tripSet = await tripService.find({
        optionsPriceDetails: { $elemMatch: { option: parcelWeight.name } }
      })
      if (tripSet.length)
        throw new ApolloError('Parcel weight is used by at least one trip(s)', '400')
    }
    return idSet.map(id => service.findOneAndUpdate(id, { isDeleted: true }))
  }

  async getParcelWeights(filters, pagination, sort) {
    return service.getParcelWeights(filters, pagination, sort)
  }

  async getParcelWeightsByAdminCount(filters) {
    return this.service.count(filters)
  }
})(service)
