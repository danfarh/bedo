/* eslint-disable no-await-in-loop */
import { ApolloError } from 'apollo-server-express'
import { Types } from 'mongoose'
import service from './service'
import controllerBase from '../../utils/controllerBase'

export default new (class Controller extends controllerBase {
  async createShopHowItWorksByAdmin(input) {
    if (!input.title.length) {
      throw new ApolloError('title can not be empty', '400')
    }
    if (!input.description.length) {
      throw new ApolloError('description can not be empty', '400')
    }
    for (let index = 0; index < input.title.length; index++) {
      const objectOfTitle = input.title[index]
      const titleRegex = new RegExp(`^${objectOfTitle.value}$`, 'i')
      const existenceProductSet = await service.find({
        title: { $elemMatch: { value: { $regex: titleRegex }, lang: objectOfTitle.lang } }
      })
      if (existenceProductSet.length) {
        throw new ApolloError('Shop how it works with this title exists', '400')
      }
    }
    return service.create(input)
  }

  async getSingleShopHowItWorks(_id: Types.ObjectId, language) {
    return service.findOneFromView({ _id }, language)
  }

  async getShopHowItWorks(Pagination: any, filters: any, language) {
    return service.findFromView(filters, Pagination, {}, language)
  }

  async getShopHowItWorksCount(filters, language) {
    return service.countFromView(filters, language)
  }

  async getSingleShopHowItWorksByAdmin(_id: Types.ObjectId) {
    return service.findOne({ _id })
  }

  async getShopHowItWorksByAdmin(Pagination: any, filters: any) {
    return service.find(filters, Pagination)
  }

  async getShopHowItWorksCountByAdmin(filters) {
    return service.count(filters)
  }

  async updateShopHowItWorksByAdmin(id: Types.ObjectId, input: any) {
    if (!input.title) {
      throw new ApolloError('title can not be empty', '400')
    }
    if (!input.description) {
      throw new ApolloError('description can not be empty', '400')
    }
    const ShopHowItWorks = await service.findOne({ title: input.title })

    if (ShopHowItWorks && String(ShopHowItWorks._id) !== String(id)) {
      throw new ApolloError('Shop how it works  with this title exists', '400')
    }
    return service.findOneAndUpdate({ _id: id }, input)
  }

  async removeShopHowItWorksByAdmin(idSet: Types.ObjectId[]) {
    for (let index = 0; index < idSet.length; index++) {
      const id = idSet[index]
      const element = await service.findOne({ _id: id, isDeleted: false })
      if (!element) throw new ApolloError('Shop how it works does not exist.')
    }
    return idSet.map(id => service.findOneAndUpdate(id, { isDeleted: true }))
  }
})(service)
