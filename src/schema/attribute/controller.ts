/* eslint-disable no-await-in-loop */
import { Types } from 'mongoose'
import { ApolloError } from 'apollo-server-express'
import service from './service'
import productService from '../product/service'
import controllerBase from '../../utils/controllerBase'

export default new (class Controller extends controllerBase {
  async createAttributeByAdmin(data: Object) {
    const { name, attributeGroup }: any = data
    if (!name) {
      throw new ApolloError('name can not be empty', '400')
    }
    const attributeExists = await service.findOne({ name, attributeGroup })
    if (attributeExists) {
      throw new ApolloError('attribute with this name exits', '400')
    }
    return service.create(data)
  }

  async updateAttributeByAdmin(_id: String | Types.ObjectId, data: Object) {
    const { name, attributeGroup }: any = data
    if (!name) {
      throw new ApolloError('name can not be empty', '400')
    }
    const attributeExists = await service.findOne({ name, attributeGroup })
    if (attributeExists && String(attributeExists._id) !== String(_id)) {
      throw new ApolloError('attribute with this name exists', '400')
    }
    const attribute = await service.findOneAndUpdate({ _id }, data)
    if (!attribute) {
      throw new ApolloError('attribute not found!', '404')
    }
    return attribute
  }

  async deleteAttributeByAdmin(idSet: Types.ObjectId[]) {
    for (let index = 0; index < idSet.length; index++) {
      const id = idSet[index]
      const attribute: any = await service.findById(id)
      if (!attribute) throw new ApolloError('Attribute does not exist.', '400')
      if (attribute.isDeleted) throw new ApolloError('Attribute has deleted before.')
      const productSet: any = await productService.find({
        attributes: { $elemMatch: { att: { $all: id } } }
      })
      if (productSet.length !== 0)
        throw new ApolloError('Attribute is used by at least one product(s)', '400')
    }
    return idSet.map(id => service.findOneAndUpdate(id, { isDeleted: true }))
  }
})(service)
