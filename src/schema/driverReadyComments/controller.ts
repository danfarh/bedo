/* eslint-disable no-await-in-loop */
import { ApolloError } from 'apollo-server-express'
import service from './service'
import controllerBase from '../../utils/controllerBase'

export default new (class Controller extends controllerBase {
  async validateInputType(input) {
    if (!input.type.length) throw new ApolloError('type can not be empty', '400')

    // ignore empty string type values
    const inputType = input.type.filter(type => type.value)
    if (!inputType.length) throw new ApolloError('type value can not be empty', '400')

    // ignore duplicate type values
    for (let index = 0; index < inputType.length; index++) {
      const objectOfType = inputType[index]
      const typeRegex = new RegExp(`^${objectOfType.value}$`, 'i')
      const existenceProductSet = await service.find({
        type: { $elemMatch: { value: { $regex: typeRegex }, lang: objectOfType.lang } }
      })
      if (existenceProductSet.length) {
        throw new ApolloError('driver ready comment with this type exists', '400')
      }
    }
    return inputType
  }

  async getDriverReadyComments(filters, pagination, language) {
    return service.findFromView(filters, pagination, {}, language)
  }

  async getDriverReadyComment(_id, language) {
    return service.findOneFromView({ _id }, language)
  }

  async getDriverReadyCommentsCount(filters, language) {
    return service.countFromView(filters, language)
  }

  async getDriverReadyCommentsByAdmin(filters, pagination, sort) {
    return service.find(filters, pagination, sort)
  }

  async getDriverReadyCommentByAdmin(_id) {
    return service.findById(_id)
  }

  async getDriverReadyCommentsByAdminCount(filters) {
    return service.count(filters)
  }

  async createDriverReadyCommentByAdmin(input) {
    input.type = await this.validateInputType(input)
    return service.create(input)
  }

  async updateDriverReadyCommentByAdmin(id, input) {
    input.type = await this.validateInputType(input)
    return service.findOneAndUpdate({ _id: id }, input)
  }

  async removeDriverReadyCommentByAdmin(idSet: any[]) {
    const result: any = []
    for (let index = 0; index < idSet.length; index++) {
      const id = idSet[index]
      const element = await service.findOne({ _id: id, isDeleted: false })
      if (!element) throw new ApolloError('Driver ready comment does not exist.', '400')
      result.push(idSet[index])
    }
    return idSet.map(async id => service.findOneAndUpdate(id, { isDeleted: true }))
  }
})(service)
