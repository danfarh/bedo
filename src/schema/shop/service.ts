// database request
import { Types } from 'mongoose'
import _, { omit } from 'lodash'
import moment from 'moment'
import Model from './schema'

import serviceBase from '../../utils/serviceBase'
import adminService from '../admin/service'
import cartModel from '../cart/schema'
import { Pagination } from '../../utils/interfaces'
import env from '../../utils'
import { SHOP_MAXIMUM_DISTANCE } from '../../config'
import { getConstantValue } from '../../utils/redis'

export default new (class service extends serviceBase {
  rawConstants: any[] = []

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

  convertTimeToMinute(date) {
    const minutes = +date.getHours() * 60 + +date.getMinutes()
    return minutes
  }

  getWeekDay(date: Date) {
    const weekdays = ['SUN', 'MON', 'TUE', 'WEN', 'THU', 'FRI', 'SAT']
    const day = date.getDay()
    return weekdays[day]
  }

  async index(filters: any, pagination = { skip: 0, limit: 15 }, sort: any = { deliveryTime: 1 }) {
    const filtersInput: any[] = [
      {},
      {
        $match: {
          rootCategory: Types.ObjectId(filters.rootCategory),
          active: true,
          verified: true,
          isRejected: false,
          isDeleted: false
        }
      }
    ]
    if (filters) {
      if (filters.budget && filters.budget !== 'all') {
        filtersInput[1].$match.budget = filters.budget
      }
      if (filters.preparingTime) {
        filtersInput[1].$match.preparingTime = filters.preparingTime
      }
      if (filters.search) {
        // eslint-disable-next-line no-param-reassign
        filtersInput[1].$match.name = new RegExp(`${filters.search}`, 'i')
      }
      if (filters.openNow) {
        const today = new Date()
        const timeToMinute = this.convertTimeToMinute(today)

        filtersInput[1].$match.workingHoursInMinutes = {
          $elemMatch: {
            type: this.getWeekDay(today),
            from: { $lte: timeToMinute },
            to: { $gte: timeToMinute }
          }
        }
      }
      if (filters.discount) {
        filtersInput.push({
          $lookup: {
            from: 'products',
            let: { shop_id: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ['$$shop_id', '$shop'] }, { $ne: ['$promotion', null] }]
                  }
                }
              }
            ],
            as: 'products'
          }
        })
      }
      if (filters.categories) {
        filtersInput[1].$match.categories = {
          $in: filters.categories.map(i => Types.ObjectId(i))
        }
      }
      if (filters.attributes) {
        filtersInput[1].$match.attributes = {
          $in: filters.attributes.map(i => Types.ObjectId(i))
        }
      }
      if (filters.location) {
        filtersInput[0].$geoNear = {
          near: { type: 'Point', coordinates: [filters.location.long, filters.location.lat] },
          maxDistance: env('SHOP_MAXIMUM_DISTANCE', 60000), // by meter
          key: 'location',
          distanceField: 'dist.calculated',
          spherical: true
        }
      }
    }

    if (sort.rating) {
      filtersInput.push({ $sort: { averageRate: sort.rating } })
    }
    if (sort.priceRange) {
      filtersInput.push({ $sort: { budget: sort.priceRange } })
    }
    if (sort.preparingTime) {
      filtersInput.push({ $sort: { preparingTime: sort.preparingTime } })
    }

    if (!Object.keys(filtersInput[0]).length) filtersInput.shift()
    console.log(filtersInput)
    const response = await Model.aggregate([
      ...filtersInput,
      { $skip: pagination.skip },
      { $limit: pagination.limit }
    ])
    return filters.discount ? response.filter(i => i.products.length > 0) : response
  }

  async getSalary(
    user: any,
    filters: any = {},
    sort: any = { paidAt: -1 },
    pagination: any = { skip: 0, limit: 15 }
  ) {
    return cartModel.aggregate([
      { $match: { shop: Types.ObjectId(user.shopId) } },
      {
        $lookup: {
          from: 'orders',
          let: { cart_id: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$$cart_id', '$cart'] },
                    { $not: [{ $in: ['$status', ['WAITING', 'REJECTED']] }] }
                  ]
                }
              }
            }
          ],
          as: 'order'
        }
      },
      { $unwind: { path: '$order' } },
      {
        $addFields: {
          paidAt: '$order.paidAt',
          shipmentAt: '$order.shipmentAt',
          status: '$order.status',
          type: '$order.type',
          commission: '$order.commission'
        }
      },
      { $project: { order: 0, createdAt: 0, updatedAt: 0 } },
      { $match: { ...filters } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$paidAt' } },
          userTakings: {
            $sum: '$finalPrice'
          },
          commissionForSpark: {
            $sum: '$commission'
          },
          numberOfOrders: {
            $sum: 1
          },
          currency: {
            $first: '$currency'
          },
          paidAt: {
            $first: '$paidAt'
          }
        }
      },
      {
        $project: {
          _id: 1,
          numberOfOrders: 1,
          currency: 1,
          paidAt: 1,
          userTakings: {
            $round: ['$userTakings', 2]
          },
          commissionForSpark: {
            $round: ['$commissionForSpark', 2]
          }
        }
      },
      {
        $addFields: {
          income: {
            $round: [{ $subtract: ['$userTakings', '$commissionForSpark'] }, 2]
          }
        }
      },
      { $sort: { ...sort } },
      { $skip: pagination.skip },
      { $limit: pagination.limit }
    ])
  }

  async getShopsByAdmin(filters: any, pagination: Pagination = { skip: 0, limit: 15 }, sort: any) {
    const filtersInput: any[] = [{}, { $match: { isDeleted: false } }]

    if (filters) {
      if (filters.shopAdminName || filters.shopAdminPhoneNumber) {
        const f: any = {}
        if ('shopAdminPhoneNumber' in filters) {
          f.phoneNumber = new RegExp(filters.shopAdminPhoneNumber, 'gi')
          filters = _.omit(filters, 'shopAdminPhoneNumber')
        }
        if ('shopAdminName' in filters) {
          f.fullName = new RegExp(filters.shopAdminName, 'gi')
          filters = _.omit(filters, 'shopAdminName')
        }
        const shopAdmins = await adminService.find(f)
        if (shopAdmins) {
          filters = _.omit(filters, 'shopAdmin')
          const ids = shopAdmins.map(p => p._id)
          filtersInput[1].$match.shopAdmin = { $in: [...ids] }
        }
      }

      if (filters.budget && filters.budget !== 'all') {
        filtersInput[1].$match.budget = filters.budget
      }
      if ('active' in filters) {
        filtersInput[1].$match.active = filters.active
      }
      if ('isRejected' in filters) {
        filtersInput[1].$match.isRejected = filters.isRejected
      }

      if ('verified' in filters) {
        filtersInput[1].$match.verified = filters.verified
      }
      if (filters.createdAt) {
        // eslint-disable-next-line no-param-reassign
        filtersInput[1].$match.createdAt = {
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
      if (filters.updatedAt) {
        // eslint-disable-next-line no-param-reassign
        filtersInput[1].$match.updatedAt = {
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
      if (filters.name) {
        filtersInput[1].$match.name = new RegExp(filters.name, 'gi')
      }
      if (filters.preparingTime) {
        filtersInput[1].$match.preparingTime = filters.preparingTime
      }

      if ('averageRate' in filters && 'averageRateFrom' in filters) {
        filters.averageRate = {
          $gte: filters.averageRateFrom,
          $lte: filters.averageRate
        }
        delete filters.averageRateFrom
        filtersInput[1].$match.averageRate = filters.averageRate
      } else if ('averageRateFrom' in filters) {
        filters.averageRate = {
          $gte: filters.averageRateFrom
        }
        delete filters.averageRateFrom
        filtersInput[1].$match.averageRate = filters.averageRate
      } else if ('averageRate' in filters) {
        filters.averageRate = {
          $lte: filters.averageRate
        }
        filtersInput[1].$match.averageRate = filters.averageRate
      }

      if (filters.numberOfRates) {
        filtersInput[1].$match.numberOfRates = filters.numberOfRates
      }
      if (filters.sumOfRates) {
        filtersInput[1].$match.sumOfRates = filters.sumOfRates
      }
      if (filters.address) {
        filtersInput[1].$match.address = new RegExp(filters.address, 'gi')
      }
      if (filters.origin) {
        filtersInput[1].$match.origin = new RegExp(filters.origin, 'gi')
      }

      if ('state' in filters) {
        filtersInput[1].$match.state = filters.state
      }
      if (filters.description) {
        filtersInput[1].$match.description = new RegExp(filters.description, 'gi')
      }
      if (filters.workingHoursInMinutes) {
        if (filters.workingHoursInMinutes.from) {
          // eslint-disable-next-line no-param-reassign
          filters.workingHoursInMinutes.from = { $gte: filters.workingHoursInMinutes.from }
        }
        if (filters.workingHoursInMinutes.to) {
          // eslint-disable-next-line no-param-reassign
          filters.workingHoursInMinutes.to = { $lte: filters.workingHoursInMinutes.to }
        }
        filtersInput[1].$match.workingHoursInMinutes = {
          $elemMatch: { ...filters.workingHoursInMinutes }
        }
      }
      if (filters.notWorkingDays) {
        filtersInput[1].$match.notWorkingDays = {
          $elemMatch: { ...filters.notWorkingDays }
        }
      }

      if (filters._id) {
        filtersInput[1].$match._id = Types.ObjectId(filters._id)
      }

      if (filters.rootCategory) {
        filtersInput[1].$match.rootCategory = Types.ObjectId(filters.rootCategory)
      }
      if (filters.phoneNumbers) {
        filtersInput[1].$match.phoneNumbers = new RegExp(filters.phoneNumbers, 'gi')
      }

      if (filters.openNow) {
        const today = new Date()
        const timeToMinute = this.convertTimeToMinute(today)
        filtersInput[1].$match.workingHoursInMinutes = {
          $elemMatch: {
            type: this.getWeekDay(today),
            from: { $lte: timeToMinute },
            to: { $gte: timeToMinute }
          }
        }
      }
      if (filters.discount) {
        filtersInput.push({
          $lookup: {
            from: 'products',
            let: { shop_id: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ['$$shop_id', '$shop'] }, { $ne: ['$promotion', null] }]
                  }
                }
              }
            ],
            as: 'products'
          }
        })
      }
      if (filters.shopAdmin) {
        filtersInput[1].$match.shopAdmin = Types.ObjectId(filters.shopAdmin)
      }

      if (filters.shopMenu) {
        filtersInput[1].$match.shopMenu = Types.ObjectId(filters.shopMenu)
      }
      if (filters.categories) {
        filtersInput[1].$match.categories = {
          $in: filters.categories.map(i => Types.ObjectId(i))
        }
      }
      if (filters.attributes) {
        filtersInput[1].$match.attributes = {
          $in: filters.attributes.map(i => Types.ObjectId(i))
        }
      }
      if (filters.location) {
        filtersInput[0].$geoNear = {
          near: { type: 'Point', coordinates: [filters.location.long, filters.location.lat] },
          maxDistance: await getConstantValue('SHOP_MAXIMUM_DISTANCE', 100000),
          key: 'location',
          distanceField: 'dist.calculated',
          spherical: true
        }
      }
    }

    if (sort && sort.averageRate) {
      filtersInput.push({ $sort: { averageRate: sort.averageRate } })
    }
    if (sort && sort.numberOfRates) {
      filtersInput.push({ $sort: { numberOfRates: sort.numberOfRates } })
    }
    if (sort && sort.sumOfRates) {
      filtersInput.push({ $sort: { sumOfRates: sort.sumOfRates } })
    }
    if (sort && sort.priceRange) {
      filtersInput.push({ $sort: { budget: sort.priceRange } })
    }
    if (sort && sort.acceptCash) {
      filtersInput.push({ $sort: { acceptCash: sort.acceptCash } })
    }
    if (sort && sort.name) {
      filtersInput.push({ $sort: { name: sort.name } })
    }
    if (sort && sort.description) {
      filtersInput.push({ $sort: { description: sort.description } })
    }
    if (sort && sort.createdAt) {
      filtersInput.push({ $sort: { createdAt: sort.createdAt } })
    }
    if (sort && sort.preparingTime) {
      filtersInput.push({ $sort: { preparingTime: sort.preparingTime } })
    }
    if (sort && sort.updatedAt) {
      filtersInput.push({ $sort: { updatedAt: sort.updatedAt } })
    }
    if (sort && sort.address) {
      filtersInput.push({ $sort: { address: sort.address } })
    }
    if (sort && sort.origin) {
      filtersInput.push({ $sort: { origin: sort.origin } })
    }
    if (sort && sort.verified) {
      filtersInput.push({ $sort: { verified: sort.verified } })
    }
    if (!sort) {
      filtersInput.push({ $sort: { createdAt: -1 } })
    }
    if (!Object.keys(filtersInput[0]).length) filtersInput.shift()
    let response = await Model.aggregate([
      ...filtersInput,
      { $skip: pagination.skip },
      { $limit: pagination.limit }
    ])

    if (filters) {
      response = filters.discount ? response.filter(i => i.products.length > 0) : response
    }
    return response
  }

  async getShopsByAdminCount(filters: any) {
    const filtersInput: any[] = [{}, { $match: { isDeleted: false } }]

    if (filters) {
      if (filters.shopAdminName || filters.shopAdminPhoneNumber) {
        const f: any = {}
        if ('shopAdminPhoneNumber' in filters) {
          f.phoneNumber = new RegExp(filters.shopAdminPhoneNumber, 'gi')
          filters = _.omit(filters, 'shopAdminPhoneNumber')
        }
        if ('shopAdminName' in filters) {
          f.fullName = new RegExp(filters.shopAdminName, 'gi')
          filters = _.omit(filters, 'shopAdminName')
        }
        const shopAdmins = await adminService.find(f)
        if (shopAdmins) {
          filters = _.omit(filters, 'shopAdmin')
          const ids = shopAdmins.map(p => p._id)
          filtersInput[1].$match.shopAdmin = { $in: [...ids] }
        }
      }

      if (filters.budget && filters.budget !== 'all') {
        filtersInput[1].$match.budget = filters.budget
      }
      if ('active' in filters) {
        filtersInput[1].$match.active = filters.active
      }
      if ('isRejected' in filters) {
        filtersInput[1].$match.isRejected = filters.isRejected
      }

      if ('verified' in filters) {
        filtersInput[1].$match.verified = filters.verified
      }
      if (filters.createdAt) {
        // eslint-disable-next-line no-param-reassign
        filtersInput[1].$match.createdAt = {
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
      if (filters.updatedAt) {
        // eslint-disable-next-line no-param-reassign
        filtersInput[1].$match.updatedAt = {
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
      if (filters.preparingTime) {
        filtersInput[1].$match.preparingTime = filters.preparingTime
      }
      if ('averageRate' in filters && 'averageRateFrom' in filters) {
        filters.averageRate = {
          $gte: filters.averageRateFrom,
          $lte: filters.averageRate
        }
        delete filters.averageRateFrom
        filtersInput[1].$match.averageRate = filters.averageRate
      } else if ('averageRateFrom' in filters) {
        filters.averageRate = {
          $gte: filters.averageRateFrom
        }
        delete filters.averageRateFrom
        filtersInput[1].$match.averageRate = filters.averageRate
      } else if ('averageRate' in filters) {
        filters.averageRate = {
          $lte: filters.averageRate
        }
        filtersInput[1].$match.averageRate = filters.averageRate
      }
      if (filters.numberOfRates) {
        filtersInput[1].$match.numberOfRates = filters.numberOfRates
      }
      if (filters.sumOfRates) {
        filtersInput[1].$match.sumOfRates = filters.sumOfRates
      }

      if (filters.name) {
        filtersInput[1].$match.name = new RegExp(filters.name, 'gi')
      }
      if (filters.address) {
        filtersInput[1].$match.address = new RegExp(filters.address, 'gi')
      }
      if (filters.origin) {
        filtersInput[1].$match.origin = new RegExp(filters.origin, 'gi')
      }

      if ('state' in filters) {
        filtersInput[1].$match.state = filters.state
      }
      if (filters.description) {
        filtersInput[1].$match.description = new RegExp(filters.description, 'gi')
      }
      if (filters.workingHoursInMinutes) {
        if (filters.workingHoursInMinutes.from) {
          // eslint-disable-next-line no-param-reassign
          filters.workingHoursInMinutes.from = { $gte: filters.workingHoursInMinutes.from }
        }
        if (filters.workingHoursInMinutes.to) {
          // eslint-disable-next-line no-param-reassign
          filters.workingHoursInMinutes.to = { $lte: filters.workingHoursInMinutes.to }
        }
        filtersInput[1].$match.workingHoursInMinutes = {
          $elemMatch: { ...filters.workingHoursInMinutes }
        }
      }
      if (filters.notWorkingDays) {
        filtersInput[1].$match.notWorkingDays = {
          $elemMatch: { ...filters.notWorkingDays }
        }
      }

      if (filters._id) {
        filtersInput[1].$match._id = Types.ObjectId(filters._id)
      }

      if (filters.rootCategory) {
        filtersInput[1].$match.rootCategory = Types.ObjectId(filters.rootCategory)
      }
      if (filters.phoneNumbers) {
        filtersInput[1].$match.phoneNumbers = new RegExp(filters.phoneNumbers, 'gi')
      }

      if (filters.openNow) {
        const today = new Date()
        const timeToMinute = this.convertTimeToMinute(today)
        filtersInput[1].$match.workingHoursInMinutes = {
          $elemMatch: {
            type: this.getWeekDay(today),
            from: { $lte: timeToMinute },
            to: { $gte: timeToMinute }
          }
        }
      }
      if (filters.discount) {
        filtersInput.push({
          $lookup: {
            from: 'products',
            let: { shop_id: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ['$$shop_id', '$shop'] }, { $ne: ['$promotion', null] }]
                  }
                }
              }
            ],
            as: 'products'
          }
        })
      }
      if (filters.shopAdmin) {
        filtersInput[1].$match.shopAdmin = Types.ObjectId(filters.shopAdmin)
      }

      if (filters.shopMenu) {
        filtersInput[1].$match.shopMenu = Types.ObjectId(filters.shopMenu)
      }
      if (filters.categories) {
        filtersInput[1].$match.categories = {
          $in: filters.categories.map(i => Types.ObjectId(i))
        }
      }
      if (filters.attributes) {
        filtersInput[1].$match.attributes = {
          $in: filters.attributes.map(i => Types.ObjectId(i))
        }
      }
      if (filters.location) {
        filtersInput[0].$geoNear = {
          near: { type: 'Point', coordinates: [filters.location.long, filters.location.lat] },
          maxDistance: SHOP_MAXIMUM_DISTANCE,
          key: 'location',
          distanceField: 'dist.calculated',
          spherical: true
        }
      }
    }

    if (!Object.keys(filtersInput[0]).length) filtersInput.shift()
    let response = await Model.aggregate([...filtersInput])
    if (filters) {
      response = filters.discount ? response.filter(i => i.products.length > 0) : response
    }
    return response.length
  }
})(Model)
