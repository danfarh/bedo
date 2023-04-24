import { Document } from 'mongoose'
import controller from './controller'
import tripService from '../trip/service'
import userService from '../user/service'
import driverService from '../driver/service'
import passengerReadyCommentsService from '../passengerReadyComments/service'

const resolver: any = {
  Query: {
    async getCommentsOnPassenger(parent, { filters, pagination }, { user }) {
      return controller.getCommentsOnPassenger(user, filters, pagination)
    },
    async getCommentOnPassenger(parent, { _id }, { user }) {
      return controller.getCommentOnPassenger(user, _id)
    },
    async getTotalCommentsOnPassenger(parent, { filters }, { user }) {
      return controller.getTotalCommentsOnPassenger(user, filters)
    },
    async getCommentsOnPassengerByAdmin(parent, { filters, pagination, sort }, { user }) {
      return controller.getCommentsOnPassengerByAdmin(filters, pagination, sort)
    },
    async getCommentOnPassengerByAdmin(parent, { id }, { user }) {
      return controller.getCommentOnPassengerByAdmin(id)
    },
    async getCommentsOnPassengerByAdminCount(parent, { filters }, { user }) {
      return controller.getCommentsOnPassengerByAdminCount(filters)
    }
  },
  Mutation: {
    async createCommentOnPassenger(parent, { input }, { user }) {
      return controller.createCommentOnPassenger(user, input)
    },
    removeCommentOnPassengerByAdmin: async (parent, { id }, { user }) => {
      return controller.removeCommentOnPassengerByAdmin(id)
    }
  },
  CommentOnPassenger: {
    async trip(parent) {
      return tripService.findById(parent.trip)
    },
    async passenger(parent) {
      return userService.findById(parent.passenger)
    },
    async driver(parent) {
      return driverService.findById(parent.driver)
    },
    readyComments: async parent => {
      return Promise.all(
        parent.readyComments.map(async i => {
          let item: any = i
          if (item instanceof Document) {
            item = item.toObject()
          }
          item.readyComment = await passengerReadyCommentsService.findOne(i.readyComment)
          return item
        })
      )
    }
  }
}

export default resolver
