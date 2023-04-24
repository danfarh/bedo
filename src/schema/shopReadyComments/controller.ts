/* eslint-disable no-await-in-loop */
import { ApolloError } from 'apollo-server-express'
import { Types } from 'mongoose'
import service from './service'
import controllerBase from '../../utils/controllerBase'

export default new (class Controller extends controllerBase {
  async createShopReadyCommentsByAdmin(ShopReadyCommentsInput, adminId) {
    if (!ShopReadyCommentsInput.type.length) {
      throw new ApolloError('type can not be empty', '400')
    }

    for (let index = 0; index < ShopReadyCommentsInput.type.length; index++) {
      const objOfShopReadyCommentsType = ShopReadyCommentsInput.type[index]
      const existenceShopReadyCommentsSet = await service.find({
        type: { $elemMatch: { value: objOfShopReadyCommentsType.value } }
      })
      if (existenceShopReadyCommentsSet.length) {
        throw new ApolloError('ShopReadyComments with this title exists.', '400')
      }
    }
    return service.create({ ...ShopReadyCommentsInput, admin: adminId })
  }

  async getShopReadyComment(id, language: String) {
    return service.findOneFromView({ _id: id }, language)
  }

  async getShopReadyComments(
    Pagination,
    getShopReadyCommentsQuery,
    sort = { order: 1 },
    language: String
  ) {
    return service.findFromView(getShopReadyCommentsQuery, Pagination, sort, language)
  }

  async getShopReadyCommentsCount(filters, language) {
    return this.service.countFromView(filters, language)
  }

  async getShopReadyCommentByAdmin(id) {
    return service.findOne({ _id: id })
  }

  async getShopReadyCommentsByAdmin(Pagination, getShopReadyCommentsQuery, sort = { order: 1 }) {
    return service.find(getShopReadyCommentsQuery, Pagination, sort)
  }

  async getShopReadyCommentsCountByAdmin(filters) {
    return this.service.count(filters)
  }

  async updateShopReadyCommentsByAdmin(id: Types.ObjectId, ShopReadyCommentsInput) {
    if (!ShopReadyCommentsInput.type) {
      throw new ApolloError('title can not be empty', '400')
    }
    const ShopReadyComments = await service.findOne({
      title: ShopReadyCommentsInput.type
    })

    if (ShopReadyComments && String(ShopReadyComments._id) !== String(id)) {
      throw new ApolloError('ShopReadyComments with this title exists', '400')
    }
    return service.findOneAndUpdate({ _id: id }, ShopReadyCommentsInput)
  }

  async removeShopReadyCommentsByAdmin(idSet: Types.ObjectId[]) {
    for (let index = 0; index < idSet.length; index++) {
      const id = idSet[index]
      const ShopReadyComments = await service.findOne({ _id: id, isDeleted: false })
      if (!ShopReadyComments) throw new ApolloError('ShopReadyComments does not exist.')
    }
    return idSet.map(id => service.findOneAndUpdate(id, { isDeleted: true }))
  }
})(service)
