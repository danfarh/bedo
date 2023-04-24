import * as rules from '../rules'

const permissions = {
  Query: {
    getMessages: rules.isAuthenticated,
    getMessage: rules.isAuthenticated,
    getMessagesCount: rules.isAuthenticated
  },
  Mutation: {
    sendMessage: rules.isAuthenticated,
    updateMessage: rules.isAuthenticated,
    deleteMessage: rules.isAuthenticated
  }
}

export default permissions
