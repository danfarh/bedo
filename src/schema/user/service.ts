// database request
import { Types } from 'mongoose'
import * as _ from 'lodash'
import moment from 'moment'
import bcrypt from 'bcryptjs'
import User from './schema'
import { HASH_SALT } from '../../config'
import encrypt from '../../utils/encrypt'
import decrypt from '../../utils/decrypt'
import { RedisSet } from '../../utils/redis'
import ServiceBase from '../../utils/serviceBase'

export default new (class service extends ServiceBase {
  async findById(id) {
    const result = await User.findById(id).exec()
    return result
  }

  async save(
    phoneNumber: String,
    password: String,
    email: String,
    fullName: String,
    shopUser = false,
    stripeCustomerId = null
  ) {
    const passwordHash = await bcrypt.hash(String(password), HASH_SALT)
    const user = await new User({
      phoneNumber,
      fullName,
      passwordHash,
      email,
      isVerified: true,
      phoneNumberVerified: true,
      stripeCustomerId,
      shopUser
    })
    await user.save()
    return user
  }

  async findOneByPhoneNumber(phoneNumber: String) {
    const user = await User.findOne({ phoneNumber, shopUser: false }).exec()
    return user
  }

  async findByEmail(email: String) {
    const user = await User.findOne({ email: String(email).toLowerCase(), shopUser: false }).exec()
    return user
  }

  async changePassword(value: String, password: String, type: String) {
    const passwordHash = await bcrypt.hash(String(password), HASH_SALT)
    if (type === 'phoneNumber') {
      const user = await User.findOneAndUpdate(
        { phoneNumber: value },
        {
          $set: { passwordHash }
        },
        {
          new: true
        }
      ).exec()
      return user
    }
    const user = await User.findOneAndUpdate(
      { email: value },
      {
        $set: { passwordHash }
      },
      {
        new: true
      }
    ).exec()
    return user
  }

  async verifyEmail(email: String) {
    await User.findOneAndUpdate(
      { email },
      {
        $set: { emailVerified: true }
      },
      { new: true }
    )
  }

  async encrypt(data: Object) {
    const result = await encrypt(data)
    return result
  }

  async decrypt(encryptedValue: String) {
    const result = await decrypt(encryptedValue)
    return result
  }

  async addCreditCard(userID, input: String) {
    const id = new Types.ObjectId()
    await User.findOneAndUpdate(
      { _id: userID },
      {
        $push: {
          creditCardData: {
            _id: id,
            value: input
          }
        }
      },
      {
        new: true
      }
    )
    return id
  }

  async updateCreditCard(userID, creditCardID, input: String) {
    await User.findOneAndUpdate(
      { _id: userID, 'creditCardData._id': creditCardID },
      {
        $set: {
          'creditCardData.$.value': input
        }
      },
      {
        new: true
      }
    )
  }

  async findCreditCardById(creditCardID, userID) {
    return User.findOne({ _id: userID, 'creditCardData._id': creditCardID }).exec()
  }

  async findAddress(full, zipCode, userID) {
    const result = await User.findOne({
      _id: userID,
      'addresses.full': full,
      'addresses.zipCode': zipCode
    }).exec()
    return result
  }

  async singleCreditCard(userID, creditCardID) {
    const user: any = await User.findOne({ _id: userID, 'creditCardData._id': creditCardID }).exec()
    let result
    await user.creditCardData.map(async singleCreditCard => {
      const { _id } = singleCreditCard
      if (String(_id) === String(creditCardID)) {
        result = singleCreditCard
      }
    })
    return result
  }

  async creditCards(id) {
    const user: any = await User.findOne({ _id: id }).exec()
    return user.creditCardData
  }

  async removeCreditCard(userID, creditCardID) {
    const result = await User.findOneAndUpdate(
      { _id: userID },
      {
        $pull: {
          creditCardData: {
            _id: creditCardID
          }
        }
      },
      {
        new: true
      }
    ).exec()
    return result
  }

  async removePaypal(userID) {
    await User.findOneAndUpdate(
      { _id: userID },
      {
        $set: {
          paypal: null
        }
      },
      {
        new: true
      }
    )
  }

  async setDefaultCreditCard(userID, defaultCreditCard) {
    await User.findOneAndUpdate(
      { _id: userID },
      {
        $set: {
          defaultCreditCard
        }
      },
      {
        new: true
      }
    )
  }

  async setPaypal(userID, paypal) {
    await User.findOneAndUpdate(
      { _id: userID },
      {
        $set: {
          paypal
        }
      },
      {
        new: true
      }
    )
  }

  async getDefaultCreditCard(userID) {
    const user: any = await User.findOne({ _id: userID }).exec()
    return user.defaultCreditCard
  }

  async saveWithGoogleOrFacebook(phoneNumber: String, email: String, fullName: String) {
    const user = await new User({
      phoneNumber,
      fullName,
      email,
      isVerified: true,
      phoneNumberVerified: true,
      emailVerified: true
    })
    await user.save()
    return user
  }

  async saveLocation(userId: String, location: any) {
    const key = `Sresturant_location_user_${userId}`
    return RedisSet(key, JSON.stringify(location))
  }

  async update(_id, data) {
    const user = await User.findOneAndUpdate({ _id }, data, { new: true })
    return user
  }

  async getUsersByAdmin(
    filters: any = { shopUser: false },
    pagination: any = { skip: 0, limit: 15 },
    sort: any
  ) {
    if (sort && sort.tries) {
      // eslint-disable-next-line no-param-reassign
      sort = {
        'phoneNumberVerification.tries': sort.tries
      }
    }

    if (sort && sort.sentTime) {
      // eslint-disable-next-line no-param-reassign
      sort = {
        'phoneNumberVerification.sentTime': sort.sentTime
      }
    }
    if (filters && filters.fullName) {
      // eslint-disable-next-line no-param-reassign
      filters.fullName = new RegExp(filters.fullName, 'gi')
    }

    if (filters && !filters.shopUser) {
      // eslint-disable-next-line no-param-reassign
      filters.shopUser = false
    }

    if (filters && filters.email) {
      // eslint-disable-next-line no-param-reassign
      filters.email = new RegExp(filters.email, 'gi')
    }

    if (filters && filters.phoneNumber) {
      // eslint-disable-next-line no-param-reassign
      filters.phoneNumber = new RegExp(filters.phoneNumber, 'gi')
    }
    if (filters && filters.fromDate && filters.toDate) {
      if (filters.dateField === 'createdAt' || !filters.dateField) {
        // eslint-disable-next-line no-param-reassign
        filters.createdAt = {
          $gte: moment(new Date(filters.fromDate))
            .utc()
            .startOf('date')
            .toDate(),
          $lte: moment(new Date(filters.toDate))
            .utc()
            .endOf('date')
            .toDate()
        }
      }

      if (filters.dateField === 'updatedAt') {
        // eslint-disable-next-line no-param-reassign
        filters.updatedAt = {
          $gte: moment(new Date(filters.fromDate))
            .utc()
            .startOf('date')
            .toDate(),
          $lte: moment(new Date(filters.toDate))
            .utc()
            .endOf('date')
            .toDate()
        }
      }

      if (filters.dateField === 'birthDate') {
        // eslint-disable-next-line no-param-reassign
        filters.birthDate = {
          $gte: moment(new Date(filters.fromDate))
            .utc()
            .startOf('date')
            .toDate(),
          $lte: moment(new Date(filters.toDate))
            .utc()
            .endOf('date')
            .toDate()
        }
      }

      if (filters && filters.dateField === 'lockTillDate') {
        // eslint-disable-next-line no-param-reassign
        filters.lockTillDate = {
          $gte: moment(new Date(filters.fromDate))
            .utc()
            .startOf('date')
            .toDate(),
          $lte: moment(new Date(filters.toDate))
            .utc()
            .endOf('date')
            .toDate()
        }
      }
    }
    // eslint-disable-next-line no-param-reassign
    filters = _.omit(filters, 'fromDate')
    // eslint-disable-next-line no-param-reassign
    filters = _.omit(filters, 'toDate')
    // eslint-disable-next-line no-param-reassign
    filters = _.omit(filters, 'dateField')
    if ('createdAt' in filters && 'createdAtFrom' in filters) {
      filters.createdAt = {
        $gte: moment(new Date(filters.createdAtFrom))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.createdAt))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.createdAtFrom
    } else if ('createdAtFrom' in filters) {
      filters.createdAt = {
        $gte: moment(new Date(filters.createdAtFrom))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.createdAtFrom
    } else if ('createdAt' in filters) {
      filters.createdAt = {
        $lte: moment(new Date(filters.createdAt))
          .utc()
          .startOf('date')
          .toDate()
      }
    }

    if (filters && filters.updatedAt) {
      // eslint-disable-next-line no-param-reassign
      filters.updatedAt = {
        $gte: moment(new Date(filters.updatedAt))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.updatedAt))
          .utc()
          .endOf('date')
          .toDate()
      }
    }

    if (filters && filters.birthDate) {
      // eslint-disable-next-line no-param-reassign
      filters.birthDate = {
        $gte: moment(new Date(filters.birthDate))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.birthDate))
          .utc()
          .endOf('date')
          .toDate()
      }
    }
    if (filters && filters.addresses) {
      if (filters.addresses.full) {
        // eslint-disable-next-line no-param-reassign
        filters['addresses.full'] = new RegExp(filters.addresses.full, 'gi')
      }

      if (filters.addresses.zipCode) {
        // eslint-disable-next-line no-param-reassign
        filters['addresses.zipCode'] = filters.addresses.zipCode
      }
      // eslint-disable-next-line no-param-reassign
      filters = _.omit(filters, 'addresses')
    }

    if (filters && filters.creditCardData) {
      // eslint-disable-next-line no-param-reassign
      filters.creditCardData = {
        $elemMatch: { id: filters.creditCardData }
      }
    }

    if (filters && filters.phoneNumberVerification) {
      if (filters.phoneNumberVerification.tries) {
        // eslint-disable-next-line no-param-reassign
        filters['phoneNumberVerification.tries'] = filters.phoneNumberVerification.tries
      }
      if (filters.phoneNumberVerification.sentTime) {
        // eslint-disable-next-line no-param-reassign
        filters['phoneNumberVerification.sentTime'] = filters.phoneNumberVerification.sentTime
      }
      // eslint-disable-next-line no-param-reassign
      filters = _.omit(filters, 'phoneNumberVerification')
    }

    if (filters && filters.defaultAddress) {
      if (filters.defaultAddress.full) {
        // eslint-disable-next-line no-param-reassign
        filters['defaultAddress.full'] = new RegExp(filters.defaultAddress.full, 'gi')
      }

      if (filters.defaultAddress.zipCode) {
        // eslint-disable-next-line no-param-reassign
        filters['defaultAddress.zipCode'] = filters.defaultAddress.zipCode
      }
      // eslint-disable-next-line no-param-reassign
      filters = _.omit(filters, 'defaultAddress')
    }
    console.log(filters)
    return User.find({
      ...filters
    })
      .sort(sort ? { ...sort } : { createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
  }

  async getUsersByAdminCount(filters: any = { shopUser: false }) {
    if (filters && filters.fullName) {
      // eslint-disable-next-line no-param-reassign
      filters.fullName = new RegExp(filters.fullName, 'gi')
    }

    if (filters && filters.email) {
      // eslint-disable-next-line no-param-reassign
      filters.email = new RegExp(filters.email, 'gi')
    }

    if (filters && !filters.shopUser) {
      // eslint-disable-next-line no-param-reassign
      filters.shopUser = false
    }

    if (filters && filters.phoneNumber) {
      // eslint-disable-next-line no-param-reassign
      filters.phoneNumber = new RegExp(filters.phoneNumber, 'gi')
    }
    if (filters && filters.fromDate && filters.toDate) {
      if (filters.dateField === 'createdAt' || !filters.dateField) {
        // eslint-disable-next-line no-param-reassign
        filters.createdAt = {
          $gte: moment(new Date(filters.fromDate))
            .utc()
            .startOf('date')
            .toDate(),
          $lte: moment(new Date(filters.toDate))
            .utc()
            .endOf('date')
            .toDate()
        }
      }

      if (filters.dateField === 'updatedAt') {
        // eslint-disable-next-line no-param-reassign
        filters.updatedAt = {
          $gte: moment(new Date(filters.fromDate))
            .utc()
            .startOf('date')
            .toDate(),
          $lte: moment(new Date(filters.toDate))
            .utc()
            .endOf('date')
            .toDate()
        }
      }

      if (filters.dateField === 'birthDate') {
        // eslint-disable-next-line no-param-reassign
        filters.birthDate = {
          $gte: moment(new Date(filters.fromDate))
            .utc()
            .startOf('date')
            .toDate(),
          $lte: moment(new Date(filters.toDate))
            .utc()
            .endOf('date')
            .toDate()
        }
      }

      if (filters && filters.dateField === 'lockTillDate') {
        // eslint-disable-next-line no-param-reassign
        filters.lockTillDate = {
          $gte: moment(new Date(filters.fromDate))
            .utc()
            .startOf('date')
            .toDate(),
          $lte: moment(new Date(filters.toDate))
            .utc()
            .endOf('date')
            .toDate()
        }
      }
    }
    // eslint-disable-next-line no-param-reassign
    filters = _.omit(filters, 'fromDate')
    // eslint-disable-next-line no-param-reassign
    filters = _.omit(filters, 'toDate')
    // eslint-disable-next-line no-param-reassign
    filters = _.omit(filters, 'dateField')

    if ('createdAt' in filters && 'createdAtFrom' in filters) {
      filters.createdAt = {
        $gte: moment(new Date(filters.createdAtFrom))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.createdAt))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.createdAtFrom
    } else if ('createdAtFrom' in filters) {
      filters.createdAt = {
        $gte: moment(new Date(filters.createdAtFrom))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.createdAtFrom
    } else if ('createdAt' in filters) {
      filters.createdAt = {
        $lte: moment(new Date(filters.createdAt))
          .utc()
          .startOf('date')
          .toDate()
      }
    }

    if (filters && filters.updatedAt) {
      // eslint-disable-next-line no-param-reassign
      filters.updatedAt = {
        $gte: moment(new Date(filters.updatedAt))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.updatedAt))
          .utc()
          .endOf('date')
          .toDate()
      }
    }

    if (filters && filters.birthDate) {
      // eslint-disable-next-line no-param-reassign
      filters.birthDate = {
        $gte: moment(new Date(filters.birthDate))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.birthDate))
          .utc()
          .endOf('date')
          .toDate()
      }
    }

    if (filters && filters.addresses) {
      if (filters.addresses.full) {
        // eslint-disable-next-line no-param-reassign
        filters['addresses.full'] = new RegExp(filters.addresses.full, 'gi')
      }

      if (filters.addresses.zipCode) {
        // eslint-disable-next-line no-param-reassign
        filters['addresses.zipCode'] = filters.addresses.zipCode
      }
      // eslint-disable-next-line no-param-reassign
      filters = _.omit(filters, 'addresses')
    }

    if (filters && filters.creditCardData) {
      // eslint-disable-next-line no-param-reassign
      filters.creditCardData = {
        $elemMatch: { id: filters.creditCardData }
      }
    }

    if (filters && filters.phoneNumberVerification) {
      if (filters.phoneNumberVerification.tries) {
        // eslint-disable-next-line no-param-reassign
        filters['phoneNumberVerification.tries'] = filters.phoneNumberVerification.tries
      }
      if (filters.phoneNumberVerification.sentTime) {
        // eslint-disable-next-line no-param-reassign
        filters['phoneNumberVerification.sentTime'] = filters.phoneNumberVerification.sentTime
      }
      // eslint-disable-next-line no-param-reassign
      filters = _.omit(filters, 'phoneNumberVerification')
    }

    if (filters && filters.defaultAddress) {
      if (filters.defaultAddress.full) {
        // eslint-disable-next-line no-param-reassign
        filters['defaultAddress.full'] = new RegExp(filters.defaultAddress.full, 'gi')
      }

      if (filters.defaultAddress.zipCode) {
        // eslint-disable-next-line no-param-reassign
        filters['defaultAddress.zipCode'] = filters.defaultAddress.zipCode
      }
      // eslint-disable-next-line no-param-reassign
      filters = _.omit(filters, 'defaultAddress')
    }
    return this.count(filters)
  }
})(User)
