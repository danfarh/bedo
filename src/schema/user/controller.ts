/* eslint-disable no-await-in-loop */
import { UserInputError, ApolloError } from 'apollo-server-express'
import { Types } from 'mongoose'
import {
  phoneNumberValidation,
  updateUserInformationValidation,
  updateUserPasswordInformationValidation,
  addOrUpdateCreditCard,
  addOrUpdatePaypalAccountValidation
} from '../../utils/validation/validation'
import sendSMS from '../../utils/sms'
import { PHONE_VERIFICATION_TRIED_COUNT, HASH_SALT } from '../../config'
import stripe from '../../utils/payment/gateways/Stripe'
import service from './service'
import tripService from '../trip/service'
import orderService from '../order/service'
import authService from '../auth/service'
import bcrypt from 'bcryptjs'

export default new (class Controller {
  async getUserPaymentStatus(userId: Types.ObjectId) {
    const user: any = await service.findById(userId)
    if (!user.stripeCustomerId) {
      const customer = await stripe
        .createCustomer(user.fullName, 0, user.email, user.phoneNumber)
        .catch(err => console.log('customer not created', err))
      await service.findOneAndUpdate({ _id: user._id }, { stripeCustomerId: customer.id })
      return 'DOES_NOT_HAVE_PAYMENT_METHOD'
    }
    const paymentMethods = await stripe.getCustomerPaymentMethods(user.stripeCustomerId)
    const len = paymentMethods.length
    const has = len > 0 ? 'HAS_PAYMENT_METHOD' : 'DOES_NOT_HAVE_PAYMENT_METHOD'
    return has
  }

  async saveLocation(user: any, location: any) {
    const result = service.saveLocation(user.userId, location)
    return {
      message: result
    }
  }

  async addCreditCard(input: Object, type: String, userId) {
    if (
      type === 'VISA' ||
      type === 'AMERICAN_EXPRESS' ||
      type === 'Master_Card' ||
      type === 'Debit_Card'
    ) {
      await addOrUpdateCreditCard.validateAsync(input)
      const set = await service.encrypt(input)
      const objectId = await service.addCreditCard(userId, set)
      const defaultCreditCard = await service.getDefaultCreditCard(userId)
      if (defaultCreditCard === undefined || defaultCreditCard === null) {
        await service.setDefaultCreditCard(userId, objectId)
      }
      return {
        _id: objectId,
        ...input
      }
    }
    if (type === 'Paypal') {
      let user: any
      await addOrUpdatePaypalAccountValidation.validateAsync(input)
      user = await service.findById(userId)
      if (user.paypal) {
        throw new UserInputError('you already added Paypal you can update or remove that')
      }
      const set = await service.encrypt(input)
      const objectId = await service.addCreditCard(userId, set)
      await service.setPaypal(userId, objectId)
      const defaultCreditCard = await service.getDefaultCreditCard(userId)
      if (defaultCreditCard === undefined || defaultCreditCard === null) {
        await service.setDefaultCreditCard(userId, objectId)
      }
      return {
        _id: objectId,
        ...input
      }
    }
    throw new ApolloError('you must choose a credit card or Paypal', '403')
  }

  async updateCreditCard(creditCardID, input: Object, type: String, userId) {
    const user: any = await service.findById(userId)
    if (!user) {
      throw new ApolloError('user does not exists', '401')
    }
    if (
      type === 'VISA' ||
      type === 'AMERICAN_EXPRESS' ||
      type === 'Master_Card' ||
      type === 'Debit_Card'
    ) {
      await addOrUpdateCreditCard.validateAsync(input)
      const set = await service.encrypt(input)
      const creditCardExists = await service.findCreditCardById(creditCardID, userId)
      if (creditCardExists === null || creditCardExists === undefined) {
        throw new UserInputError('your credit card does not exists')
      }
      await service.updateCreditCard(userId, creditCardID, set)
      return {
        _id: creditCardID,
        ...input
      }
    }
    if (type === 'Paypal') {
      if (String(user.paypal) !== String(creditCardID)) {
        throw new UserInputError('your credit card does not exists')
      }
      await addOrUpdatePaypalAccountValidation.validateAsync(input)
      const set = await service.encrypt(input)
      const creditCardExists = await service.findCreditCardById(creditCardID, userId)
      if (creditCardExists === null || creditCardExists === undefined) {
        throw new UserInputError('your credit card does not exists')
      }
      await service.updateCreditCard(userId, creditCardID, set)
      return {
        _id: creditCardID,
        ...input
      }
    }
    throw new ApolloError('you must choose credit card or Paypal')
  }

  async removeCreditCard(creditCardID, userId) {
    let user: any
    const creditCardExists = await service.findCreditCardById(creditCardID, userId)
    if (creditCardExists === null || creditCardExists === undefined) {
      throw new ApolloError('your credit card does not exists', '403')
    }
    user = await service.findById(userId)
    if (String(creditCardID) === String(user.defaultCreditCard)) {
      throw new ApolloError('you can not remove default credit card', '403')
    }
    if (String(user.paypal) === String(creditCardID)) {
      await service.removePaypal(userId)
    }
    user = await service.removeCreditCard(userId, creditCardID)
    return {
      message: 'Your credit card has been removed'
    }
  }

  async checkEmailVerification(email: String) {
    const user: any = await service.findByEmail(email)
    if (user.emailVerified) {
      return {
        message: 'Your email has been verified'
      }
    }
    return {
      message: 'Your email has not been verified'
    }
  }

  async singleCreditCard(creditCardID, userId) {
    const creditCardExists = await service.findCreditCardById(creditCardID, userId)
    if (creditCardExists === null || creditCardExists === undefined) {
      throw new UserInputError('your credit card  does not exists')
    }
    const singleCreditCard = await service.singleCreditCard(userId, creditCardID)
    const { _id } = singleCreditCard
    const decryptedValue = await service.decrypt(singleCreditCard.value)
    return {
      _id,
      ...decryptedValue
    }
  }

  async creditCards(userId) {
    const user: any = await service.findById(userId)
    const creditCardsArray: any = []
    const creditCards = await service.creditCards(userId)
    await creditCards.map(async singleCreditCard => {
      const { _id }: any = singleCreditCard
      const decryptedValue = await service.decrypt(singleCreditCard.value)
      await creditCardsArray.push({
        _id,
        ...decryptedValue
      })
    })
    return { value: creditCardsArray, defaultCreditCard: user.defaultCreditCard }
  }

  async setDefaultCreditCard(creditCardID, userId) {
    const creditCardExists = await service.findCreditCardById(creditCardID, userId)
    if (creditCardExists === null || creditCardExists === undefined) {
      throw new UserInputError('your credit card  does not exists')
    }

    await service.setDefaultCreditCard(userId, creditCardID)
    const singleCreditCard = await service.singleCreditCard(userId, creditCardID)
    const { _id } = singleCreditCard
    const decryptedValue = await service.decrypt(singleCreditCard.value)
    return {
      _id,
      ...decryptedValue
    }
  }

  async getDefaultCreditCard(userId) {
    const defaultCreditCard = await service.getDefaultCreditCard(userId)
    if (defaultCreditCard === undefined || defaultCreditCard === null) {
      throw new ApolloError('please first set default card', '404')
    }
    const singleCreditCard = await service.singleCreditCard(userId, defaultCreditCard)
    const { _id } = singleCreditCard
    const decryptedValue = await service.decrypt(singleCreditCard.value)
    return {
      _id,
      ...decryptedValue
    }
  }

  async getUserInformation(id) {
    const user: any = await service.findById(id)
    if (!user) {
      throw new ApolloError('user does not exists', '401')
    }
    return {
      ...user._doc
    }
  }

  async updateUserInformation(id, data) {
    let user: any
    user = await service.findById(id)
    if (!user) {
      throw new ApolloError('user does not exists', '401')
    }
    const {
      profileImageUrl,
      fullName,
      birthDate,
      email,
      defaultAddress,
      addresses,
      passwordHash
    } = data
    if (addresses && addresses.length === 0) {
      throw new ApolloError('you can not remove default address', '403')
    }
    if (addresses && addresses.length > 0) {
      addresses.map(address => {
        if (!address.zipCode || !address.full) {
          throw new ApolloError('address can not be empty', '400')
        }
      })
    }

    if (defaultAddress) {
      await updateUserInformationValidation.validateAsync({
        zipCode: defaultAddress.zipCode,
        full: defaultAddress.full
      })
    }
    await updateUserInformationValidation.validateAsync({
      profileImageUrl,
      fullName,
      birthDate,
      email
    })

    if (email) {
      const emailExists: any = await service.findByEmail(email)
      if (emailExists && String(emailExists._id) !== String(id)) {
        throw new ApolloError('user with this email exists', '400')
      }
      user = await service.update(id, { emailVerified: false })
    }
    if (passwordHash) {
      await updateUserPasswordInformationValidation.validateAsync({ passwordHash })
      data.passwordHash = await bcrypt.hash(String(data.passwordHash), HASH_SALT)
    }
    user = await service.update(id, data)
    const addressExists = await service.findAddress(
      user.defaultAddress.full,
      user.defaultAddress.zipCode,
      user._id
    )

    if (!addressExists) {
      if (user.addresses.length > 0) {
        user = await service.update(id, {
          defaultAddress: { full: user.addresses[0].full, zipCode: user.addresses[0].zipCode }
        })
      } else {
        user = await service.update(id, {
          defaultAddress: {}
        })
      }
    }

    return {
      ...user._doc
    }
  }

  async getUserChangePhoneNumberCode(phoneNumber: string, newPhoneNumber: string, userId) {
    await phoneNumberValidation.validateAsync({ phoneNumber: newPhoneNumber })

    const user: any = await service.findById(userId)
    if (!user) {
      throw new ApolloError('user does not exists', '404')
    }
    if (String(user.phoneNumber) !== String(phoneNumber)) {
      throw new ApolloError('user does not exists', '404')
    }
    const phoneNumberExists = await service.findOneByPhoneNumber(newPhoneNumber)
    if (phoneNumberExists) {
      throw new ApolloError('user with this phone number exists', '403')
    }
    const changePhoneNumberCode = await authService.createChangePhoneNumberCode(newPhoneNumber)
    sendSMS(newPhoneNumber, `Your change phone number code is ${changePhoneNumberCode} `)
    return {
      phoneNumber,
      newPhoneNumber,
      changePhoneNumberCode
    }
  }

  async checkUserChangePhoneNumberCode(
    phoneNumber: string,
    newPhoneNumber: string,
    frontChangePhoneNumberCode: string,
    userId
  ) {
    let user: any
    await phoneNumberValidation.validateAsync({ phoneNumber: newPhoneNumber })

    user = await service.findById(userId)
    if (!user) {
      throw new ApolloError('user does not exists', '404')
    }
    if (String(user.phoneNumber) !== String(phoneNumber)) {
      throw new ApolloError('user does not exists', '404')
    }

    const codeExists = await authService.checkChangePhoneNumberCodeExists(newPhoneNumber)
    if (codeExists === null || codeExists === undefined) {
      throw new ApolloError(
        'Your change phone number code has expired please get a new change phone number code ',
        '403'
      )
    }
    const triedCount = await authService.checkTriedCount(newPhoneNumber, 'changePhoneNumberCode')
    const changePhoneNumberCode = await authService.getChangePhoneNumberCode(newPhoneNumber)
    if (triedCount < PHONE_VERIFICATION_TRIED_COUNT) {
      await authService.updateTriedCount(
        newPhoneNumber,
        changePhoneNumberCode,
        triedCount,
        'changePhoneNumberCode'
      )
    } else {
      await authService.removeFromRedis(newPhoneNumber, 'changePhoneNumberCode')
      throw new ApolloError('maximum try count exceeded please try again later', '403')
    }
    if (String(frontChangePhoneNumberCode) === String(changePhoneNumberCode)) {
      const phoneNumberExists = await service.findOneByPhoneNumber(newPhoneNumber)
      if (phoneNumberExists) {
        throw new ApolloError('user already exists', '403')
      }
      await authService.removeFromRedis(newPhoneNumber, 'changePhoneNumberCode')
      return service.findOneAndUpdate(userId, { phoneNumber: newPhoneNumber })
    }

    throw new UserInputError('your change phone number code is incorrect')
  }

  async getUsersByAdmin(filters, pagination, sort) {
    return service.getUsersByAdmin(filters, pagination, sort)
  }

  async getUsersByAdminCount(filters) {
    return service.getUsersByAdminCount(filters)
  }

  async suspendUserByAdmin(userId) {
    const user: any = await service.findById(userId)
    if (!user) {
      throw new ApolloError('User does not exist.', '400')
    }
    if (user.state === 'ACTIVE') {
      const unfinishedTripsForUser: any = await tripService.find({
        passenger: userId,
        ended: false
      })
      if (unfinishedTripsForUser.length !== 0) {
        throw new ApolloError('User is on a trip.', '400')
      }
      const unfinishedOrdersForUser: any = await orderService.find({
        user: userId,
        finished: false
      })
      if (unfinishedOrdersForUser.length !== 0) {
        throw new ApolloError('User has an active order.', '400')
      }
    }
    const state = user.state === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
    return service.findOneAndUpdate(user._id, {
      state
    })
  }

  async suspendUserSetByAdmin(idSet) {
    const userSet: any = []
    for (let index = 0; index < idSet.length; index++) {
      const userId = idSet[index]
      const user: any = await service.findById(userId)
      if (!user) {
        throw new ApolloError('User does not exist.', '400')
      }
      if (user.isDeleted) throw new ApolloError('User has been deleted before.', '400')
      if (user.state === 'ACTIVE') {
        const unfinishedTripsForUser: any = await tripService.find({
          passenger: userId,
          ended: false
        })
        if (unfinishedTripsForUser.length !== 0) {
          throw new ApolloError('User is on a trip.', '400')
        }
        const unfinishedOrdersForUser: any = await orderService.find({
          user: userId,
          finished: false
        })
        if (unfinishedOrdersForUser.length !== 0) {
          throw new ApolloError('User has an active order.', '400')
        }
      }
      userSet.push(user)
    }
    return userSet.map(intendedUser => {
      return service.findOneAndUpdate(intendedUser._id, {
        state: intendedUser.state === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
      })
    })
  }

  async getUserByAdmin(_id) {
    return service.findOne({ _id })
  }

  async updateUserByAdmin(input, userId) {
    let user: any
    const { email, phoneNumber, addresses, passwordHash }: any = input
    await phoneNumberValidation.validateAsync({ phoneNumber })
    await updateUserInformationValidation.validateAsync({ email })
    await updateUserPasswordInformationValidation.validateAsync({ passwordHash })
    user = await service.findByEmail(email)
    if (user && String(user._id) !== String(userId)) {
      throw new ApolloError('user with this email exists', '400')
    }
    user = await service.findOneByPhoneNumber(phoneNumber)
    if (user && String(user._id) !== String(userId)) {
      throw new ApolloError('user with this phone number exists', '400')
    }
    if (passwordHash) {
      input.passwordHash = await bcrypt.hash(String(passwordHash), HASH_SALT)
    }
    user = await service.findOneAndUpdate({ _id: userId }, input)
    if (!user) {
      throw new ApolloError('user does not exists', '400')
    }
    const addressExists = await service.findAddress(
      user.defaultAddress.full,
      user.defaultAddress.zipCode,
      userId
    )
    if (!addressExists) {
      if (user.addresses.length > 0) {
        user = await service.findOneAndUpdate(
          { _id: userId },
          {
            defaultAddress: { full: user.addresses[0].full, zipCode: user.addresses[0].zipCode }
          }
        )
      } else {
        user = await service.findOneAndUpdate(
          { _id: userId },
          {
            defaultAddress: {}
          }
        )
      }
    }
    return user
  }
})()
