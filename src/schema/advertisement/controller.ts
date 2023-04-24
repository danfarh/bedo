/* eslint-disable no-await-in-loop */
import { ApolloError } from 'apollo-server-express'
import { Types } from 'mongoose'
import service from './service'
import controllerBase from '../../utils/controllerBase'
import { addOrUpdateAdvertisement } from '../../utils/validation/validation'

export default new (class Controller extends controllerBase {
  async createAdvertisementByAdmin(input, adminId) {
    const { redirectTo, description, title, photoUrl, startAt, endAt } = input
    if (!photoUrl) {
      throw new ApolloError('photo url  can not be empty', '400')
    }
    await addOrUpdateAdvertisement.validateAsync({
      startAt,
      redirectTo,
      endAt
    })
    return service.create({ ...input, admin: adminId })
  }

  async getSingleAdvertisement(_id, language) {
    return service.findOneFromView({ _id }, language)
  }

  async getAdvertisements(Pagination, AdvertisementQuery, language) {
    return service.findFromView(
      AdvertisementQuery,
      Pagination,
      {
        createdAt: -1
      },
      language
    )
  }

  async getSingleAdvertisementByAdmin(_id) {
    return service.findOne({ _id })
  }

  async getAdvertisementsByAdmin(Pagination, AdvertisementQuery) {
    return service.find(AdvertisementQuery, Pagination, {
      createdAt: -1
    })
  }

  async updateAdvertisementByAdmin(id: Types.ObjectId, input) {
    const advertisement: any = await service.findById(id)
    if (!advertisement) {
      throw new ApolloError('your advertisement does not exists', '404')
    }
    const { redirectTo, description, title, photoUrl, startAt, endAt } = input
    if (!photoUrl) {
      throw new ApolloError('photo url  can not be empty', '400')
    }
    await addOrUpdateAdvertisement.validateAsync({
      description,
      redirectTo,
      title,
      startAt,
      endAt
    })
    return service.findOneAndUpdate(id, input)
  }

  async removeAdvertisementByAdmin(idSet: Types.ObjectId[]) {
    for (let index = 0; index < idSet.length; index++) {
      const id = idSet[index]
      const advertisement = await service.findOne({ _id: id, isDeleted: false })
      if (!advertisement) throw new ApolloError('Advertisement does not exist.')
    }
    return idSet.map(id => service.findOneAndUpdate(id, { isDeleted: true }))
  }
})(service)
