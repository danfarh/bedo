import { ApolloError } from 'apollo-server-express'
import { Types } from 'mongoose'
import service from './service'
import ControllerBase from '../../utils/controllerBase'

export default new (class Controller extends ControllerBase {
  async updateCancelReservationConstantByAdmin(filters: Object, data: Object) {
    const { from, to, ratePunishment, costPunishment, forType, costPunishmentType }: any = data
    if (!from) {
      throw new ApolloError('from cannot be empty', '400')
    }
    if (!to) {
      throw new ApolloError('to cannot be empty', '400')
    }
    if (!ratePunishment) {
      throw new ApolloError('ratePunishment cannot be empty', '400')
    }
    if (!costPunishment) {
      throw new ApolloError('costPunishment cannot be empty', '400')
    }
    if (!forType) {
      throw new ApolloError('forType cannot be empty', '400')
    }
    if (!costPunishmentType) {
      throw new ApolloError('costPunishmentType cannot be empty', '400')
    }
    const constant = await service.findOneAndUpdate(filters, data)
    if (!constant) {
      throw new ApolloError('constant does not exists', '400')
    }
    return constant
  }

  async getCancelReservationConstantsByAdmin(filters: any = {}, pagination, sort) {
    if ('from' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.from = new RegExp(filters.from, 'gi')
    }

    if ('to' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.to = new RegExp(filters.to, 'gi')
    }

    if ('ratePunishment' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.ratePunishment = new RegExp(filters.ratePunishment, 'gi')
    }

    if ('costPunishment' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.costPunishment = new RegExp(filters.costPunishment, 'gi')
    }

    if ('forType' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.forType = new RegExp(filters.forType, 'gi')
    }
    return service.find(filters, pagination, sort)
  }

  async getCancelReservationConstantsByAdminCount(filters: any = {}) {
    if ('from' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.from = new RegExp(filters.from, 'gi')
    }

    if ('to' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.to = new RegExp(filters.to, 'gi')
    }

    if ('ratePunishment' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.ratePunishment = new RegExp(filters.ratePunishment, 'gi')
    }

    if ('costPunishment' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.costPunishment = new RegExp(filters.costPunishment, 'gi')
    }

    if ('forType' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.forType = new RegExp(filters.forType, 'gi')
    }

    return service.count(filters)
  }

  async createCancelReservationConstantByAdmin(data: Object) {
    const { from, to, ratePunishment, costPunishment, forType }: any = data
    if (!from) {
      throw new ApolloError('from cannot be empty', '400')
    }
    if (!to) {
      throw new ApolloError('to cannot be empty', '400')
    }
    if (!ratePunishment) {
      throw new ApolloError('ratePunishment cannot be empty', '400')
    }
    if (!costPunishment) {
      throw new ApolloError('costPunishment cannot be empty', '400')
    }
    if (!forType) {
      throw new ApolloError('forType cannot be empty', '400')
    }
    const constant = await service.create(data)
    if (!constant) {
      throw new ApolloError('constant not created', '400')
    }
    return constant
  }

  async getCancelReservationConstant(id: Types.ObjectId) {
    const constant = await service.findById(id)
    if (!constant) {
      throw new ApolloError('constant does not exists', '400')
    }
    return constant
  }
})(service)
