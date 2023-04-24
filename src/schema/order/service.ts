import { Types } from 'mongoose'
import { ApolloError } from 'apollo-server-express'
import { omit } from 'lodash'
import moment from 'moment'
import Model from './schema'
import cartModel from '../cart/schema'
import serviceBase from '../../utils/serviceBase'
import orderPromotionService from '../orderPromotion/service'
import { RedisGetObject, RedisSetObject, RedisDelete } from '../../utils/redis'
import { PromotionFactory, PromotionFor } from '../../utils/calculation'
import paginator, { IPaginatorResponse } from '../../utils/paginator'
import { Pagination } from '../../utils/interfaces'
import driverOrPassengerFilters from '../../utils/driverOrPassengerFilters'

export default new (class service extends serviceBase {
  async getOrdersHistoryByShopAdmin(
    user: any,
    filters: any = {},
    pagination: Pagination = { skip: 0, limit: 15 },
    sort: any = { createdAt: -1 }
  ) {
    if ('_id' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters._id = Types.ObjectId(filters._id)
    }
    if ('user' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.user = Types.ObjectId(filters.user)
    }

    filters = await driverOrPassengerFilters(filters, true)

    if ('cart' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['cart._id'] = Types.ObjectId(filters.cart)
      // eslint-disable-next-line no-param-reassign
      filters = omit(filters, 'cart')
    }
    if ('payment' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.payment = Types.ObjectId(filters.payment)
    }

    if (filters.status) {
      // eslint-disable-next-line no-param-reassign
      filters.status = { $eq: filters.status, $nin: ['FINISHED_DUE_TO_NOT_PAYING'] }
    }
    if (!filters.status) {
      // eslint-disable-next-line no-param-reassign
      filters.status = { $nin: ['FINISHED_DUE_TO_NOT_PAYING'] }
    }

    if ('promotion' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.promotion = Types.ObjectId(filters.promotion)
    }
    if ('rootCategory' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['cart.rootCategory'] = Types.ObjectId(filters.rootCategory)
      // eslint-disable-next-line no-param-reassign
      filters = omit(filters, 'rootCategory')
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
    if ('paidAt' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.paidAt = {
        $gte: moment(new Date(filters.paidAt))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.paidAt))
          .utc()
          .endOf('date')
          .toDate()
      }
    }
    if ('shipmentAt' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.shipmentAt = {
        $gte: moment(new Date(filters.shipmentAt))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.shipmentAt))
          .utc()
          .endOf('date')
          .toDate()
      }
    }
    if ('address' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.address = new RegExp(filters.address, 'gi')
    }

    if ('commission' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.commission = {
        $gte: Math.floor(filters.commission),
        $lte: Math.ceil(filters.commission)
      }
    }
    if ('finalPrice' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.finalPrice = {
        $gte: Math.floor(filters.finalPrice),
        $lte: Math.ceil(filters.finalPrice)
      }
    }

    if ('description' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.description = new RegExp(filters.description, 'gi')
    }
    if ('tracking' in filters) {
      if ('trackId' in filters.tracking) {
        // eslint-disable-next-line no-param-reassign
        filters['tracking.trackId'] = new RegExp(filters.tracking.trackId, 'gi')
      }
      if ('estimatedDelivery' in filters.tracking) {
        // eslint-disable-next-line no-param-reassign
        filters['tracking.estimatedDelivery'] = {
          $gte: moment(new Date(filters.tracking.estimatedDelivery))
            .utc()
            .startOf('date')
            .toDate(),
          $lte: moment(new Date(filters.tracking.estimatedDelivery))
            .utc()
            .endOf('date')
            .toDate()
        }
      }
      // eslint-disable-next-line no-param-reassign
      filters = omit(filters, 'tracking')
    }
    if (sort.estimatedDelivery) {
      // eslint-disable-next-line no-param-reassign
      sort['tracking.estimatedDelivery'] = sort.estimatedDelivery
    }
    return Model.aggregate([
      {
        $lookup: {
          from: 'carts',
          localField: 'cart',
          foreignField: '_id',
          as: 'cart'
        }
      },
      { $unwind: '$cart' },
      { $match: { shop: Types.ObjectId(user.shop), ...filters } },
      { $sort: { ...sort } },
      { $skip: pagination.skip },
      { $limit: pagination.limit }
    ])
  }

  async getOrdersHistoryByShopAdminCount(user: any, filters: any = {}) {
    if ('_id' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters._id = Types.ObjectId(filters._id)
    }
    if ('user' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.user = Types.ObjectId(filters.user)
    }

    filters = await driverOrPassengerFilters(filters, true)

    if ('cart' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['cart._id'] = Types.ObjectId(filters.cart)
      // eslint-disable-next-line no-param-reassign
      filters = omit(filters, 'cart')
    }
    if ('payment' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.payment = Types.ObjectId(filters.payment)
    }
    if ('promotion' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.promotion = Types.ObjectId(filters.promotion)
    }

    if (filters.status) {
      // eslint-disable-next-line no-param-reassign
      filters.status = { $eq: filters.status, $nin: ['FINISHED_DUE_TO_NOT_PAYING'] }
    }
    if (!filters.status) {
      // eslint-disable-next-line no-param-reassign
      filters.status = { $nin: ['FINISHED_DUE_TO_NOT_PAYING'] }
    }

    if ('rootCategory' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['cart.rootCategory'] = Types.ObjectId(filters.rootCategory)
      // eslint-disable-next-line no-param-reassign
      filters = omit(filters, 'rootCategory')
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
    if ('paidAt' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.paidAt = {
        $gte: moment(new Date(filters.paidAt))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.paidAt))
          .utc()
          .endOf('date')
          .toDate()
      }
    }
    if ('shipmentAt' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.shipmentAt = {
        $gte: moment(new Date(filters.shipmentAt))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.shipmentAt))
          .utc()
          .endOf('date')
          .toDate()
      }
    }
    if ('address' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.address = new RegExp(filters.address, 'gi')
    }

    if ('commission' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.commission = {
        $gte: Math.floor(filters.commission),
        $lte: Math.ceil(filters.commission)
      }
    }
    if ('finalPrice' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.finalPrice = {
        $gte: Math.floor(filters.finalPrice),
        $lte: Math.ceil(filters.finalPrice)
      }
    }

    if ('description' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.description = new RegExp(filters.description, 'gi')
    }
    if ('tracking' in filters) {
      if ('trackId' in filters.tracking) {
        // eslint-disable-next-line no-param-reassign
        filters['tracking.trackId'] = new RegExp(filters.tracking.trackId, 'gi')
      }
      if ('estimatedDelivery' in filters.tracking) {
        // eslint-disable-next-line no-param-reassign
        filters['tracking.estimatedDelivery'] = {
          $gte: moment(new Date(filters.tracking.estimatedDelivery))
            .utc()
            .startOf('date')
            .toDate(),
          $lte: moment(new Date(filters.tracking.estimatedDelivery))
            .utc()
            .endOf('date')
            .toDate()
        }
      }
      // eslint-disable-next-line no-param-reassign
      filters = omit(filters, 'tracking')
    }
    const result = await Model.aggregate([
      {
        $lookup: {
          from: 'carts',
          localField: 'cart',
          foreignField: '_id',
          as: 'cart'
        }
      },
      { $unwind: '$cart' },
      { $match: { shop: Types.ObjectId(user.shop), ...filters } }
    ])
    return result.length
  }

  async getHistory(
    user: any,
    filters: any = {},
    pagination: any = { skip: 0, limit: 15 },
    sort: any = { createdAt: -1 }
  ): Promise<Array<any>> {
    // eslint-disable-next-line no-param-reassign
    filters['shop.rootCategory'] = Types.ObjectId(filters.rootCategory)
    // eslint-disable-next-line no-param-reassign
    filters = omit(filters, 'rootCategory')
    if (sort.estimatedDelivery) {
      // eslint-disable-next-line no-param-reassign
      sort['tracking.estimatedDelivery'] = sort.estimatedDelivery
    }
    if (filters.status) {
      // eslint-disable-next-line no-param-reassign
      filters.status = { $eq: filters.status, $nin: ['PENDING', 'FINISHED_DUE_TO_NOT_PAYING'] }
    }
    if (!filters.status) {
      // eslint-disable-next-line no-param-reassign
      filters.status = { $nin: ['PENDING', 'FINISHED_DUE_TO_NOT_PAYING'] }
    }
    if (filters._id) {
      // eslint-disable-next-line no-param-reassign
      filters._id = Types.ObjectId(filters._id)
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
      { $unwind: '$shop' },
      {
        $match: { user: Types.ObjectId(user.userId), ...filters }
      },
      { $sort: sort },
      { $skip: pagination.skip },
      { $limit: pagination.limit }
    ])
  }

  async calculateOrdersCountAndAmount(filters, shopId) {
    const ordersData = await this.model.aggregate([
      {
        $match: {
          shop: Types.ObjectId(shopId),
          createdAt: {
            $gte: moment(new Date(filters.from))
              .utc()
              .startOf('date')
              .toDate(),
            $lte: moment(new Date(filters.to))
              .utc()
              .endOf('date')
              .toDate()
          }
        }
      },
      {
        $group: {
          _id: null,
          totalOrderAmount: { $sum: '$shopIncome' },
          totalOrdersCount: { $sum: 1 }
        }
      }
    ])
    return ordersData.length
      ? {
          totalOrderAmount: ordersData[0].totalOrderAmount,
          totalOrdersCount: ordersData[0].totalOrdersCount
        }
      : { totalOrderAmount: 0, totalOrdersCount: 0 }
  }

  async usePromotion(
    category: String,
    promotionCode: string,
    usedFor: Types.ObjectId | null,
    userId: Types.ObjectId | null
  ): Promise<any> {
    const orderPromotion = await orderPromotionService.find({ promotionCode })

    if (orderPromotion) {
      const cart: any = await RedisGetObject(`cart_${category}_user-${userId}`)

      const orderPromotionCalculator = PromotionFactory.setCalculationFor(PromotionFor.order)

      const finalPrice = orderPromotionCalculator.calculate(cart.finalPrice, promotionCode, {
        userId,
        usedFor
      })

      const order: any = await RedisGetObject(`order_${category}_user-${userId}`)

      if (!order) throw new ApolloError('order not found', '404')

      order.finalPrice = finalPrice
      await RedisSetObject(`order_${category}_user-${userId}`, order)

      return order
    }
    throw new ApolloError('promotion not found', '404')
  }

  async getOrdersByDetail(filters: any = {}, sort) {
    // eslint-disable-next-line no-param-reassign
    filters.createdAt = {
      $gte: moment(new Date(filters.from))
        .utc()
        .startOf('date')
        .toDate(),
      $lte: moment(new Date(filters.to))
        .utc()
        .endOf('date')
        .toDate()
    }
    // eslint-disable-next-line no-param-reassign
    filters = omit(filters, ['from', 'to'])
    if ('_id' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters._id = Types.ObjectId(filters._id)
    }
    if ('user' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.user = Types.ObjectId(filters.user)
    }
    if ('shop' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.shop = Types.ObjectId(filters.shop)
    }

    filters = await driverOrPassengerFilters(filters, true)

    if ('rootCategory' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['cart.shop.rootCategory'] = Types.ObjectId(filters.rootCategory)
      // eslint-disable-next-line no-param-reassign
      filters = omit(filters, 'rootCategory')
    }

    const orders = await this.model.aggregate([
      {
        $lookup: {
          from: 'carts',
          let: { cart_id: '$cart' },
          pipeline: [
            { $match: { $expr: { $eq: ['$$cart_id', '$_id'] } } },
            {
              $lookup: {
                from: 'shops',
                let: { shop_id: '$shop' },
                pipeline: [{ $match: { $expr: { $eq: ['$$shop_id', '$_id'] } } }],
                as: 'shop'
              }
            },
            { $unwind: '$shop' }
          ],
          as: 'cart'
        }
      },
      { $unwind: '$cart' },
      { $match: { ...filters } },
      { $sort: sort }
    ])

    const report = {
      benefitForSpark: 0,
      userTakings: 0,
      shopsIncome: 0
    }
    // eslint-disable-next-line no-restricted-syntax
    for (const order of orders) {
      report.benefitForSpark = +(report.benefitForSpark + order.commission).toFixed(2)
      report.userTakings = +(report.userTakings + order.cart.finalPrice).toFixed(2)
      report.shopsIncome = +(report.shopsIncome + order.cart.finalPrice - order.commission).toFixed(
        2
      )
      order.cart.shop = order.cart.shop._id
      order.cart = order.cart._id
    }
    return {
      orders,
      numberOfOrders: orders.length,
      ...report
    }
  }

  async getLastShopOrder(user: any) {
    return Model.findOne({ user: user.userId })
      .sort({ createdAt: -1 })
      .limit(1)
      .exec()
  }

  async orderAcceptance(category: String, userId: Types.ObjectId | String): Promise<any> {
    const cart: any = await RedisGetObject(`cart_${category}_user-${userId}`)
    const order: any = await RedisGetObject(`order_${category}_user-${userId}`)

    if (!order || !cart) throw new ApolloError('cart or order does not exists', '404')

    const cartDetail = await cartModel.create(cart)
    order.cart = cartDetail._id
    const orderDetail = order

    return Model.create(orderDetail)
  }

  async orderRejection(category: String, userId: Types.ObjectId): Promise<any> {
    return RedisDelete(`order_${category}_user-${userId}`)
  }

  async getOrdersByAdmin(
    filters: any = {},
    pagination: Pagination = { skip: 0, limit: 15 },
    sort: any = { createdAt: -1 }
  ) {
    if ('_id' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters._id = Types.ObjectId(filters._id)
    }
    if ('user' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['user._id'] = Types.ObjectId(filters.user)
      // eslint-disable-next-line no-param-reassign
      filters = omit(filters, 'user')
    }
    if ('cart' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.cart = Types.ObjectId(filters.cart)
    }
    if ('payment' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.payment = Types.ObjectId(filters.payment)
    }
    if ('shop' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['shop._id'] = Types.ObjectId(filters.shop)
      // eslint-disable-next-line no-param-reassign
      filters = omit(filters, 'shop')
    }

    if ('passengerPhoneNumber' in filters) {
      filters['user.phoneNumber'] = new RegExp(filters.passengerPhoneNumber, 'gi')
      filters = omit(filters, 'passengerPhoneNumber')
    }
    if ('passengerName' in filters) {
      filters['user.fullName'] = new RegExp(filters.passengerName, 'gi')
      filters = omit(filters, 'passengerName')
    }
    if ('shopPhoneNumber' in filters) {
      filters['shop.phoneNumbers'] = new RegExp(filters.shopPhoneNumber, 'gi')
      filters = omit(filters, 'shopPhoneNumber')
    }
    if ('shopName' in filters) {
      filters['shop.name'] = new RegExp(filters.shopName, 'gi')
      filters = omit(filters, 'shopName')
    }

    if ('promotion' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.promotion = Types.ObjectId(filters.promotion)
    }
    if ('rootCategory' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['shop.rootCategory'] = Types.ObjectId(filters.rootCategory)
      // eslint-disable-next-line no-param-reassign
      filters = omit(filters, 'rootCategory')
    }

    if (filters.status) {
      // eslint-disable-next-line no-param-reassign
      filters.status = { $eq: filters.status, $nin: ['FINISHED_DUE_TO_NOT_PAYING'] }
    }
    if (!filters.status) {
      // eslint-disable-next-line no-param-reassign
      filters.status = { $nin: ['FINISHED_DUE_TO_NOT_PAYING'] }
    }

    if ('finalPrice' in filters && 'finalPriceFrom' in filters) {
      filters.finalPrice = {
        $gte: filters.finalPriceFrom,
        $lte: filters.finalPrice
      }
      delete filters.finalPriceFrom
    } else if ('finalPriceFrom' in filters) {
      filters.finalPrice = {
        $gte: filters.finalPriceFrom
      }
      delete filters.finalPriceFrom
    } else if ('finalPrice' in filters) {
      filters.finalPrice = {
        $lte: filters.finalPrice
      }
    }

    if ('commission' in filters && 'commissionFrom' in filters) {
      filters.commission = {
        $gte: filters.commissionFrom,
        $lte: filters.commission
      }
      delete filters.commissionFrom
    } else if ('commissionFrom' in filters) {
      filters.commission = {
        $gte: filters.commissionFrom
      }
      delete filters.commissionFrom
    } else if ('commission' in filters) {
      filters.commission = {
        $lte: filters.commission
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
    if ('paidAt' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.paidAt = {
        $gte: moment(new Date(filters.paidAt))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.paidAt))
          .utc()
          .endOf('date')
          .toDate()
      }
    }
    if ('shipmentAt' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.shipmentAt = {
        $gte: moment(new Date(filters.shipmentAt))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.shipmentAt))
          .utc()
          .endOf('date')
          .toDate()
      }
    }
    if ('address' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.address = new RegExp(filters.address, 'gi')
    }

    if ('tracking' in filters) {
      if ('trackId' in filters.tracking) {
        // eslint-disable-next-line no-param-reassign
        filters['tracking.trackId'] = new RegExp(filters.tracking.trackId, 'gi')
      }
      if ('estimatedDelivery' in filters.tracking) {
        // eslint-disable-next-line no-param-reassign
        filters['tracking.estimatedDelivery'] = {
          $gte: moment(new Date(filters.tracking.estimatedDelivery))
            .utc()
            .startOf('date')
            .toDate(),
          $lte: moment(new Date(filters.tracking.estimatedDelivery))
            .utc()
            .endOf('date')
            .toDate()
        }
      }
      // eslint-disable-next-line no-param-reassign
      filters = omit(filters, 'tracking')
    }
    if (sort.estimatedDelivery) {
      // eslint-disable-next-line no-param-reassign
      sort['tracking.estimatedDelivery'] = sort.estimatedDelivery
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

  async getOrdersByAdminCount(filters: any = {}) {
    if ('_id' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters._id = Types.ObjectId(filters._id)
    }
    if ('user' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['user._id'] = Types.ObjectId(filters.user)
      // eslint-disable-next-line no-param-reassign
      filters = omit(filters, 'user')
    }
    if ('cart' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.cart = Types.ObjectId(filters.cart)
    }
    if ('payment' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.payment = Types.ObjectId(filters.payment)
    }
    if ('shop' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['shop._id'] = Types.ObjectId(filters.shop)
      // eslint-disable-next-line no-param-reassign
      filters = omit(filters, 'shop')
    }

    if ('passengerPhoneNumber' in filters) {
      filters['user.phoneNumber'] = new RegExp(filters.passengerPhoneNumber, 'gi')
      filters = omit(filters, 'passengerPhoneNumber')
    }
    if ('passengerName' in filters) {
      filters['user.fullName'] = new RegExp(filters.passengerName, 'gi')
      filters = omit(filters, 'passengerName')
    }
    if ('shopPhoneNumber' in filters) {
      filters['shop.phoneNumbers'] = new RegExp(filters.shopPhoneNumber, 'gi')
      filters = omit(filters, 'shopPhoneNumber')
    }
    if ('shopName' in filters) {
      filters['shop.name'] = new RegExp(filters.shopName, 'gi')
      filters = omit(filters, 'shopName')
    }

    if ('promotion' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.promotion = Types.ObjectId(filters.promotion)
    }
    if ('rootCategory' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['shop.rootCategory'] = Types.ObjectId(filters.rootCategory)
      // eslint-disable-next-line no-param-reassign
      filters = omit(filters, 'rootCategory')
    }

    if (filters.status) {
      // eslint-disable-next-line no-param-reassign
      filters.status = { $eq: filters.status, $nin: ['FINISHED_DUE_TO_NOT_PAYING'] }
    }
    if (!filters.status) {
      // eslint-disable-next-line no-param-reassign
      filters.status = { $nin: ['FINISHED_DUE_TO_NOT_PAYING'] }
    }

    if ('finalPrice' in filters && 'finalPriceFrom' in filters) {
      filters.finalPrice = {
        $gte: filters.finalPriceFrom,
        $lte: filters.finalPrice
      }
      delete filters.finalPriceFrom
    } else if ('finalPriceFrom' in filters) {
      filters.finalPrice = {
        $gte: filters.finalPriceFrom
      }
      delete filters.finalPriceFrom
    } else if ('finalPrice' in filters) {
      filters.finalPrice = {
        $lte: filters.finalPrice
      }
    }

    if ('commission' in filters && 'commissionFrom' in filters) {
      filters.commission = {
        $gte: filters.commissionFrom,
        $lte: filters.commission
      }
      delete filters.commissionFrom
    } else if ('commissionFrom' in filters) {
      filters.commission = {
        $gte: filters.commissionFrom
      }
      delete filters.commissionFrom
    } else if ('commission' in filters) {
      filters.commission = {
        $lte: filters.commission
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
    if ('paidAt' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.paidAt = {
        $gte: moment(new Date(filters.paidAt))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.paidAt))
          .utc()
          .endOf('date')
          .toDate()
      }
    }
    if ('shipmentAt' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.shipmentAt = {
        $gte: moment(new Date(filters.shipmentAt))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.shipmentAt))
          .utc()
          .endOf('date')
          .toDate()
      }
    }
    if ('address' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.address = new RegExp(filters.address, 'gi')
    }

    if ('tracking' in filters) {
      if ('trackId' in filters.tracking) {
        // eslint-disable-next-line no-param-reassign
        filters['tracking.trackId'] = new RegExp(filters.tracking.trackId, 'gi')
      }
      if ('estimatedDelivery' in filters.tracking) {
        // eslint-disable-next-line no-param-reassign
        filters['tracking.estimatedDelivery'] = {
          $gte: moment(new Date(filters.tracking.estimatedDelivery))
            .utc()
            .startOf('date')
            .toDate(),
          $lte: moment(new Date(filters.tracking.estimatedDelivery))
            .utc()
            .endOf('date')
            .toDate()
        }
      }
      // eslint-disable-next-line no-param-reassign
      filters = omit(filters, 'tracking')
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

  async getOrdersByShopAdmin(
    user: any,
    filters: any = {},
    pagination: Pagination = { skip: 0, limit: 15 },
    sort: any = { createdAt: -1 }
  ) {
    // eslint-disable-next-line no-param-reassign
    filters['shop._id'] = Types.ObjectId(user.shop)
    if ('_id' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters._id = Types.ObjectId(filters._id)
    }
    if ('user' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['user._id'] = Types.ObjectId(filters.user)
      // eslint-disable-next-line no-param-reassign
      filters = omit(filters, 'user')
    }
    if ('passengerPhoneNumber' in filters) {
      filters['user.phoneNumber'] = new RegExp(filters.passengerPhoneNumber, 'gi')
      filters = omit(filters, 'passengerPhoneNumber')
    }
    if ('passengerName' in filters) {
      filters['user.fullName'] = new RegExp(filters.passengerName, 'gi')
      filters = omit(filters, 'passengerName')
    }
    if ('shopPhoneNumber' in filters) {
      filters['shop.phoneNumbers'] = new RegExp(filters.shopPhoneNumber, 'gi')
      filters = omit(filters, 'shopPhoneNumber')
    }
    if ('shopName' in filters) {
      filters['shop.name'] = new RegExp(filters.shopName, 'gi')
      filters = omit(filters, 'shopName')
    }
    if ('cart' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.cart = Types.ObjectId(filters.cart)
    }
    if ('payment' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.payment = Types.ObjectId(filters.payment)
    }
    if ('promotion' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.promotion = Types.ObjectId(filters.promotion)
    }

    if (filters.status) {
      // eslint-disable-next-line no-param-reassign
      filters.status = { $eq: filters.status, $nin: ['FINISHED_DUE_TO_NOT_PAYING'] }
    }
    if (!filters.status) {
      // eslint-disable-next-line no-param-reassign
      filters.status = { $nin: ['FINISHED_DUE_TO_NOT_PAYING'] }
    }

    if ('finalPrice' in filters && 'finalPriceFrom' in filters) {
      filters.finalPrice = {
        $gte: filters.finalPriceFrom,
        $lte: filters.finalPrice
      }
      delete filters.finalPriceFrom
    } else if ('finalPriceFrom' in filters) {
      filters.finalPrice = {
        $gte: filters.finalPriceFrom
      }
      delete filters.finalPriceFrom
    } else if ('finalPrice' in filters) {
      filters.finalPrice = {
        $lte: filters.finalPrice
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
    if ('paidAt' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.paidAt = {
        $gte: moment(new Date(filters.paidAt))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.paidAt))
          .utc()
          .endOf('date')
          .toDate()
      }
    }
    if ('shipmentAt' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.shipmentAt = {
        $gte: moment(new Date(filters.shipmentAt))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.shipmentAt))
          .utc()
          .endOf('date')
          .toDate()
      }
    }
    if ('address' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.address = new RegExp(filters.address, 'gi')
    }

    if ('commission' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.commission = {
        $gte: Math.floor(filters.commission),
        $lte: Math.ceil(filters.commission)
      }
    }

    if ('tracking' in filters) {
      if ('trackId' in filters.tracking) {
        // eslint-disable-next-line no-param-reassign
        filters['tracking.trackId'] = new RegExp(filters.tracking.trackId, 'gi')
      }
      if ('estimatedDelivery' in filters.tracking) {
        // eslint-disable-next-line no-param-reassign
        filters['tracking.estimatedDelivery'] = {
          $gte: moment(new Date(filters.tracking.estimatedDelivery))
            .utc()
            .startOf('date')
            .toDate(),
          $lte: moment(new Date(filters.tracking.estimatedDelivery))
            .utc()
            .endOf('date')
            .toDate()
        }
      }
      // eslint-disable-next-line no-param-reassign
      filters = omit(filters, 'tracking')
    }
    if (sort.estimatedDelivery) {
      // eslint-disable-next-line no-param-reassign
      sort['tracking.estimatedDelivery'] = sort.estimatedDelivery
    }

    if (filters.isCurrentOrder) {
      filters.status = {
        $in: ['ACCEPTED', 'SHIPPING']
      }
      delete filters.isCurrentOrder
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
      { $unwind: '$user' },
      { $unwind: '$shop' },
      { $match: { ...filters } },
      { $sort: { ...sort } },
      { $skip: pagination.skip },
      { $limit: pagination.limit }
    ])
  }

  async getOrdersByShopAdminCount(user: any, filters: any = {}) {
    // eslint-disable-next-line no-param-reassign
    filters['shop._id'] = Types.ObjectId(user.shop)
    if ('_id' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters._id = Types.ObjectId(filters._id)
    }
    if ('user' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['user._id'] = Types.ObjectId(filters.user)
      // eslint-disable-next-line no-param-reassign
      filters = omit(filters, 'user')
    }
    if ('passengerPhoneNumber' in filters) {
      filters['user.phoneNumber'] = new RegExp(filters.passengerPhoneNumber, 'gi')
      filters = omit(filters, 'passengerPhoneNumber')
    }
    if ('passengerName' in filters) {
      filters['user.fullName'] = new RegExp(filters.passengerName, 'gi')
      filters = omit(filters, 'passengerName')
    }
    if ('shopPhoneNumber' in filters) {
      filters['shop.phoneNumbers'] = new RegExp(filters.shopPhoneNumber, 'gi')
      filters = omit(filters, 'shopPhoneNumber')
    }
    if ('shopName' in filters) {
      filters['shop.name'] = new RegExp(filters.shopName, 'gi')
      filters = omit(filters, 'shopName')
    }
    if ('cart' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.cart = Types.ObjectId(filters.cart)
    }
    if ('payment' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.payment = Types.ObjectId(filters.payment)
    }
    if ('promotion' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.promotion = Types.ObjectId(filters.promotion)
    }

    if (filters.status) {
      // eslint-disable-next-line no-param-reassign
      filters.status = { $eq: filters.status, $nin: ['FINISHED_DUE_TO_NOT_PAYING'] }
    }
    if (!filters.status) {
      // eslint-disable-next-line no-param-reassign
      filters.status = { $nin: ['FINISHED_DUE_TO_NOT_PAYING'] }
    }

    if ('finalPrice' in filters && 'finalPriceFrom' in filters) {
      filters.finalPrice = {
        $gte: filters.finalPriceFrom,
        $lte: filters.finalPrice
      }
      delete filters.finalPriceFrom
    } else if ('finalPriceFrom' in filters) {
      filters.finalPrice = {
        $gte: filters.finalPriceFrom
      }
      delete filters.finalPriceFrom
    } else if ('finalPrice' in filters) {
      filters.finalPrice = {
        $lte: filters.finalPrice
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
    if ('paidAt' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.paidAt = {
        $gte: moment(new Date(filters.paidAt))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.paidAt))
          .utc()
          .endOf('date')
          .toDate()
      }
    }
    if ('shipmentAt' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.shipmentAt = {
        $gte: moment(new Date(filters.shipmentAt))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.shipmentAt))
          .utc()
          .endOf('date')
          .toDate()
      }
    }
    if ('address' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.address = new RegExp(filters.address, 'gi')
    }

    if ('commission' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.commission = {
        $gte: Math.floor(filters.commission),
        $lte: Math.ceil(filters.commission)
      }
    }

    if ('tracking' in filters) {
      if ('trackId' in filters.tracking) {
        // eslint-disable-next-line no-param-reassign
        filters['tracking.trackId'] = new RegExp(filters.tracking.trackId, 'gi')
      }
      if ('estimatedDelivery' in filters.tracking) {
        // eslint-disable-next-line no-param-reassign
        filters['tracking.estimatedDelivery'] = {
          $gte: moment(new Date(filters.tracking.estimatedDelivery))
            .utc()
            .startOf('date')
            .toDate(),
          $lte: moment(new Date(filters.tracking.estimatedDelivery))
            .utc()
            .endOf('date')
            .toDate()
        }
      }
      // eslint-disable-next-line no-param-reassign
      filters = omit(filters, 'tracking')
    }
    const result: any = await Model.aggregate([
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
      { $unwind: '$user' },
      { $unwind: '$shop' },
      { $match: { ...filters } }
    ])
    return result.length
  }
})(Model)
