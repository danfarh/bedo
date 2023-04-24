import controller from './controller'
import checkIfUserExists from '../../utils/checkIfUserExists'
import driverService from '../driver/service'
import userService from '../user/service'
import checkIfUserIsAdmin from '../../utils/checkIfUserIsAdmin'
import messageService from '../message/service'
import shopService from '../shop/service'
import tripService from '../trip/service'
import orderService from '../order/service'

// const { AuthenticationError } = require('apollo-server-express')

const resolver: any = {
  Query: {
    getConversation: async (_, { id }, { user }): Promise<Object> => {
      checkIfUserExists(user)
      return controller.getConversation(id, user)
    },
    getConversations: async (_, { filters, Pagination, sort }, { user }): Promise<Object> => {
      checkIfUserExists(user)
      return controller.getConversations(filters, Pagination, user, sort)
    },
    getConversationsCount: async (_, { filters }, { user }) => {
      return controller.getConversationsCount(filters, user)
    }
  },
  Mutation: {
    createConversationAndSendMessage: async (
      _,
      { inputs, recipient },
      { user }
    ): Promise<Object> => {
      checkIfUserExists(user)
      return controller.createConversationAndSendMessage(user, inputs, recipient)
    },
    closeConversation: async (_, { id }, { user }): Promise<Object> => {
      checkIfUserExists(user)
      return controller.closeConversation(id, user)
    },
    makeUnreadMessagesZero: async (_, { id }, { user }): Promise<Object> => {
      checkIfUserExists(user)
      return controller.makeUnreadMessagesZero(id, user)
    },
    updateConversation: async (_, { id, inputs }, { user }): Promise<Object> => {
      checkIfUserIsAdmin(user)
      return controller.updateConversation(id, user, inputs)
    }
  },
  Conversation: {
    driver: async parent => {
      return driverService.findById(parent.driver)
    },
    user: async parent => {
      return userService.findById(parent.user)
    },
    lastMessage: async parent => {
      const messages = await messageService.find(
        {
          conversation: parent._id
        },
        { limit: 1, skip: 0 }
      )
      return messages[0]
    },
    messages: async parent => {
      return messageService.find({ conversation: parent._id })
    },
    shop: async parent => {
      return shopService.findById(parent.shop)
    },
    trip: async parent => {
      return tripService.findById(parent.trip)
    },
    order: async parent => {
      return orderService.findById(parent.order)
    }
  }
}

export default resolver
