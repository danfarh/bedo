import * as rules from '../rules'

const permissions = {
  Query: {
    getNotification: rules.isAuthenticated,
    getNotifications: rules.isAuthenticated
  },
  Mutation: {
    createNotificationByAdmin: rules.isAdmin,
    sendNotificationsToAllDriversByAdmin: rules.isAdmin,
    sendNotificationsToAllUsersByAdmin: rules.isAdmin,
    sendNotificationsToMultiDriverOrUserByAdmin: rules.isAdmin
  }
}

export default permissions
