import { ApolloError } from 'apollo-server-express'
import { Types } from 'mongoose'
import service from './service'
import controllerBase from '../../utils/controllerBase'
import driverService from '../driver/service'
import userService from '../user/service'
import { sendNotificationToFCMToken, sendNotificationToFCMTokens } from '../../utils/notification'
import userTokenService from '../userToken/service'

export default new (class Controller extends controllerBase {
  async createNotificationByAdmin(input) {
    const { title, body, user, driver } = input

    if (!title) {
      throw new ApolloError('title can not be empty', '400')
    }

    if (!body) {
      throw new ApolloError('body can not be empty', '400')
    }
    if (input.for === 'USER') {
      const userExists = await userService.findOneAndUpdate(
        { _id: user },
        { hasNotification: true }
      )
      if (!userExists) {
        throw new ApolloError('user does not exists', '401')
      }
      const userTokens: any = await userTokenService.find({ user, FCM: { $ne: '' } })
      if (userTokens) {
        const FCMTokens = userTokens.map(userToken => userToken.FCM)
        sendNotificationToFCMTokens(FCMTokens, title, body)
        return service.create(input)
      }
      return service.create(input)
    }
    const driverExists = await driverService.findOneAndUpdate(
      { _id: driver },
      { hasNotification: true }
    )
    if (!driverExists) {
      throw new ApolloError('driver does not exists', '404')
    }
    const userTokens: any = await userTokenService.find({ user, FCM: { $ne: '' } })
    if (userTokens) {
      const FCMTokens = userTokens.map(userToken => userToken.FCM)
      sendNotificationToFCMTokens(FCMTokens, title, body)
      return service.create(input)
    }
    return service.create(input)
  }

  async getNotification(id, user) {
    let { roles }: any = user
    roles = roles.toLowerCase().includes('admin') ? 'admin' : roles.toLowerCase()
    return service.findOne({ _id: id, [roles]: user.userId })
  }

  async getNotifications(pagination, query, sortInput, user) {
    let { roles }: any = user
    roles = roles.toLowerCase().includes('admin') ? 'admin' : roles.toLowerCase()
    if (roles === 'user') {
      await userService.findOneAndUpdate({ _id: user.sub }, { hasNotification: false })
    }
    if (roles === 'driver') {
      await driverService.findOneAndUpdate({ _id: user.sub }, { hasNotification: false })
    }
    return service.find(
      { ...query, [roles]: user.sub },
      pagination,
      sortInput ? { ...sortInput } : { createdAt: -1 }
    )
  }

  async sendNotificationsToAllDriversByAdmin(title, body, type) {
    if (!title) {
      throw new ApolloError('title can not be empty', '400')
    }
    if (!body) {
      throw new ApolloError('body can not be empty', '400')
    }
    const driverFCMTokens: any = await userTokenService.getDriversFCMTokens()
    if (driverFCMTokens.length > 0) {
      driverFCMTokens[0].drivers.forEach(driver => {
        driverService.findOneAndUpdate({ _id: driver }, { hasNotification: true })
        service.create({ for: 'DRIVER', type, driver, title, body })
      })
      sendNotificationToFCMTokens(driverFCMTokens[0].tokens, title, body)
    }
    return {
      message: 'Your notifications has been sent'
    }
  }

  async sendNotificationsToAllUsersByAdmin(title, body, type) {
    if (!title) {
      throw new ApolloError('title can not be empty', '400')
    }
    if (!body) {
      throw new ApolloError('body can not be empty', '400')
    }
    const userFCMTokens: any = await userTokenService.getUsersFCMTokens()
    if (userFCMTokens.length > 0) {
      userFCMTokens[0].users.forEach(user => {
        userService.findOneAndUpdate({ _id: user }, { hasNotification: true })
        service.create({ for: 'USER', type, user, title, body })
      })
      sendNotificationToFCMTokens(userFCMTokens[0].tokens, title, body)
    }
    return {
      message: 'Your notifications has been sent'
    }
  }

  async sendNotificationsToMultiDriverOrUserByAdmin(
    users: any = [],
    drivers: any = [],
    title: string,
    body: string,
    type: string
  ) {
    if (!title) {
      throw new ApolloError('title can not be empty', '400')
    }
    if (!body) {
      throw new ApolloError('body can not be empty', '400')
    }
    let objectIdArray: any
    if (users.length > 0) {
      objectIdArray = users.map(user => Types.ObjectId(user))
      const userFCMTokens: any = await userTokenService.getUsersFCMTokens({
        user: { $in: objectIdArray }
      })
      if (userFCMTokens.length > 0) {
        userFCMTokens[0].users.forEach(user => {
          userService.findOneAndUpdate({ _id: user }, { hasNotification: true })
          service.create({ for: 'USER', type, user, title, body })
        })
        sendNotificationToFCMTokens(userFCMTokens[0].tokens, title, body)
      }
    }

    if (drivers.length > 0) {
      objectIdArray = drivers.map(driver => Types.ObjectId(driver))
      const driverFCMTokens: any = await userTokenService.getDriversFCMTokens({
        driver: { $in: objectIdArray }
      })
      if (driverFCMTokens.length > 0) {
        driverFCMTokens[0].drivers.forEach(driver => {
          driverService.findOneAndUpdate({ _id: driver }, { hasNotification: true })
          service.create({ for: 'DRIVER', type, driver, title, body })
        })
        sendNotificationToFCMTokens(driverFCMTokens[0].tokens, title, body)
      }
    }
    return {
      message: 'Your notifications has been sent'
    }
  }
})(service)
