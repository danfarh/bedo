/* eslint-disable no-await-in-loop */
import { ApolloError } from 'apollo-server-express'
import { Types } from 'mongoose'
import service from './service'
import tripService from '../trip/service'
import controllerBase from '../../utils/controllerBase'

export default new (class Controller extends controllerBase {
  async createParcelVolumeByAdmin(input) {
    if (!input.name) {
      throw new ApolloError('name can not be empty', '400')
    }
    return service.create(input)
  }

  async updateParcelVolumeByAdmin(id, input) {
    if (!input.name) {
      throw new ApolloError('name can not be empty', '400')
    }
    return service.findOneAndUpdate({ _id: id }, input)
  }

  async removeParcelVolumeByAdmin(idSet: Types.ObjectId[]) {
    for (let index = 0; index < idSet.length; index++) {
      const id = idSet[index]
      const parcelVolume = await service.findOne({ _id: id, isDeleted: false })
      if (!parcelVolume) throw new ApolloError('Parcel volume does not exist.')
      const tripSet = await tripService.find({
        optionsPriceDetails: { $elemMatch: { option: parcelVolume.name } }
      })
      if (tripSet.length)
        throw new ApolloError('Parcel volume is used by at least one trip(s)', '400')
    }
    return idSet.map(id => service.findOneAndUpdate(id, { isDeleted: true }))
  }

  async getParcelVolumes(filters, pagination, sort) {
    return service.getParcelVolumes(filters, pagination, sort)
  }

  async getParcelVolumesByAdminCount(filters) {
    return this.service.count(filters)
  }
})(service)
