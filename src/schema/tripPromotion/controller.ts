/* eslint-disable no-await-in-loop */
import { ApolloError } from 'apollo-server-express'
import { Types } from 'mongoose'
import moment from 'moment'
import { Pagination } from '../../utils/interfaces'
import service from './service'
import BaseController from '../../utils/controllerBase'

export default new (class Controller extends BaseController {
  async getMyTripPromotions(user: any, pagination: Pagination, sort: any = { createdAt: -1 }) {
    return this.service.find(
      {
        to: {
          $gte: moment()
            .utc()
            .startOf('date')
            .toDate()
        },
        $or: [
          {
            canUse: {
              $in: [user.userId]
            },
            canNotUse: []
          },
          {
            canUse: [],
            canNotUse: []
          },
          {
            canNotUse: {
              $nin: [user.userId]
            }
          }
        ]
      },
      pagination,
      sort
    )
  }

  async getTripPromotionsByAdmin(filters: any = {}, pagination, sort) {
    if ('promotionCode' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.promotionCode = new RegExp(filters.promotionCode, 'gi')
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
    return this.service.find(filters, pagination, sort)
  }

  async getTripPromotionsByAdminCount(filters: any = {}) {
    if ('promotionCode' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.promotionCode = new RegExp(filters.promotionCode, 'gi')
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
    return this.service.count(filters)
  }

  async createTripPromotionByAdmin(data) {
    const { promotionCode, useLimitCount } = data
    if (!promotionCode) {
      throw new ApolloError('promotion code cannot be empty', '400')
    }
    if (useLimitCount !== undefined && useLimitCount !== null) {
      if (useLimitCount < 0 || !useLimitCount) {
        throw new ApolloError('invalid useLimitCount', '400')
      }
    }
    const existingPromotion = await this.service.findOne({ promotionCode })
    if (existingPromotion) {
      throw new ApolloError('a promotion is available with this code.', '404')
    }
    return this.service.create(data)
  }

  async updateTripPromotionByAdmin(promotionId: Types.ObjectId, input: any) {
    const { promotionCode, useLimitCount } = input
    if (!promotionCode) {
      throw new ApolloError('promotion code cannot be empty', '400')
    }
    if (useLimitCount !== undefined && useLimitCount !== null) {
      if (useLimitCount < 0 || !useLimitCount) {
        throw new ApolloError('invalid useLimitCount', '400')
      }
    }
    return service.findOneAndUpdate({ _id: promotionId }, input)
  }

  async deleteTripPromotionByAdmin(idSet: Types.ObjectId[]) {
    for (let index = 0; index < idSet.length; index++) {
      const tripPromotionId = idSet[index]
      const tripPromotion = await service.findById(tripPromotionId)
      if (!tripPromotion) throw new ApolloError('Trip promotion does not exist.', '400')

      if (tripPromotion.isDeleted)
        throw new ApolloError('Trip promotion has deleted before.', '400')
    }
    return idSet.map(id => service.findOneAndUpdate(id, { isDeleted: true }))
  }
})(service)
