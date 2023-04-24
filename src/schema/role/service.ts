// database request
import { Types } from 'mongoose'
import Role from './schema'
import ServiceBase from '../../utils/serviceBase'

export default new (class service extends ServiceBase {
  async findById(id) {
    const result = await Role.findById(id).exec()
    return result
  }

  async findAll(data: any): Promise<any> {
    const result = await Role.find()
      .populate('permissions')
      .skip(data.skip * data.limit)
      .limit(data.limit)

    return result
  }

  async save(name: String, permissions: Array<String>, description: String) {
    const role = await new Role({
      name,
      description,
      permissions
    })
    await role.save()
    return role
  }

  async updateById(
    name: String,
    permissions: Array<String>,
    description: String,
    whereId: Types.ObjectId
  ) {
    const result = await Role.findByIdAndUpdate(
      whereId,
      {
        name,
        permissions,
        description
      },
      { new: true }
    ).populate('permissions')
    return result
  }
})(Role)
