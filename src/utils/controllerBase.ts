/* eslint-disable no-unused-vars */
import { Types } from 'mongoose'
import checkIfUserExists from './checkIfUserExists'
import ServiceBase from './serviceBase'
import { Pagination } from './interfaces'

export default class {
  service: ServiceBase

  constructor(service: ServiceBase) {
    this.service = service
  }

  checkIfUserExists(user) {
    checkIfUserExists(user)
  }

  async index(
    user: Object,
    filters: Object,
    pagination: Pagination,
    sort: any = { createdAt: -1 }
  ): Promise<Array<any>> {
    return this.service.find(filters, pagination, sort)
  }

  async get(user: Object, _id: Types.ObjectId | string | Object): Promise<any> {
    return this.service.findOne(_id)
  }

  async count(user: Object, filters: Object): Promise<number> {
    return this.service.count(filters)
  }

  async create(user: Object, data: Object): Promise<any> {
    return this.service.create(data)
  }

  async update(
    user: Object,
    filters: Types.ObjectId | string | Object,
    data: Object
  ): Promise<any> {
    return this.service.findOneAndUpdate(filters, data)
  }

  async delete(user: Object, filters: Types.ObjectId | string | Object): Promise<any> {
    return this.service.findOneAndRemove(filters)
  }
}
