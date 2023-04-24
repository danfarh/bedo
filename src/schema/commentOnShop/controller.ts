import { Types } from 'mongoose'
import { ApolloError } from 'apollo-server-express'
import moment from 'moment'
import controllerBase from '../../utils/controllerBase'
import driverOrPassengerFilters from '../../utils/driverOrPassengerFilters'
import service from './service'
import shopReadyCommentService from '../shopReadyComments/service'
import orderService from '../order/service'
import shopService from '../shop/service'

export default new (class Controller extends controllerBase {
  async getCommentOnShop(user: any, _id: String) {
    const commentOnShop = await service.findOne({
      _id
    })

    if (!commentOnShop) {
      throw new ApolloError('comment on shop not found.', '400')
    }
    return commentOnShop
  }

  async changeCommentStatus(_id, status) {
    return service.findOneAndUpdate({ _id }, { status })
  }

  async getCommentsOnShop(user: any, filters: any, pagination: any) {
    if (filters && filters.hasUserComment) {
      filters.userComment = { $exists: true }
      delete filters.hasUserComment
    }
    return service.find(
      {
        ...filters
      },
      pagination
    )
  }

  async getTotalCommentsOnShop(user: any, filters: Object) {
    return service.count({
      ...filters
    })
  }

  async createCommentOnShop(user: any, inputs: any) {
    if (!inputs.readyComments && !inputs.userComment) {
      throw new ApolloError('invalid input.', '400')
    }

    if (inputs.readyComments) {
      if (!inputs.readyComments.length) {
        throw new ApolloError('invalid input.', '400')
      }
    }
    const order = await orderService.findOne({
      user: user.userId,
      _id: inputs.order,
      finished: true
    })
    if (!order) {
      throw new ApolloError('order does not exists.', '404')
    }

    if (order.commented === 'COMMENTED') {
      throw new ApolloError('you already submitted a comment for this order.', '400')
    }

    if (order.commented === 'SKIPPED') {
      throw new ApolloError('you have skipped to comment for this order.', '400')
    }

    const shop = await shopService.findById(order.shop)

    if (!shop) {
      throw new ApolloError('shop not found.', '404')
    }

    const alreadyExistingCommentForShop = await service.findOne({
      order
    })

    if (alreadyExistingCommentForShop) {
      throw new ApolloError('you already submitted a comment for this order.', '400')
    }

    if (inputs.readyComments && inputs.readyComments.length) {
      const dbReadyCommentsCount = await shopReadyCommentService.count({
        _id: { $in: inputs.readyComments.map(i => i.readyComment) }
      })
      if (dbReadyCommentsCount !== inputs.readyComments.length) {
        throw new ApolloError('some of ready comments not found.', '400')
      }
    }

    const commentOnShop = await service.create({
      order: order._id,
      shop: shop._id,
      user: order.user,
      status: 'PENDING',
      readyComments: inputs.readyComments,
      userComment: inputs.userComment
    })
    await orderService.findOneAndUpdate({ _id: order._id }, { commented: 'COMMENTED' })

    if (inputs.readyComments && inputs.readyComments.length) {
      const allRates = inputs.readyComments
      const ratesLength = allRates.length
      const avgRate = allRates.reduce((sum, item) => sum + item.rate, 0) / ratesLength
      const averageRate = (shop.sumOfRates + avgRate) / (shop.numberOfRates + 1)

      await shopService.findOneAndUpdate(shop._id, {
        averageRate,
        $inc: {
          sumOfRates: avgRate,
          numberOfRates: 1
        }
      })
    }

    return commentOnShop
  }

  async rejectCommentOnShopByShopAdmin(id: Types.ObjectId) {
    const foundComment: any = await service.findById(id)
    if (!foundComment) {
      throw new ApolloError('comment does not exists.', '404')
    }
    if (foundComment.status !== 'CONFIRMED') {
      foundComment.status = 'REJECTED'
      await foundComment.save()
      return {
        message: 'This comment was rejected.'
      }
    } else {
      throw new ApolloError('This comment has been already confirmed.')
    }
  }

  async getShopAdminCommentsOnShop(user, filters: any = {}, pagination, sort) {
    filters = await driverOrPassengerFilters(filters, true)
    return service.getShopAdminCommentsOnShop(user.shop, filters, pagination, sort)
  }

  async setShopAdminReplyOnComment(user, input) {
    const { userId, shop }: any = user
    if (!input.text) {
      throw new ApolloError('you can not send empty text.', '400')
    }
    const comment: any = await service.findOne({
      _id: input.comment,
      shop: { $exists: true, $eq: shop }
    })
    if (!comment) {
      throw new ApolloError('comment does not exists.', '404')
    }
    if (comment.shopAdminReply.admin) {
      throw new ApolloError('you have replied to this comment before.', '400')
    }
    if (!comment.userComment) {
      throw new ApolloError('you can not reply to this comment.', '400')
    }
    comment.status = 'CONFIRMED'
    await comment.save()

    const newComment = await service.create({ userComment: input.text })
    return service.findOneAndUpdate(
      { _id: input.comment },
      { shopAdminReply: { comment: newComment._id, admin: userId } }
    )
  }

  async getCommentsOnShopByAdmin(filters, pagination, sort) {
    return service.getCommentsOnShopByAdmin(filters, pagination, sort)
  }

  async removeCommentOnShopByShopAdmin(_id: Types.ObjectId) {
    const comment: any = await service.findOne({ _id })
    if (!comment) {
      throw new ApolloError('Your comment does not exists.', '400')
    }
    const shop = await shopService.findById(comment.shop)
    if (shop) {
      if (comment.readyComments && comment.readyComments.length) {
        if (Number(shop.numberOfRates) > 0 && Number(shop.numberOfRates) !== 1) {
          const allRates = comment.readyComments
          const ratesLength = allRates.length
          const avgRate = allRates.reduce((sum, item) => sum + item.rate, 0) / ratesLength
          const averageRate = (shop.sumOfRates - avgRate) / (shop.numberOfRates - 1)

          if (Number(shop.sumOfRates) >= Number(avgRate)) {
            await shopService.findOneAndUpdate(
              { _id: shop._id },
              {
                averageRate,
                $inc: {
                  sumOfRates: -avgRate,
                  numberOfRates: -1
                }
              }
            )
          }
        } else if (Number(shop.numberOfRates) === 1) {
          await shopService.findOneAndUpdate(
            { _id: shop._id },
            {
              averageRate: 0,
              sumOfRates: 0,
              numberOfRates: 0
            }
          )
        }
      }
    }
    await service.findOneAndUpdate(comment._id, { isDeleted: true })
    return {
      message: 'Your comment has been removed.'
    }
  }

  async getCommentOnShopByAdmin(_id: Types.ObjectId) {
    return service.findOne({ _id })
  }

  async skipCommentOnShop(user: any, orderId: Types.ObjectId) {
    const order = await orderService.findOne({
      user: user.userId,
      _id: orderId,
      finished: true
    })
    if (!order) {
      throw new ApolloError('order does not exists.', '404')
    }

    if (order.commented === 'COMMENTED') {
      throw new ApolloError('you already submitted a comment for this order. ', '400')
    }

    if (order.commented === 'SKIPPED') {
      throw new ApolloError('you have skipped to comment for this order.', '400')
    }

    const shop = await shopService.findById(order.shop)

    if (!shop) {
      throw new ApolloError('shop not found', '404')
    }

    const alreadyExistingCommentForShop = await service.findOne({
      order
    })

    if (alreadyExistingCommentForShop) {
      throw new ApolloError('you already submitted a comment for this order.', '400')
    }
    await orderService.findOneAndUpdate({ _id: order._id }, { commented: 'SKIPPED' })
    return true
  }

  async getCommentsOnShopByAdminCount(filters: any) {
    return service.getCommentsOnShopByAdminCount(filters)
  }

  async getCommentsOnShopByShopAdminCount(filters: any = {}, user: any) {
    filters = await driverOrPassengerFilters(filters, true)
    return service.getCommentsOnShopByShopAdminCount(filters, user.shop)
  }
})(service)
