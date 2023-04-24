/* eslint-disable no-await-in-loop */
import { Types } from 'mongoose'
import { ApolloError } from 'apollo-server-express'
import service from './service'
import categoryService from '../category/service'
import attributeService from '../attribute/service'
import controllerBase from '../../utils/controllerBase'
import { Pagination } from '../../utils/interfaces'

export default new (class Controller extends controllerBase {
  async createAttributeGroupByAdmin(data: Object, attributes: Array<String | Types.ObjectId> = []) {
    const { name, rootCategory }: any = data
    if (!name) {
      throw new ApolloError('name cannot be empty', '400')
    }
    const category = await categoryService.findOne({ _id: rootCategory, parent: null })
    if (!category) {
      throw new ApolloError('category does not exists', '400')
    }
    const attrGroupExists = await service.findOne({ name, rootCategory })
    if (attrGroupExists) {
      throw new ApolloError('attributeGroupe with this name exists', '400')
    }
    const attrGroup = await this.service.create(data)
    if (attributes) {
      await this.addAttributesToAttributeGroup(attrGroup._id, attributes)
    }
    return attrGroup
  }

  async updateAttributeGroupByAdmin(_id: String | Types.ObjectId, data: Object) {
    const { name, rootCategory }: any = data
    if (!name) {
      throw new ApolloError('name cannot be empty', '400')
    }
    const category = await categoryService.findOne({ _id: rootCategory, parent: null })
    if (!category) {
      throw new ApolloError('category does not exists', '400')
    }
    const attributeGroupExists = await service.findOne({
      name,
      rootCategory
    })

    if (attributeGroupExists && String(attributeGroupExists._id) !== String(_id)) {
      throw new ApolloError('attribute group with this name exists', '400')
    }
    const attrGroup = await this.service.findOneAndUpdate(_id, data)
    if (!attrGroup) {
      throw new ApolloError('attributeGroup not found!', '404')
    }
    return attrGroup
  }

  async addAttributesToAttributeGroup(
    attributeGroupId: String | Types.ObjectId,
    attributeIds: Array<String | Types.ObjectId>
  ) {
    const attrGroup = await this.service.findById(attributeGroupId)
    if (!attrGroup) {
      throw new ApolloError('attributeGroup not found!', '404')
    }
    if (attributeIds && attributeIds.length) {
      // eslint-disable-next-line no-restricted-syntax
      for (const attributeId of attributeIds) {
        // eslint-disable-next-line no-await-in-loop
        await attributeService.findOneAndUpdate(attributeId, {
          attributeGroup: attrGroup._id
        })
      }
    }
    return attrGroup
  }

  async removeAttributesFromAttributeGroup(
    attributeGroupId: String | Types.ObjectId,
    attributeIds: Array<String | Types.ObjectId>
  ) {
    const attrGroup = await this.service.findById(attributeGroupId)
    if (!attrGroup) {
      throw new ApolloError('attributeGroup not found!', '404')
    }
    if (attributeIds && attributeIds.length) {
      // eslint-disable-next-line no-restricted-syntax
      for (const attributeId of attributeIds) {
        // eslint-disable-next-line no-await-in-loop
        await attributeService.findOneAndUpdate(
          { _id: attributeId, attributeGroup: attributeGroupId },
          {
            attributeGroup: null
          }
        )
      }
    }
    return attrGroup
  }

  async deleteAttributeGroupByAdmin(idSet: Types.ObjectId[]) {
    for (let index = 0; index < idSet.length; index++) {
      const id = idSet[index]
      const attributeGroup = await service.findById(id)
      if (!attributeGroup) throw new ApolloError('Attribute group does not exist.', '400')
      const attributeSet = await attributeService.find({ attributeGroup: id })
      if (attributeSet.length !== 0)
        throw new ApolloError('Attribute group is used at least by one attribute(s).', '400')
    }
    return idSet.map(id => service.findOneAndUpdate(id, { isDeleted: true }))
  }

  async getAttributeGroupsByAdmin(
    filters: any = {},
    pagination: Pagination = { skip: 0, limit: 15 },
    sort: { createdAt?: Number; updatedAt?: Number } = { createdAt: -1 }
  ) {
    if ('name' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.name = new RegExp(filters.name, 'gi')
    }
    return this.service.find(filters, pagination, sort)
  }

  async getAttributeGroupsByAdminCount(filters: any = {}) {
    if ('name' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.name = new RegExp(filters.name, 'gi')
    }
    return this.service.count(filters)
  }

  async getAttributeGroups(filters: any = {}, pagination: Pagination = { skip: 0, limit: 15 }) {
    if ('name' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.name = new RegExp(filters.name, 'gi')
    }
    return service.find(filters, pagination)
  }

  async getAttributeGroupsCount(filters: any = {}) {
    if ('name' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.name = new RegExp(filters.name, 'gi')
    }
    return service.count(filters)
  }

  async getAttributeGroup(id: Types.ObjectId) {
    const attributeGroupe = await service.findById(id)
    if (!attributeGroupe) {
      throw new ApolloError('attribute group does not exists', '400')
    }
    return attributeGroupe
  }

  async getAttributeGroupByAdmin(_id: Types.ObjectId | String) {
    return this.service.findById(_id)
  }
})(service)
