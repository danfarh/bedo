import { Types } from 'mongoose'
import { ApolloError } from 'apollo-server-express'
import { omit } from 'lodash'
import service from './service'
import controllerBase from '../../utils/controllerBase'

export default new (class Controller extends controllerBase {
  async index(user: any, filters: any, pagination: any) {
    let inputFilters = filters
    if (filters && filters.attributes) {
      inputFilters = {
        ...omit(filters, 'attributes'),
        attributes: {
          $elemMatch: {
            attributeGroup: filters.attributes.group,
            att: { $in: [...filters.attributes.atts] }
          }
        }
      }
    }
    const result = await super.index(
      user,
      { ...inputFilters, stock: { $gt: 0 }, isDeleted: false },
      pagination
    )
    return Promise.all(
      result.map(async i => {
        return service.fixProduct(i)
      })
    )
  }

  async getProduct(_id: Types.ObjectId, language) {
    const product: any = await service.findOneFromView({ _id, stock: { $gt: 0 } }, language)

    if (!product) {
      throw new ApolloError('product does not exists', '400')
    }
    return service.fixProduct(product)
  }

  async getProducts(filters, pagination, sort, language) {
    return service.findFromView(filters, pagination, sort, language)
  }

  async getProductsCount(filters, language) {
    return this.service.countFromView(filters, language)
  }

  async getSearchProducts(filters, pagination, sort, language) {
    if ('title' in filters) {
      filters.title = new RegExp(filters.title, 'gi')
    }
    return service.findFromView(filters, pagination, sort, language)
  }

  async getSearchProductsCount(filters, language) {
    if ('title' in filters) {
      filters.title = new RegExp(filters.title, 'gi')
    }
    return this.service.countFromView(filters, language)
  }
})(service)
