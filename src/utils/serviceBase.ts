import { Types, connection } from 'mongoose'
// eslint-disable-next-line no-unused-vars
import { Pagination } from './interfaces'

export default class serviceBase {
  public model

  public views

  constructor(model: any, views: any = null) {
    this.model = model
    this.views = views
  }

  async find(
    filters: Object = {},
    pagination: Pagination = {
      skip: 0,
      limit: 15
    },
    sort: Object = { createdAt: -1 }
  ): Promise<Array<any>> {
    return this.model
      .find(filters)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
  }

  async findFromView(
    filters: Object = {},
    pagination: Pagination = {
      skip: 0,
      limit: 15
    },
    sort: Object = { createdAt: -1 },
    language: String
  ) {
    const viewService = this.views.find(view => view.collectionName.includes(`-${language}`))
    return viewService
      .find(filters)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .toArray()
  }

  async findOneFromView(filters: String | Types.ObjectId | Object | any, language): Promise<any> {
    if (typeof filters === 'string' || filters instanceof Types.ObjectId) {
      // eslint-disable-next-line no-param-reassign
      filters = {
        _id: filters
      }
    }
    const viewService = this.views.find(legalsView =>
      legalsView.collectionName.includes(`-${language}`)
    )
    if ('_id' in filters) filters._id = Types.ObjectId(filters._id)
    return viewService.findOne(filters)
  }

  async countFromView(filters: any | Object = {}, language): Promise<number> {
    const viewService = this.views.find(legalsView =>
      legalsView.collectionName.includes(`-${language}`)
    )
    if ('_id' in filters) filters._id = Types.ObjectId(filters._id)
    return viewService.countDocuments(filters)
  }

  async findOne(filters: String | Types.ObjectId | Object): Promise<any> {
    if (typeof filters === 'string' || filters instanceof Types.ObjectId) {
      // eslint-disable-next-line no-param-reassign
      filters = {
        _id: filters
      }
    }
    return this.model.findOne(filters)
  }

  async count(filters: Object = {}): Promise<number> {
    return this.model.countDocuments(filters)
  }

  async findById(_id: String | Types.ObjectId): Promise<any> {
    return this.model.findById(_id)
  }

  async create(data: Object): Promise<any> {
    return this.model.create(data)
  }

  async findOneAndUpdate(filters: String | Types.ObjectId | Object, data: Object): Promise<any> {
    if (typeof filters === 'string' || filters instanceof Types.ObjectId) {
      // eslint-disable-next-line no-param-reassign
      filters = {
        _id: filters
      }
    }
    return this.model.findOneAndUpdate(filters, data, { new: true })
  }

  async updateMany(filters: String | Types.ObjectId | Object, data: Object): Promise<any> {
    if (typeof filters === 'string' || filters instanceof Types.ObjectId) {
      // eslint-disable-next-line no-param-reassign
      filters = {
        _id: filters
      }
    }
    return this.model.updateMany(filters, data, { new: true })
  }

  async deleteMany(obj = {}): Promise<any> {
    return this.model.deleteMany({})
  }

  async findOneAndRemove(filters: String | Types.ObjectId | Object): Promise<any> {
    if (typeof filters === 'string' || filters instanceof Types.ObjectId) {
      // eslint-disable-next-line no-param-reassign
      filters = {
        _id: filters
      }
    }
    return this.model.findOneAndRemove(filters)
  }
}
