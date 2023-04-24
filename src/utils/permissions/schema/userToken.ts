import * as rules from '../rules'

const permissions = {
  Query: {
    getNotificationsStatus: rules.isAuthenticated
  },
  Mutation: {
    updateNotificationsStatus: rules.isAuthenticated
  }
}

export default permissions
