import { AuthenticationError, ApolloError } from 'apollo-server-express'
import controller from './controller'
import checkIfUserExists from '../../utils/checkIfUserExists'
import userService from '../user/service'
import driverService from '../driver/service'
import checkIfUserIsAdmin from '../../utils/checkIfUserIsAdmin'
import conversationService from '../conversation/service'

const resolver: any = {
  Query: {
    getMessages: (_parent, { filters, pagination }, { user }) => {
      checkIfUserExists(user)
      return controller.getMessages(user, filters, pagination)
    },
    getMessage: (_parent, { _id }, { user }) => {
      checkIfUserExists(user)
      return controller.getMessage(user, _id)
    },
    getMessagesCount: (_parent, { filters }, { user }) => {
      checkIfUserExists(user)
      return controller.getMessagesCount(user, filters)
    }
  },
  Mutation: {
    sendMessage: async (_, { sendMessageInput }, { user }): Promise<Object> => {
      checkIfUserExists(user)
      return controller.sendMessage(sendMessageInput, user)
    },
    updateMessage: async (_, { _id, inputs }, { user }) => {
      checkIfUserIsAdmin(user)
      return controller.updateMessage(user, _id, inputs)
    },
    deleteMessage: async (_, { _id }, { user }) => {
      checkIfUserIsAdmin(user)
      return controller.deleteMessage(user, _id)
    }
  },
  Message: {
    async driver(parent) {
      return driverService.findById(parent.driver)
    },
    async user(parent) {
      return userService.findById(parent.user)
    },
    async conversation(parent) {
      return conversationService.findById(parent.conversation)
    }
  }
}

export default resolver
