/* eslint-disable no-await-in-loop */
import { ApolloError } from 'apollo-server-express'
import { Types } from 'mongoose'
import service from './service'
import controllerBase from '../../utils/controllerBase'

export default new (class Controller extends controllerBase {
  async createPassengerReadyCommentsByAdmin(PassengerReadyCommentsInput, adminId) {
    if (!PassengerReadyCommentsInput.type.length) {
      throw new ApolloError('type can not be empty', '400')
    }

    for (let index = 0; index < PassengerReadyCommentsInput.type.length; index++) {
      const objOfPassengerReadyCommentsType = PassengerReadyCommentsInput.type[index]
      const existencePassengerReadyCommentsSet = await service.find({
        type: { $elemMatch: { value: objOfPassengerReadyCommentsType.value } }
      })
      if (existencePassengerReadyCommentsSet.length) {
        throw new ApolloError('PassengerReadyComments with this title exists.', '400')
      }
    }
    return service.create({ ...PassengerReadyCommentsInput, admin: adminId })
  }

  async getPassengerReadyComment(id, language: String) {
    return service.findOneFromView({ _id: id }, language)
  }

  async getPassengerReadyComments(
    Pagination,
    getPassengerReadyCommentsQuery,
    sort = { order: 1 },
    language: String
  ) {
    return service.findFromView(getPassengerReadyCommentsQuery, Pagination, sort, language)
  }

  async getPassengerReadyCommentsCount(filters, language) {
    return this.service.countFromView(filters, language)
  }

  async getPassengerReadyCommentByAdmin(id) {
    return service.findOne({ _id: id })
  }

  async getPassengerReadyCommentsByAdmin(
    Pagination,
    getPassengerReadyCommentsQuery,
    sort = { order: 1 }
  ) {
    return service.find(getPassengerReadyCommentsQuery, Pagination, sort)
  }

  async getPassengerReadyCommentsCountByAdmin(filters) {
    return this.service.count(filters)
  }

  async updatePassengerReadyCommentsByAdmin(id: Types.ObjectId, PassengerReadyCommentsInput) {
    if (!PassengerReadyCommentsInput.type) {
      throw new ApolloError('title can not be empty', '400')
    }
    const PassengerReadyComments = await service.findOne({
      title: PassengerReadyCommentsInput.type
    })

    if (PassengerReadyComments && String(PassengerReadyComments._id) !== String(id)) {
      throw new ApolloError('PassengerReadyComments with this title exists', '400')
    }
    return service.findOneAndUpdate({ _id: id }, PassengerReadyCommentsInput)
  }

  async removePassengerReadyCommentsByAdmin(idSet: Types.ObjectId[]) {
    for (let index = 0; index < idSet.length; index++) {
      const id = idSet[index]
      const PassengerReadyComments = await service.findOne({ _id: id, isDeleted: false })
      if (!PassengerReadyComments) throw new ApolloError('PassengerReadyComments does not exist.')
    }
    return idSet.map(id => service.findOneAndUpdate(id, { isDeleted: true }))
  }
})(service)
