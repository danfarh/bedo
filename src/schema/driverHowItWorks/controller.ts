/* eslint-disable no-await-in-loop */
import { ApolloError } from 'apollo-server-express'
import { Types } from 'mongoose'
import service from './service'
import controllerBase from '../../utils/controllerBase'

export default new (class Controller extends controllerBase {
  async createDriverHowItWorksByAdmin(input) {
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
        throw new ApolloError('driver how it works with this title exists', '400')
      }
    }
    return service.create(input)
  }

  async getSingleDriverHowItWorks(_id: Types.ObjectId, language) {
    return service.findOneFromView({ _id }, language)
  }

  async getDriverHowItWorks(Pagination: any, filters: any, language) {
    return service.findFromView(filters, Pagination, {}, language)
  }

  async getDriverHowItWorksCount(filters, language) {
    return service.countFromView(filters, language)
  }

  async getSingleDriverHowItWorksByAdmin(_id: Types.ObjectId) {
    return service.findOne({ _id })
  }

  async getDriverHowItWorksByAdmin(Pagination: any, filters: any) {
    return service.find(filters, Pagination)
  }

  async getDriverHowItWorksCountByAdmin(filters) {
    return service.count(filters)
  }

  async updateDriverHowItWorksByAdmin(id: Types.ObjectId, input: any) {
    if (!input.title) {
      throw new ApolloError('title can not be empty', '400')
    }
    if (!input.description) {
      throw new ApolloError('description can not be empty', '400')
    }
    const driverHowItWorks = await service.findOne({ title: input.title })

    if (driverHowItWorks && String(driverHowItWorks._id) !== String(id)) {
      throw new ApolloError('driver how it works  with this title exists', '400')
    }
    return service.findOneAndUpdate({ _id: id }, input)
  }

  async removeDriverHowItWorksByAdmin(idSet: Types.ObjectId[]) {
    for (let index = 0; index < idSet.length; index++) {
      const id = idSet[index]
      const element = await service.findOne({ _id: id, isDeleted: false })
      if (!element) throw new ApolloError('Driver how it works does not exist.')
    }
    return idSet.map(id => service.findOneAndUpdate(id, { isDeleted: true }))
  }
})(service)
