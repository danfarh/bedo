// database request
import { Types } from 'mongoose'
import Permission from './schema'
import ServiceBase from '../../utils/serviceBase'

export default new (class service extends ServiceBase {
  async findById(id) {
    const result = await Permission.findById(id).exec()
    return result
  }

  async findAll(data: any): Promise<any> {
    const result = await Permission.find()
      .skip(data.skip * data.limit)
      .limit(data.limit)

    return result
  }

  async save(name: String, description: String) {
    const permission = await new Permission({
      name,
      description
    })
    await permission.save()
    return permission
  }

  async updateById(name: String, description: String, whereId: Types.ObjectId) {
    const result = await Permission.findByIdAndUpdate(
      whereId,
      {
        name,
        description
      },
      { new: true }
    )
    return result
  }

  async getAllpermissionsByAdmin(
    filters: any = {},
    pagination: { skip?: Number; limit?: Number } = {}
  ) {
    // @ts-ignore
    if (!pagination.skip) {
      // eslint-disable-next-line no-param-reassign
      pagination.skip = 0
    }
    if (!pagination.limit) {
      // eslint-disable-next-line no-param-reassign
      pagination.limit = await this.count(filters)
    }
    if ('name' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.name = new RegExp(filters.name, 'gi')
    }
    if ('description' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.description = new RegExp(filters.description, 'gi')
    }
    return this.model
      .find(filters)
      .skip(pagination.skip)
      .limit(pagination.limit)
  }
})(Permission)
