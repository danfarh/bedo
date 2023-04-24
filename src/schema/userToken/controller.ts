import { Types } from 'mongoose'
import service from './service'
import userService from '../user/service'
import driverService from '../driver/service'

export default new (class Controller {
  async createTokensData(
    fcm: string,
    user: Types.ObjectId | null,
    driver: Types.ObjectId | null,
    admin: Types.ObjectId | null,
    refreshTokenKey: string
  ) {
    const roles = { admin, user, driver }
    let role
    let roleId
    // eslint-disable-next-line no-restricted-syntax
    for (const key in roles) {
      if (roles[key]) {
        role = key
        roleId = roles[key]
      }
    }
    const token = await service.findOne({ [`${role}`]: roleId })
    if (token)
      return service.findOneAndUpdate(
        { [`${role}`]: roleId },
        {
          $push: { FCM: fcm, refreshTokenKey }
        }
      )
    return service.create({
      FCM: [fcm],
      [`${role}`]: roleId,
      refreshTokenKey: [refreshTokenKey]
    })
  }

  async createEmailVerificationCode(
    emailVerificationCode: string,
    user: Types.ObjectId | null,
    driver: Types.ObjectId | null,
    admin: Types.ObjectId | null
  ) {
    if (user) {
      const userTokenExists = await service.findOne({ user })
      if (userTokenExists) {
        userTokenExists.emailVerificationCode = emailVerificationCode
        await userTokenExists.save()
      } else {
        await service.create({
          user,
          driver,
          admin,
          emailVerificationCode
        })
      }
    } else if (driver) {
      const driverTokenExists = await service.findOne({ driver })
      if (driverTokenExists) {
        driverTokenExists.emailVerificationCode = emailVerificationCode
        await driverTokenExists.save()
      } else {
        await service.create({
          user,
          driver,
          admin,
          emailVerificationCode
        })
      }
    }
  }

  async getNotificationsStatus(userId, role) {
    const {
      isOrderNotificationActive,
      isOrderStatusNotificationActive,
      isPaymentNotificationActive,
      isDeliveryNotificationActive,
      isMessageNotificationActive
    } = await service.findOne({ [`${role}`]: userId })
    return {
      isOrderNotificationActive,
      isOrderStatusNotificationActive,
      isPaymentNotificationActive,
      isDeliveryNotificationActive,
      isMessageNotificationActive
    }
  }

  async updateNotificationsStatus(notificationsStatus, userId, role) {
    return service.findOneAndUpdate({ [`${role}`]: userId }, { ...notificationsStatus })
  }

  async emailVerification(emailVerificationCode: string) {
    const userToken = await service.findOne({ emailVerificationCode })
    if (!userToken) {
      return null
    }
    if (userToken.user) {
      const user = userService.findOneAndUpdate({ _id: userToken.user }, { emailVerified: true })
      if (!user) {
        return null
      }
      userToken.emailVerificationCode = null
      await userToken.save()
      return 'USER'
    }
    if (userToken.driver) {
      const driver = driverService.findOneAndUpdate(
        { _id: userToken.driver },
        { emailVerified: true }
      )
      if (!driver) {
        return null
      }
      userToken.emailVerificationCode = null
      await userToken.save()
      return 'DRIVER'
    }
    return null
  }
})()
