import * as rules from '../rules'

export default {
  Query: {
    getReadyMessage: rules.isAuthenticated,
    getReadyMessages: rules.isAuthenticated,
    getReadyMessagesByAdmin: rules.isAdmin,
    getReadyMessagesByAdminCount: rules.isAdmin
  },
  Mutation: {
    createReadyMessageByAdmin: rules.isAdmin,
    updateReadyMessageByAdmin: rules.isAdmin,
    removeReadyMessageByAdmin: rules.isAdmin
  }
}
