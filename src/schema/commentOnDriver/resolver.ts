import { Document } from 'mongoose'
import controller from './controller'
import tripService from '../trip/service'
import tripOrderService from '../tripOrder/service'
import userService from '../user/service'
import driverService from '../driver/service'
import driverReadyCommentsService from '../driverReadyComments/service'

const resolver: any = {
  Query: {
    commentsOnDriver: async (parent, { filters, pagination }, { user }) => {
      return controller.getCommentsOnDriver(user, filters, pagination)
    },
    commentOnDriver: async (parent, { _id }, { user }) => {
      return controller.getCommentOnDriver(user, _id)
    },
    totalCommentsOnDriver: async (parent, { filters }, { user }) => {
      return controller.getTotalCommentsOnDriver(user, filters)
    },
    getCommentsOnDriverByAdmin: async (parent, { filters, pagination, sort }) => {
      return controller.getCommentsOnDriverByAdmin(filters, pagination, sort)
    },
    getCommentsOnDriverByAdminCount: async (parent, { filters }) => {
      return controller.getCommentsOnDriverByAdminCount(filters)
    },
    getCommentOnDriverByAdmin: async (parent, { id }) => {
      return controller.getCommentOnDriverByAdmin(id)
    }
  },
  Mutation: {
    createCommentOnDriver: async (parent, { createCommentOnDriverInput }, { user }) => {
      return controller.createCommentOnDriver(user, createCommentOnDriverInput)
    },
    skipCommentOnDriver: async (parent, { createCommentOnDriverInput }, { user }) => {
      return controller.skipCommentOnDriver(user, createCommentOnDriverInput)
    },
    removeCommentOnDriverByAdmin: async (parent, { id }, { user }) => {
      return controller.removeCommentOnDriverByAdmin(id)
    }
  },
  CommentOnDriver: {
    trip: async parent => {
      return tripService.findById(parent.trip)
    },
    passenger: async parent => {
      return userService.findById(parent.passenger)
    },
    driver: async parent => {
      return driverService.findById(parent.driver)
    },
    readyComments: async parent => {
      return Promise.all(
        parent.readyComments.map(async i => {
          let item: any = i
          if (item instanceof Document) {
            item = item.toObject()
          }
          item.readyComment = await driverReadyCommentsService.findOne(i.readyComment)
          return item
        })
      )
    },
    order: async parent => {
      return tripOrderService.findOne({ trip: parent.trip })
    }
  }
}

export default resolver
