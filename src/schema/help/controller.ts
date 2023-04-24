/* eslint-disable no-await-in-loop */
import { ApolloError } from 'apollo-server-express'
import { Types } from 'mongoose'
import service from './service'
import controllerBase from '../../utils/controllerBase'

export default new (class Controller extends controllerBase {
  async createHelpByAdmin(helpInput, adminId) {
    if (!helpInput.name) {
      throw new ApolloError('name can not be empty', '400')
    }
    if (!helpInput.title.length) {
      throw new ApolloError('title can not be empty', '400')
    }
    if (!helpInput.description.length) {
      throw new ApolloError('description can not be empty', '400')
    }
    const help = await service.findOne({ name: helpInput.name, type: helpInput.type })
    if (help) {
      throw new ApolloError('help with this name and type exists', '400')
    }
    return service.create({ ...helpInput, admin: adminId })
  }

  async getHelpByAdmin(id) {
    return service.findOne({ _id: id })
  }

  async getHelpsByAdmin(Pagination, getHelpsQuery, sort = { order: 1 }) {
    const result: any = await service.find(getHelpsQuery, Pagination, sort)
    return result
  }

  async getHelpsCountByAdmin(filters) {
    return this.service.count(filters)
  }

  async getHelp(id, language) {
    return service.findOneFromView({ _id: id }, language)
  }

  async getHelps(Pagination, getHelpsQuery, sort = { order: 1 }, language) {
    return service.findFromView(getHelpsQuery, Pagination, sort, language)
  }

  async getHelpsCount(filters, language) {
    return service.countFromView(filters, language)
  }

  async updateHelpByAdmin(id: Types.ObjectId, helpInput) {
    if (!helpInput.name) {
      throw new ApolloError('name can not be empty', '400')
    }
    if (!helpInput.title.length) {
      throw new ApolloError('title can not be empty', '400')
    }
    if (!helpInput.description.length) {
      throw new ApolloError('description can not be empty', '400')
    }
    const help = await service.findOne({ name: helpInput.name, type: helpInput.type })

    if (help && String(help._id) !== String(id)) {
      throw new ApolloError('help with this name exists', '400')
    }
    return service.findOneAndUpdate({ _id: id }, helpInput)
  }

  async removeHelpByAdmin(idSet: Types.ObjectId[]) {
    for (let index = 0; index < idSet.length; index++) {
      const id = idSet[index]
      const help = await service.findOne({ _id: id, isDeleted: false })
      if (!help) throw new ApolloError('Help does not exist.')
    }
    return idSet.map(id => service.findOneAndUpdate(id, { isDeleted: true }))
  }
})(service)
