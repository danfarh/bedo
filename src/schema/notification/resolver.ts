import { AuthenticationError } from 'apollo-server-express'
import controller from './controller'
import checkIfUserExists from '../../utils/checkIfUserExists'
import userService from '../user/service'
import driverService from '../driver/service'
import checkIfUserIsAdmin from '../../utils/checkIfUserIsAdmin'
// async (parent, { paramas }, { contex })
// contex from server.ts line 68

const resolver: any = {
  Query: {
    getNotification: async (_, { id }, { user }): Promise<Object> => {
      return controller.getNotification(id, user)
    },
    getNotifications: async (_, { pagination, filters, sort }, { user }): Promise<Object> => {
      return controller.getNotifications(pagination, filters, sort, user)
    }
  },
  Mutation: {
    createNotificationByAdmin: async (_, { input }, { user }): Promise<Object> => {
      return controller.createNotificationByAdmin(input)
    },
    sendNotificationsToAllDriversByAdmin: async (
      _,
      { title, body, type },
      { user }
    ): Promise<Object> => {
      return controller.sendNotificationsToAllDriversByAdmin(title, body, type)
    },
    sendNotificationsToAllUsersByAdmin: async (
      _,
      { title, body, type },
      { user }
    ): Promise<Object> => {
      return controller.sendNotificationsToAllUsersByAdmin(title, body, type)
    },
    sendNotificationsToMultiDriverOrUserByAdmin: async (
      _,
      { input },
      { user }
    ): Promise<Object> => {
      const { users, drivers, title, body, type } = input
      return controller.sendNotificationsToMultiDriverOrUserByAdmin(
        users,
        drivers,
        title,
        body,
        type
      )
    }
  },
  Notification: {
    user: parent => {
      return userService.findById(parent.user)
    },
    driver: parent => {
      return driverService.findById(parent.driver)
    }
  }
}

export default resolver
