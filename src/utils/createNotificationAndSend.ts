import { Types } from 'mongoose'
import { sendNotificationToFCMTokens } from './notification'
import notificationService from '../schema/notification/service'
import userService from '../schema/user/service'
import driverService from '../schema/driver/service'
import userTokenService from '../schema/userToken/service'

export async function createNotificationAndSendToDriver(
  driver: Types.ObjectId | string,
  type: string,
  title: string,
  body: string
) {
  const driverTokens = await userTokenService.find({ driver, FCM: { $ne: '' } })
  if (driverTokens.length) {
    await driverService.findOneAndUpdate({ _id: driver }, { hasNotification: true })
    const tokens = driverTokens.map(driverToken => driverToken.FCM)
    await notificationService.create({ title, body, for: 'DRIVER', type, driver })
    console.log('FCM TOKEN', tokens)
    sendNotificationToFCMTokens(tokens, title, body)
  }
}

export async function createNotificationAndSendToUser(
  user: Types.ObjectId | string,
  type: string,
  title: string,
  body: string
) {
  const userTokens = await userTokenService.find({ user, FCM: { $ne: '' } })
  if (userTokens.length) {
    await userService.findOneAndUpdate({ _id: user }, { hasNotification: true })
    const tokens = userTokens.map(userToken => userToken.FCM)
    console.log('FCM TOKEN', tokens)
    await notificationService.create({ title, body, for: 'USER', type, user })
    sendNotificationToFCMTokens(tokens, title, body)
  }
}
