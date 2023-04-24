// database request
import { EMAIL_VERIFICATION_MAX_VALUE, EMAIL_VERIFICATION_MIN_VALUE } from '../../config/index'
import UserToken from './schema'
import ServiceBase from '../../utils/serviceBase'

export default new (class service extends ServiceBase {
  async findByUserId(user) {
    const userToken = await UserToken.findOne({ user }).exec()
    return userToken
  }

  async createEmailVerificationCode(user) {
    const emailVerificationCode =
      Math.floor(Math.random() * EMAIL_VERIFICATION_MAX_VALUE) + EMAIL_VERIFICATION_MIN_VALUE
    const userExits = await this.findByUserId(user)
    if (userExits) {
      await UserToken.findOneAndUpdate(
        { user },
        {
          $set: { emailVerificationCode }
        },
        {
          new: true
        }
      ).exec()
      return emailVerificationCode
    }
    const newUserToken = await new UserToken({
      user,
      emailVerificationCode
    })
    await newUserToken.save()
    return emailVerificationCode
  }

  async removeVerificationCode(user) {
    await UserToken.findOneAndUpdate(
      { user },
      {
        $set: { emailVerificationCode: null }
      },
      {
        new: true
      }
    )
  }

  async findById(id) {
    await UserToken.findById(id).exec()
  }

  async saveFCM(data, user) {
    const userToken = await UserToken.findOne({ user })
    if (!userToken) {
      const newUserToken = await new UserToken({ ...data, user })
      await newUserToken.save()
      return newUserToken
    }
    const updatedUser = await UserToken.findOneAndUpdate(
      { user },
      {
        $set: { FCM: data.FCM }
      },
      {
        new: true
      }
    ).exec()
    return updatedUser
  }

  async getUsersFCMTokens(filters: any = {}) {
    return UserToken.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'users'
        }
      },
      { $match: { ...filters, 'users.state': 'ACTIVE', FCM: { $ne: '' } } },
      {
        $group: {
          _id: null,
          tokens: {
            $push: '$FCM'
          },
          users: {
            $push: '$user'
          }
        }
      }
    ])
  }

  async getDriversFCMTokens(filters: any = {}) {
    return UserToken.aggregate([
      {
        $lookup: {
          from: 'drivers',
          localField: 'driver',
          foreignField: '_id',
          as: 'drivers'
        }
      },
      { $match: { ...filters, 'drivers.state': 'ACTIVE', FCM: { $ne: '' } } },
      {
        $group: {
          _id: null,
          tokens: {
            $push: '$FCM'
          },
          drivers: {
            $push: '$driver'
          }
        }
      }
    ])
  }
})(UserToken)
