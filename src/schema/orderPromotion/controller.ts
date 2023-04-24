/* eslint-disable no-await-in-loop */
import { Types } from 'mongoose'
import * as _ from 'lodash'
import { ApolloError } from 'apollo-server-express'
import moment from 'moment'
import service from './service'
import controllerBase from '../../utils/controllerBase'
import shopService from '../shop/service'
import { Pagination } from '../../utils/interfaces'
import orderPromotionUsedService from '../orderPromotionUsed/service'
import { PromotionFactory, PromotionFor } from '../../utils/calculation'
import tripPromotionService from '../tripPromotion/service'
import tripPromotionUsedService from '../tripPromotionUsed/service'
import driverOrPassengerFilters from '../../utils/driverOrPassengerFilters'

export default new (class Controller extends controllerBase {
  async createOrderPromotionByShopAdmin(input: any, user: any) {
    const { promotionCode, useLimitCount }: any = input
    if (!promotionCode) {
      throw new ApolloError('promotion code cannot be empty', '400')
    }

    const shop: any = await shopService.findById(user.shop)
    if (!shop) {
      throw new ApolloError('shop does not exists', '400')
    }

    const existingPromotion = await this.service.findOne({ promotionCode, shop: shop._id })
    if (existingPromotion) {
      throw new ApolloError('a promotion with this code is available.', '400')
    }
    if (useLimitCount !== undefined && useLimitCount !== null) {
      if (useLimitCount < 0 || !useLimitCount) {
        throw new ApolloError('invalid useLimitCount', '400')
      }
    }

    return service.create({ ...input, shop: user.shop })
  }

  async updateOrderPromotionByShopAdmin(promotionId: Types.ObjectId, input: any, user: any) {
    const { promotionCode, useLimitCount }: any = input
    if (!promotionCode) {
      throw new ApolloError('promotion code cannot be empty', '400')
    }
    const existingPromotion: any = await this.service.findOne({ promotionCode, shop: user.shop })

    if (existingPromotion && existingPromotion._id.toString() !== promotionId.toString()) {
      throw new ApolloError('a promotion with this code is available.', '400')
    }
    if (useLimitCount !== undefined && useLimitCount !== null) {
      if (useLimitCount < 0 || !useLimitCount) {
        throw new ApolloError('invalid useLimitCount', '400')
      }
    }
    const shop: any = await shopService.findById(user.shop)
    if (!shop) {
      throw new ApolloError('shop does not exists', '400')
    }
    return service.findOneAndUpdate({ _id: promotionId, shop: user.shop }, input)
  }

  async expireOrderPromotionByShopAdmin(promotionId: Types.ObjectId) {
    return service.findOneAndUpdate(
      { _id: promotionId },
      {
        to: moment().utc()
      }
    )
  }

  async getOrderPromotionsByAdmin(filters: any = {}, pagination, sort) {
    filters = await driverOrPassengerFilters(filters)
    if ('from' in filters && 'fromFrom' in filters) {
      filters.from = {
        $gte: moment(new Date(filters.fromFrom))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.from))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.fromFrom
    } else if ('fromFrom' in filters) {
      filters.from = {
        $gte: moment(new Date(filters.fromFrom))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.fromFrom
    } else if ('from' in filters) {
      filters.from = {
        $lte: moment(new Date(filters.from))
          .utc()
          .startOf('date')
          .toDate()
      }
    }
    if ('to' in filters && 'toFrom' in filters) {
      filters.to = {
        $gte: moment(new Date(filters.toFrom))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.to))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.toFrom
    } else if ('toFrom' in filters) {
      filters.to = {
        $gte: moment(new Date(filters.toFrom))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.toFrom
    } else if ('to' in filters) {
      filters.to = {
        $lte: moment(new Date(filters.to))
          .utc()
          .startOf('date')
          .toDate()
      }
    }

    if ('maximumPromotion' in filters && 'maximumPromotionFrom' in filters) {
      filters.maximumPromotion = {
        $gte: filters.maximumPromotionFrom,
        $lte: filters.maximumPromotion
      }
      delete filters.maximumPromotionFrom
    } else if ('maximumPromotionFrom' in filters) {
      filters.maximumPromotion = {
        $gte: filters.maximumPromotionFrom
      }
      delete filters.maximumPromotionFrom
    } else if ('maximumPromotion' in filters) {
      filters.maximumPromotion = {
        $lte: filters.maximumPromotion
      }
    }
    if ('percent' in filters && 'percentFrom' in filters) {
      filters.percent = {
        $gte: filters.percentFrom,
        $lte: filters.percent
      }
      delete filters.percentFrom
    } else if ('percentFrom' in filters) {
      filters.percent = {
        $gte: filters.percentFrom
      }
      delete filters.percentFrom
    } else if ('percent' in filters) {
      filters.percent = {
        $lte: filters.percent
      }
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
    if ('promotionCode' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.promotionCode = new RegExp(filters.promotionCode, 'gi')
    }

    return service.find(filters, pagination, sort)
  }

  async getOrderPromotionsByAdminCount(filters: any = {}) {
    filters = await driverOrPassengerFilters(filters)
    if ('from' in filters && 'fromFrom' in filters) {
      filters.from = {
        $gte: moment(new Date(filters.fromFrom))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.from))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.fromFrom
    } else if ('fromFrom' in filters) {
      filters.from = {
        $gte: moment(new Date(filters.fromFrom))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.fromFrom
    } else if ('from' in filters) {
      filters.from = {
        $lte: moment(new Date(filters.from))
          .utc()
          .startOf('date')
          .toDate()
      }
    }
    if ('to' in filters && 'toFrom' in filters) {
      filters.to = {
        $gte: moment(new Date(filters.toFrom))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.to))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.toFrom
    } else if ('toFrom' in filters) {
      filters.to = {
        $gte: moment(new Date(filters.toFrom))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.toFrom
    } else if ('to' in filters) {
      filters.to = {
        $lte: moment(new Date(filters.to))
          .utc()
          .startOf('date')
          .toDate()
      }
    }

    if ('maximumPromotion' in filters && 'maximumPromotionFrom' in filters) {
      filters.maximumPromotion = {
        $gte: filters.maximumPromotionFrom,
        $lte: filters.maximumPromotion
      }
      delete filters.maximumPromotionFrom
    } else if ('maximumPromotionFrom' in filters) {
      filters.maximumPromotion = {
        $gte: filters.maximumPromotionFrom
      }
      delete filters.maximumPromotionFrom
    } else if ('maximumPromotion' in filters) {
      filters.maximumPromotion = {
        $lte: filters.maximumPromotion
      }
    }
    if ('percent' in filters && 'percentFrom' in filters) {
      filters.percent = {
        $gte: filters.percentFrom,
        $lte: filters.percent
      }
      delete filters.percentFrom
    } else if ('percentFrom' in filters) {
      filters.percent = {
        $gte: filters.percentFrom
      }
      delete filters.percentFrom
    } else if ('percent' in filters) {
      filters.percent = {
        $lte: filters.percent
      }
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
    if ('promotionCode' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.promotionCode = new RegExp(filters.promotionCode, 'gi')
    }
    return service.count(filters)
  }

  async getOrderPromotions(userId, filters: any = {}, pagination, sort) {
    if ('maximumPromotion' in filters && 'maximumPromotionFrom' in filters) {
      filters.maximumPromotion = {
        $gte: filters.maximumPromotionFrom,
        $lte: filters.maximumPromotion
      }
      delete filters.maximumPromotionFrom
    } else if ('maximumPromotionFrom' in filters) {
      filters.maximumPromotion = {
        $gte: filters.maximumPromotionFrom
      }
      delete filters.maximumPromotionFrom
    } else if ('maximumPromotion' in filters) {
      filters.maximumPromotion = {
        $lte: filters.maximumPromotion
      }
    }
    if ('percentPromotion' in filters && 'percentPromotionFrom' in filters) {
      filters.percentPromotion = {
        $gte: filters.percentPromotionFrom,
        $lte: filters.percentPromotion
      }
      delete filters.percentPromotionFrom
    } else if ('percentPromotionFrom' in filters) {
      filters.percentPromotion = {
        $gte: filters.percentPromotionFrom
      }
      delete filters.percentPromotionFrom
    } else if ('percentPromotion' in filters) {
      filters.percentPromotion = {
        $lte: filters.percentPromotion
      }
    }
    if ('from' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.from = {
        $gte: moment(new Date(filters.from))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.from))
          .utc()
          .endOf('date')
          .toDate()
      }
    }
    if ('to' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.to = {
        $gte: moment(new Date(filters.to))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.to))
          .utc()
          .endOf('date')
          .toDate()
      }
    }
    return this.service.find(
      {
        ...filters
      },
      pagination,
      sort
    )
  }

  async getOrderPromotionsCount(userId, filters: any = {}) {
    if ('maximumPromotion' in filters && 'maximumPromotionFrom' in filters) {
      filters.maximumPromotion = {
        $gte: filters.maximumPromotionFrom,
        $lte: filters.maximumPromotion
      }
      delete filters.maximumPromotionFrom
    } else if ('maximumPromotionFrom' in filters) {
      filters.maximumPromotion = {
        $gte: filters.maximumPromotionFrom
      }
      delete filters.maximumPromotionFrom
    } else if ('maximumPromotion' in filters) {
      filters.maximumPromotion = {
        $lte: filters.maximumPromotion
      }
    }
    if ('percentPromotion' in filters && 'percentPromotionFrom' in filters) {
      filters.percentPromotion = {
        $gte: filters.percentPromotionFrom,
        $lte: filters.percentPromotion
      }
      delete filters.percentPromotionFrom
    } else if ('percentPromotionFrom' in filters) {
      filters.percentPromotion = {
        $gte: filters.percentPromotionFrom
      }
      delete filters.percentPromotionFrom
    } else if ('percentPromotion' in filters) {
      filters.percentPromotion = {
        $lte: filters.percentPromotion
      }
    }
    if ('from' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.from = {
        $gte: moment(new Date(filters.from))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.from))
          .utc()
          .endOf('date')
          .toDate()
      }
    }
    if ('to' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.to = {
        $gte: moment(new Date(filters.to))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.to))
          .utc()
          .endOf('date')
          .toDate()
      }
    }
    return this.service.count({
      ...filters
    })
  }

  async getOrderPromotion(_id, userId: Types.ObjectId) {
    return service.findOne({
      _id
    })
  }

  async getMyOrderPromotions(user: any, pagination: Pagination, sort: any = { createdAt: -1 }) {
    return this.service.find(
      {
        to: {
          $gte: moment()
            .utc()
            .startOf('date')
            .toDate()
        }
      },
      pagination,
      sort
    )
  }

  async checkPromotionCodeIsValid(user, shop, code, order, totalPrice) {
    const invalidResponse = {
      isValid: false
    }

    let isTripPromotion = false

    // get promotion
    let promotion = await service.findOne({
      promotionCode: code,
      shop
    })
    if (!promotion) {
      promotion = await tripPromotionService.findOne({
        promotionCode: code,
        for: { $ne: 'RIDE' },
        $or: [
          {
            'canUse.0': { $exists: true },
            canUse: user.sub
          },
          {
            'canUse.0': { $exists: false },
            'canNotUse.0': { $exists: true },
            canNotUse: { $ne: user.sub }
          },
          {
            'canUse.0': { $exists: false },
            'canNotUse.0': { $exists: false }
          }
        ]
      })
      isTripPromotion = true

      if (!promotion) {
        return invalidResponse
      }
    }

    // check that promotion is valid or not
    try {
      const orderPromotionCalculator = PromotionFactory.setCalculationFor(PromotionFor.order)
      const promotionDiscount = await orderPromotionCalculator.calculate(
        totalPrice,
        promotion,
        {
          userId: user.sub,
          usedFor: order
        },
        true,
        isTripPromotion ? tripPromotionUsedService : null
      )

      if (promotionDiscount > 0) {
        return {
          isValid: true,
          promotionDiscount,
          priceAfterPromotion: totalPrice - promotionDiscount,
          promotion
        }
      }
    } catch (e) {
      return invalidResponse
    }

    return invalidResponse
  }

  async getOrderPromotionsByShopAdmin(shopId, filters: any = {}, pagination, sort) {
    if ('from' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.from = {
        $gte: moment(new Date(filters.from))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.from))
          .utc()
          .endOf('date')
          .toDate()
      }
    }
    if ('to' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.to = {
        $gte: moment(new Date(filters.to))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.to))
          .utc()
          .endOf('date')
          .toDate()
      }
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
    if ('promotionCode' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.promotionCode = new RegExp(filters.promotionCode, 'gi')
    }
    return service.find({ shop: shopId, ...filters }, pagination, sort)
  }

  async getOrderPromotionsByShopAdminCount(shopId, filters: any = {}) {
    if ('from' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.from = {
        $gte: moment(new Date(filters.from))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.from))
          .utc()
          .endOf('date')
          .toDate()
      }
    }
    if ('to' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.to = {
        $gte: moment(new Date(filters.to))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.to))
          .utc()
          .endOf('date')
          .toDate()
      }
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
    if ('promotionCode' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.promotionCode = new RegExp(filters.promotionCode, 'gi')
    }
    return service.count({ shop: shopId, ...filters })
  }

  async deleteOrderPromotionByAdminOrShopAdmin(idSet: Types.ObjectId[]) {
    for (let index = 0; index < idSet.length; index++) {
      const orderPromotionId = idSet[index]
      const orderPromotion = await service.findById(orderPromotionId)
      if (!orderPromotion) throw new ApolloError('This order promotion does not exist.', '400')
      if (orderPromotion.isDeleted)
        throw new ApolloError('This order promotion has deleted before.', '400')
    }
    return idSet.map(id => service.findOneAndUpdate(id, { isDeleted: true }))
  }
})(service)
