import { Types } from 'mongoose'
import { omit } from 'lodash'
import service from './service'

export default new (class Controller {
  async getAllPermissions(data: Object) {
    const result = await service.findAll(data)
    return result
  }

  async getOnePermission(id: String) {
    const result = await service.findById(id)
    return result
  }

  async createPermission(name: String, description: String) {
    const result = await service.save(name, description)
    return result
  }

  async updatePermission(name: String, description: String, whereId: Types.ObjectId) {
    const result = await service.updateById(name, description, whereId)
    return result
  }

  async getAllpermissionsByAdmin(filters, pagination) {
    return service.getAllpermissionsByAdmin(filters, pagination)
  }

  async getAllpermissionsByAdminCount(filters: any = {}) {
    if ('name' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.name = new RegExp(filters.name, 'gi')
    }
    if ('description' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.description = new RegExp(filters.description, 'gi')
    }
    return service.count(filters)
  }
})()
