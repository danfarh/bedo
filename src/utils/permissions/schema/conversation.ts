import * as rules from '../rules'

const permissions = {
  Query: {
    getConversation: rules.isAuthenticated,
    getConversations: rules.isAuthenticated,
    getConversationsCount: rules.isAuthenticated
  },
  Mutation: {
    createConversationAndSendMessage: rules.isAuthenticated,
    closeConversation: rules.isAuthenticated,
    makeUnreadMessagesZero: rules.isAuthenticated,
    updateConversation: rules.isAuthenticated
  }
}

export default permissions
