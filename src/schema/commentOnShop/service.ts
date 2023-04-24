import { Types } from 'mongoose'
import * as _ from 'lodash'
import moment from 'moment'
import Model from './schema'
import ServiceBase from '../../utils/serviceBase'
import { Pagination } from '../../utils/interfaces'

export default new (class service extends ServiceBase {
  async find(
    filters: Object = {},
    pagination: Pagination = {
      skip: 0,
      limit: 15
    },
    sort: Object = { createdAt: -1 }
  ): Promise<Array<any>> {
    return this.model
      .find({ ...filters, isDeleted: false })
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
  }

  async findOne(filters: String | Types.ObjectId | Object): Promise<any> {
    if (typeof filters === 'string' || filters instanceof Types.ObjectId) {
      // eslint-disable-next-line no-param-reassign
      filters = {
        _id: filters
      }
    }
    return this.model.findOne({ ...filters, isDeleted: false })
  }

  async count(filters: Object = {}): Promise<number> {
    return this.model.countDocuments({ ...filters, isDeleted: false })
  }

  async findById(_id) {
    return this.findOne({ _id })
  }

  async getShopAdminCommentsOnShop(
    shop,
    filters: any,
    pagination: any = { skip: 0, limit: 15 },
    sort: any
  ) {
    if (filters && filters.fromDate && filters.toDate) {
      // eslint-disable-next-line no-param-reassign
      filters.createdAt = {
        $gte: moment(new Date(filters.fromDate))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.toDate))
          .utc()
          .endOf('date')
          .toDate()
      }
    }
    // eslint-disable-next-line no-param-reassign
    filters = _.omit(filters, 'fromDate')
    // eslint-disable-next-line no-param-reassign
    filters = _.omit(filters, 'toDate')

    if (filters && filters.updatedAt) {
      // eslint-disable-next-line no-param-reassign
      filters.updatedAt = {
        $gte: moment(new Date(filters.updatedAt))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.updatedAt))
          .utc()
          .endOf('date')
          .toDate()
      }
    }

    if ('createdAt' in filters && 'createdAtFrom' in filters) {
      filters.createdAt = {
        $gte: moment(new Date(filters.createdAtFrom))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.createdAt))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.createdAtFrom
    } else if ('createdAtFrom' in filters) {
      filters.createdAt = {
        $gte: moment(new Date(filters.createdAtFrom))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.createdAtFrom
    } else if ('createdAt' in filters) {
      filters.createdAt = {
        $lte: moment(new Date(filters.createdAt))
          .utc()
          .startOf('date')
          .toDate()
      }
    }

    if (filters && filters.readyComments) {
      // eslint-disable-next-line no-param-reassign
      filters.readyComments = {
        $elemMatch: { ...filters.readyComments }
      }
    }

    if (filters && filters.userComment) {
      // eslint-disable-next-line no-param-reassign
      filters.userComment = new RegExp(filters.userComment, 'gi')
    }

    if (filters && filters.shopAdminReply) {
      if (filters.shopAdminReply.comment) {
        // eslint-disable-next-line no-param-reassign
        filters['shopAdminReply.comment'] = filters.shopAdminReply.comment
      }

      if (filters.shopAdminReply.admin) {
        // eslint-disable-next-line no-param-reassign
        filters['shopAdminReply.admin'] = filters.shopAdminReply.admin
      }
      // eslint-disable-next-line no-param-reassign
      filters = _.omit(filters, 'shopAdminReply')
    }

    if (filters.status) {
      if (filters.status === 'CONFIRMED') {
        // eslint-disable-next-line no-param-reassign
        filters.status = { $eq: filters.status, $nin: ['REJECTED', 'PENDING'] }
      }
      if (filters.status === 'REJECTED') {
        // eslint-disable-next-line no-param-reassign
        filters.status = { $eq: filters.status, $nin: ['CONFIRMED', 'PENDING'] }
      }
      if (filters.status === 'PENDING') {
        // eslint-disable-next-line no-param-reassign
        filters.status = { $eq: filters.status, $nin: ['REJECTED', 'CONFIRMED'] }
      }
    }

    return Model.find({
      ...filters,
      shop: { $exists: true, $eq: shop },
      isDeleted: false
    })
      .sort(sort ? { ...sort } : { createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
  }

  async getCommentsOnShopByAdmin(
    filters: any = {},
    pagination: Pagination = { skip: 0, limit: 15 },
    sort: any = { createdAt: -1 }
  ) {
    if ('shopAverageRate' in sort) {
      // eslint-disable-next-line no-param-reassign
      sort = {
        'shop.averageRate': sort.shopAverageRate
      }
    }
    if ('_id' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters._id = Types.ObjectId(filters._id)
    }
    if ('order' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.order = Types.ObjectId(filters.order)
    }

    if ('user' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['user._id'] = Types.ObjectId(filters.user)
      // eslint-disable-next-line no-param-reassign
      filters = _.omit(filters, 'user')
    }

    if ('readyComments' in filters) {
      if (filters.readyComments.readyComment) {
        // eslint-disable-next-line no-param-reassign
        filters.readyComments.readyComment = Types.ObjectId(filters.readyComments.readyComment)
      }
      // eslint-disable-next-line no-param-reassign
      filters.readyComments = {
        $elemMatch: { ...filters.readyComments }
      }
    }
    if ('userComment' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.userComment = new RegExp(filters.userComment, 'gi')
    }

    if ('shop' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['shop._id'] = Types.ObjectId(filters.shop)
      // eslint-disable-next-line no-param-reassign
      filters = _.omit(filters, 'shop')
    }

    if ('passengerPhoneNumber' in filters) {
      filters['user.phoneNumber'] = new RegExp(filters.passengerPhoneNumber, 'gi')
      filters = _.omit(filters, 'passengerPhoneNumber')
    }
    if ('passengerName' in filters) {
      filters['user.fullName'] = new RegExp(filters.passengerName, 'gi')
      filters = _.omit(filters, 'passengerName')
    }
    if ('shopPhoneNumber' in filters) {
      filters['shop.phoneNumbers'] = new RegExp(filters.shopPhoneNumber, 'gi')
      filters = _.omit(filters, 'shopPhoneNumber')
    }
    if ('shopName' in filters) {
      filters['shop.name'] = new RegExp(filters.shopName, 'gi')
      filters = _.omit(filters, 'shopName')
    }

    if ('shopAdminReply' in filters) {
      if (filters.shopAdminReply.comment) {
        // eslint-disable-next-line no-param-reassign
        filters['shopAdminReply.comment'] = Types.ObjectId(filters.shopAdminReply.comment)
      }

      if (filters.shopAdminReply.admin) {
        // eslint-disable-next-line no-param-reassign
        filters['shopAdminReply.admin'] = Types.ObjectId(filters.shopAdminReply.admin)
      }
      // eslint-disable-next-line no-param-reassign
      filters = _.omit(filters, 'shopAdminReply')
    }

    if ('rootCategory' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['shop.rootCategory'] = Types.ObjectId(filters.rootCategory)
      // eslint-disable-next-line no-param-reassign
      filters = _.omit(filters, 'rootCategory')
    }
    if ('createdAt' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.createdAt = {
        $gte: moment(new Date(filters.createdAt))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.createdAt))
          .utc()
          .endOf('date')
          .toDate()
      }
    }
    if ('updatedAt' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.updatedAt = {
        $gte: moment(new Date(filters.updatedAt))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.updatedAt))
          .utc()
          .endOf('date')
          .toDate()
      }
    }

    return Model.aggregate([
      {
        $lookup: {
          from: 'shops',
          localField: 'shop',
          foreignField: '_id',
          as: 'shop'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$shop' },
      { $unwind: '$user' },
      { $match: { ...filters } },
      { $sort: { ...sort } },
      { $skip: pagination.skip },
      { $limit: pagination.limit }
    ])
  }

  async getCommentsOnShopByAdminCount(filters: any = {}) {
    if ('_id' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters._id = Types.ObjectId(filters._id)
    }
    if ('order' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.order = Types.ObjectId(filters.order)
    }

    if ('user' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['user._id'] = Types.ObjectId(filters.user)
      // eslint-disable-next-line no-param-reassign
      filters = _.omit(filters, 'user')
    }

    if ('readyComments' in filters) {
      if (filters.readyComments.readyComment) {
        // eslint-disable-next-line no-param-reassign
        filters.readyComments.readyComment = Types.ObjectId(filters.readyComments.readyComment)
      }
      // eslint-disable-next-line no-param-reassign
      filters.readyComments = {
        $elemMatch: { ...filters.readyComments }
      }
    }
    if ('userComment' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.userComment = new RegExp(filters.userComment, 'gi')
    }

    if ('shop' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['shop._id'] = Types.ObjectId(filters.shop)
      // eslint-disable-next-line no-param-reassign
      filters = _.omit(filters, 'shop')
    }

    if ('passengerPhoneNumber' in filters) {
      filters['user.phoneNumber'] = new RegExp(filters.passengerPhoneNumber, 'gi')
      filters = _.omit(filters, 'passengerPhoneNumber')
    }
    if ('passengerName' in filters) {
      filters['user.fullName'] = new RegExp(filters.passengerName, 'gi')
      filters = _.omit(filters, 'passengerName')
    }
    if ('shopPhoneNumber' in filters) {
      filters['shop.phoneNumbers'] = new RegExp(filters.shopPhoneNumber, 'gi')
      filters = _.omit(filters, 'shopPhoneNumber')
    }
    if ('shopName' in filters) {
      filters['shop.name'] = new RegExp(filters.shopName, 'gi')
      filters = _.omit(filters, 'shopName')
    }

    if ('shopAdminReply' in filters) {
      if (filters.shopAdminReply.comment) {
        // eslint-disable-next-line no-param-reassign
        filters['shopAdminReply.comment'] = Types.ObjectId(filters.shopAdminReply.comment)
      }

      if (filters.shopAdminReply.admin) {
        // eslint-disable-next-line no-param-reassign
        filters['shopAdminReply.admin'] = Types.ObjectId(filters.shopAdminReply.admin)
      }
      // eslint-disable-next-line no-param-reassign
      filters = _.omit(filters, 'shopAdminReply')
    }

    if ('rootCategory' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['shop.rootCategory'] = Types.ObjectId(filters.rootCategory)
      // eslint-disable-next-line no-param-reassign
      filters = _.omit(filters, 'rootCategory')
    }

    if ('createdAt' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.createdAt = {
        $gte: moment(new Date(filters.createdAt))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.createdAt))
          .utc()
          .endOf('date')
          .toDate()
      }
    }

    if ('updatedAt' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.updatedAt = {
        $gte: moment(new Date(filters.updatedAt))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.updatedAt))
          .utc()
          .endOf('date')
          .toDate()
      }
    }

    const result = await Model.aggregate([
      {
        $lookup: {
          from: 'shops',
          localField: 'shop',
          foreignField: '_id',
          as: 'shop'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$shop' },
      { $unwind: '$user' },
      { $match: { ...filters } }
    ])
    return result.length
  }

  async getCommentsOnShopByShopAdminCount(filters: any = {}, shop: Types.ObjectId) {
    if (filters.fromDate && filters.toDate) {
      // eslint-disable-next-line no-param-reassign
      filters.createdAt = {
        $gte: moment(new Date(filters.fromDate))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.toDate))
          .utc()
          .endOf('date')
          .toDate()
      }
    }
    // eslint-disable-next-line no-param-reassign
    filters = _.omit(filters, 'fromDate')
    // eslint-disable-next-line no-param-reassign
    filters = _.omit(filters, 'toDate')

    if (filters.updatedAt) {
      // eslint-disable-next-line no-param-reassign
      filters.updatedAt = {
        $gte: moment(new Date(filters.updatedAt))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.updatedAt))
          .utc()
          .endOf('date')
          .toDate()
      }
    }

    if ('createdAt' in filters && 'createdAtFrom' in filters) {
      filters.createdAt = {
        $gte: moment(new Date(filters.createdAtFrom))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.createdAt))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.createdAtFrom
    } else if ('createdAtFrom' in filters) {
      filters.createdAt = {
        $gte: moment(new Date(filters.createdAtFrom))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.createdAtFrom
    } else if ('createdAt' in filters) {
      filters.createdAt = {
        $lte: moment(new Date(filters.createdAt))
          .utc()
          .startOf('date')
          .toDate()
      }
    }

    if (filters.readyComments) {
      // eslint-disable-next-line no-param-reassign
      filters.readyComments = {
        $elemMatch: { ...filters.readyComments }
      }
    }

    if (filters.userComment) {
      // eslint-disable-next-line no-param-reassign
      filters.userComment = new RegExp(filters.userComment, 'gi')
    }

    if (filters.shopAdminReply) {
      if (filters.shopAdminReply.comment) {
        // eslint-disable-next-line no-param-reassign
        filters['shopAdminReply.comment'] = filters.shopAdminReply.comment
      }

      if (filters.shopAdminReply.admin) {
        // eslint-disable-next-line no-param-reassign
        filters['shopAdminReply.admin'] = filters.shopAdminReply.admin
      }
      // eslint-disable-next-line no-param-reassign
      filters = _.omit(filters, 'shopAdminReply')
    }
    const result = await Model.find({
      ...filters,
      shop: { $exists: true, $eq: shop },
      isDeleted: false
    })
    return result.length
  }
})(Model)
