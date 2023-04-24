/* eslint-disable no-await-in-loop */
import { ApolloError } from 'apollo-server-express'
import { Types } from 'mongoose'
import service from './service'
import controllerBase from '../../utils/controllerBase'

export default new (class Controller extends controllerBase {
  async getErrorByAdmin(id) {
    return service.findOne({ _id: id })
  }

  async getErrorsByAdmin(Pagination, getErrorsQuery) {
    const result: any = await service.find(getErrorsQuery, Pagination)
    return result
  }

  async createErrorByAdmin(errorInput) {
    if (!errorInput.title) {
      throw new ApolloError('title can not be empty', '400')
    }
    if (!errorInput.text.length) {
      throw new ApolloError('text can not be empty', '400')
    }
    const error = await service.findOne({ title: errorInput.title })
    if (error) {
      throw new ApolloError('error with this title exists', '400')
    }
    return service.create({ ...errorInput })
  }

  async updateErrorByAdmin(id: Types.ObjectId, errorInput) {
    if (!errorInput.title) {
      throw new ApolloError('title can not be empty', '400')
    }
    if (!errorInput.text.length) {
      throw new ApolloError('text can not be empty', '400')
    }
    const error = await service.findOne({ title: errorInput.title })
    if (error && String(error._id) !== String(id)) {
      throw new ApolloError('error with this title exists', '400')
    }
    return service.findOneAndUpdate({ _id: id }, errorInput)
  }

  async removeErrorByAdmin(idSet: Types.ObjectId[]) {
    for (let index = 0; index < idSet.length; index++) {
      const id = idSet[index]
      const error = await service.findOne({ _id: id, isDeleted: false })
      if (!error) throw new ApolloError('Error does not exist.')
    }
    return idSet.map(id => service.findOneAndUpdate(id, { isDeleted: true }))
  }
})(service)
