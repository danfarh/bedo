/* eslint-disable no-await-in-loop */
import { ApolloError } from 'apollo-server-express'
import { Types } from 'mongoose'
import { Type } from 'typescript'
import service from './service'
import shopService from '../shop/service'
import controllerBase from '../../utils/controllerBase'

export default new (class Controller extends controllerBase {
  async createCategoryByAdmin(data: any) {
    if (!data.parent) {
      return this.service.create({
        ...data,
        parent: null
      })
    }
    const parentCategory = await this.service.findById(data.parent)
    if (!parentCategory) {
      throw new ApolloError('Parent category does not exist.', '400')
    }
    return this.service.create(data)
  }

  async updateCategoryByAdmin(_id: Types.ObjectId | String, data: any) {
    if (data.parent) {
      const parent = await this.service.findById(data.parent)
      if (!parent) {
        throw new ApolloError('Parent category does not exist.', '400')
      }
    }
    const updatedCategory = await this.service.findOneAndUpdate(_id, data)
    if (!updatedCategory) {
      throw new ApolloError('Category does not exist.', '404')
    }
    return updatedCategory
  }

  async deleteCategoryByAdmin(idSet: Types.ObjectId[]) {
    for (let index = 0; index < idSet.length; index++) {
      const categoryId = idSet[index]
      const category = await service.findById(categoryId)
      if (!category) throw new ApolloError('Category does not exist.', '400')
      if (category.isDeleted) throw new ApolloError('Category has deleted before.', '400')
      if (!category.parent) throw new ApolloError('You can not delete root category.')
      const shopSet = await shopService.find({ categories: { $all: categoryId } })
      if (shopSet.length !== 0) throw new ApolloError('Category is used by at least one shop(s) .')
    }
    return idSet.map(id => service.findOneAndUpdate(id, { isDeleted: true }))
  }
})(service)
