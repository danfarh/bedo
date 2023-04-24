/* eslint-disable no-await-in-loop */
import { ApolloError } from 'apollo-server-express'
import { Types } from 'mongoose'
import service from './service'
import controllerBase from '../../utils/controllerBase'

export default new (class Controller extends controllerBase {
  async createReadyMessageByAdmin(input) {
    if (!input.message.length) {
      throw new ApolloError('message can not be empty', '400')
    }
    return service.create(input)
  }

  async updateReadyMessageByAdmin(id, input) {
    if (!input.message) {
      throw new ApolloError('message can not be empty', '400')
    }
    return service.findOneAndUpdate({ _id: id }, input)
  }

  async removeReadyMessageByAdmin(idSet: Types.ObjectId[]) {
    for (let index = 0; index < idSet.length; index++) {
      const id = idSet[index]
      const readyMessage = await service.findOne({ _id: id, isDeleted: false })
      if (!readyMessage) throw new ApolloError('Ready message does not exist.')
    }
    return idSet.map(id => service.findOneAndUpdate(id, { isDeleted: true }))
  }

  async getReadyMessagesByAdmin(filters, pagination, sort) {
    return service.getReadyMessagesByAdmin(filters, pagination, sort)
  }

  async getReadyMessagesByAdminCount(filters) {
    return this.service.count(filters)
  }
})(service)
