import { Types } from 'mongoose'
import service from './service'

export default new (class Controller {
  async getAllRoles(data: Object) {
    const result = await service.findAll(data)
    return result
  }

  async getOneRole(id: String) {
    const result = await service.findById(id)
    return result
  }

  async createRole(name: String, permissions: Array<String>, description: String) {
    const result = await service.save(name, permissions, description)
    return result
  }

  async updateRole(
    name: String,
    permissions: Array<String>,
    description: String,
    whereId: Types.ObjectId
  ) {
    const result = await service.updateById(name, permissions, description, whereId)
    return result
  }
})()
