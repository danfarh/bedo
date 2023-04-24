/* eslint-disable no-await-in-loop */
import { ApolloError } from 'apollo-server-express'
import { Types } from 'mongoose'
import service from './service'
import controllerBase from '../../utils/controllerBase'

export default new (class Controller extends controllerBase {
  async createLegalByAdmin(legalInput, adminId) {
    if (!legalInput.title.length) {
      throw new ApolloError('title can not be empty', '400')
    }
    if (!legalInput.description.length) {
      throw new ApolloError('description can not be empty', '400')
    }
    for (let index = 0; index < legalInput.title.length; index++) {
      const objOfLegalTitle = legalInput.title[index]
      const existenceLegalSet = await service.find({
        title: { $elemMatch: { value: objOfLegalTitle.value } }
      })
      if (existenceLegalSet.length) {
        throw new ApolloError('Legal with this title exists.', '400')
      }
    }
    return service.create({ ...legalInput, admin: adminId })
  }

  async getLegal(id, language: String) {
    return service.findOneFromView({ _id: id }, language)
  }

  async getLegals(Pagination, getLegalsQuery, sort = { order: 1 }, language: String) {
    return service.findFromView(getLegalsQuery, Pagination, sort, language)
  }

  async getLegalsCount(filters, language) {
    return this.service.countFromView(filters, language)
  }

  async getLegalByAdmin(id) {
    return service.findOne({ _id: id })
  }

  async getLegalsByAdmin(Pagination, getLegalsQuery, sort = { order: 1 }) {
    return service.find(getLegalsQuery, Pagination, sort)
  }

  async getLegalsCountByAdmin(filters) {
    return this.service.count(filters)
  }

  async updateLegalByAdmin(id: Types.ObjectId, legalInput) {
    if (!legalInput.title) {
      throw new ApolloError('title can not be empty', '400')
    }
    if (!legalInput.description) {
      throw new ApolloError('description can not be empty', '400')
    }
    const legal = await service.findOne({ title: legalInput.title })

    if (legal && String(legal._id) !== String(id)) {
      throw new ApolloError('legal with this title exists', '400')
    }
    return service.findOneAndUpdate({ _id: id }, legalInput)
  }

  async removeLegalByAdmin(idSet: Types.ObjectId[]) {
    for (let index = 0; index < idSet.length; index++) {
      const id = idSet[index]
      const legal = await service.findOne({ _id: id, isDeleted: false })
      if (!legal) throw new ApolloError('Legal does not exist.')
    }
    return idSet.map(id => service.findOneAndUpdate(id, { isDeleted: true }))
  }
})(service)
