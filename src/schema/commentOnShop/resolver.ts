import { Document } from 'mongoose'
import controller from './controller'
import shopService from '../shop/service'
import userService from '../user/service'
import orderService from '../order/service'
import adminService from '../admin/service'
import shopReadyCommentsService from '../shopReadyComments/service'

const resolver: any = {
  Query: {
    async commentsOnShop(parent, { filters, pagination }, { user }) {
      return controller.getCommentsOnShop(user, filters, pagination)
    },
    async getShopAdminCommentsOnShop(parent, { filters, pagination, sort }, { user }) {
      return controller.getShopAdminCommentsOnShop(user, filters, pagination, sort)
    },
    async commentOnShop(parent, { _id }, { user }) {
      return controller.getCommentOnShop(user, _id)
    },
    async totalCommentsOnShop(parent, { filters }, { user }) {
      return controller.getTotalCommentsOnShop(user, filters)
    },
    getCommentsOnShopByAdmin: async (parent, { filters, pagination, sort }) => {
      return controller.getCommentsOnShopByAdmin(filters, pagination, sort)
    },
    getCommentOnShopByAdmin: async (parent, { id }) => {
      return controller.getCommentOnShopByAdmin(id)
    },
    getCommentsOnShopByAdminCount: async (parent, { filters }) => {
      return controller.getCommentsOnShopByAdminCount(filters)
    },
    getCommentsOnShopByShopAdminCount: async (parent, { filters }, { user }) => {
      return controller.getCommentsOnShopByShopAdminCount(filters, user)
    }
  },
  Mutation: {
    async createCommentOnShop(parent, { createCommentOnShopInput }, { user }) {
      return controller.createCommentOnShop(user, createCommentOnShopInput)
    },
    async setShopAdminReplyOnComment(parent, { input }, { user }) {
      return controller.setShopAdminReplyOnComment(user, input)
    },
    async rejectCommentOnShopByShopAdmin(parent, { id }, { user }) {
      return controller.rejectCommentOnShopByShopAdmin(id)
    },
    removeCommentOnShopByShopAdmin: async (parent, { id }) => {
      return controller.removeCommentOnShopByShopAdmin(id)
    },
    skipCommentOnShop: async (parent, { orderId }, { user }) => {
      return controller.skipCommentOnShop(user, orderId)
    },
    changeCommentStatus: async (parent, { _id, status }, { user }) => {
      return controller.changeCommentStatus(_id, status)
    }
  },
  CommentOnShop: {
    async shop(parent) {
      return shopService.findById(parent.shop)
    },
    async order(parent) {
      return orderService.findById(parent.order)
    },
    async user(parent) {
      return userService.findById(parent.user)
    },
    readyComments: async parent => {
      return Promise.all(
        parent.readyComments.map(async i => {
          let item: any = i
          if (item instanceof Document) {
            item = item.toObject()
          }
          item.readyComment = await shopReadyCommentsService.findOne(i.readyComment)
          return item
        })
      )
    }
  },
  ShopAdminReply: {
    async admin(parent, args, { user }) {
      if (!parent.admin) {
        return null
      }
      return adminService.findById(parent.admin)
    },
    comment(parent, args, { user }) {
      if (!parent.comment) {
        return null
      }
      return controller.get(user, parent.comment)
    }
  }
}

export default resolver
