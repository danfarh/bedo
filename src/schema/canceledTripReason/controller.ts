/* eslint-disable no-await-in-loop */
import { ApolloError } from 'apollo-server-express'
import { Types } from 'mongoose'
import service from './service'
import controllerBase from '../../utils/controllerBase'

export default new (class Controller extends controllerBase {
  async createCanceledTripReasonByAdmin(input) {
    if (!input.title.length) {
      throw new ApolloError('title can not be empty', '400')
    }
    return service.create(input)
  }

  async updateCanceledTripReasonByAdmin(id, input) {
    if (!input.title) {
      throw new ApolloError('title can not be empty', '400')
    }
    return service.findOneAndUpdate({ _id: id }, input)
  }

  async removeCanceledTripReasonByAdmin(idSet: Types.ObjectId[]) {
    for (let index = 0; index < idSet.length; index++) {
      const id = idSet[index]
      const cancelTripReason = await service.findOne({ _id: id, isDeleted: false })
      if (!cancelTripReason) throw new ApolloError('Cancel trip reason does not exist.')
    }
    return idSet.map(id => service.findOneAndUpdate(id, { isDeleted: true }))
  }

  async getCanceledTripReasonsByAdmin(filters, pagination, sort) {
    return service.getCanceledTripReasonsByAdmin(filters, pagination, sort)
  }

  async getCanceledTripReasonsByAdminCount(filters) {
    return this.service.count(filters)
  }
})(service)
