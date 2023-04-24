/* eslint-disable no-shadow */
/* eslint-disable no-await-in-loop */
import { ApolloError } from 'apollo-server-express'
import { Types } from 'mongoose'
import bcrypt from 'bcryptjs'
import _ from 'lodash'
import moment from 'moment'
import { v4 as uuidv4 } from 'uuid'
import { object } from 'twilio/lib/base/serialize'
import { RedisGet, RedisSetExpireDate, RedisDelete } from '../../utils/redis'
import errorService from '../errors/service'
import {
  phoneNumberValidation,
  signUpValidation,
  emailExistsValidation,
  changePasswordByPhoneNumberValidation,
  changePasswordByEmailValidation,
  updateUserInformationValidation,
  updateUserPasswordInformationValidation
} from '../../utils/validation/validation'
import {
  PHONE_VERIFICATION_TRIED_COUNT,
  LOGIN_NUMBER_OF_RETIRES,
  NUMBER_OF_RETIRES_EXPIRE_TIME,
  PHONE_VERIFICATION_EXPIRE_IN_SECONDS,
  PHONE_FORGOT_PASSWORD_EXPIRE_IN_SECONDS,
  HASH_SALT,
  APP_PUBLIC_URL
} from '../../config'
import generateToken from '../../utils/token'
import service from './service'
import AuthService from '../auth/service'
import carService from '../car/service'
import conversationService from '../conversation/service'
import userService from '../user/service'
import tripService from '../trip/service'
import transactionService from '../transaction/service'
import tripOrderService from '../tripOrder/service'
import shopService from '../shop/service'
import encrypt from '../../utils/encrypt'
import ControllerBase from '../../utils/controllerBase'
import sendEmail from '../../utils/email'
import sendSMS from '../../utils/sms'
import { createNotificationAndSendToDriver } from '../../utils/createNotificationAndSend'
import sendHtmlEmail from '../../utils/htmlContentEmail'
import userTokenController from '../userToken/controller'
import authController from '../auth/controller'
import Driver from './schema'
import Trip from '../trip/schema'
import Payment from '../payment/schema'
import paymentSchema from '../payment/schema'
import tripSchema from '../trip/schema'
import transactionSchema from '../transaction/schema'
import tripController from '../trip/controller'
import orderSchema from '../order/schema'
import shopSchema from '../shop/schema'
import trip from '../trip'
import cartschema from '../cart/schema'
import productSchema from '../product/schema'
import cart from '../cart'
import car from '../car'
import { isShopAdmin } from '../../utils/permissions/rules'

export default new (class Controller extends ControllerBase {
  async sendVerificationEmail({ fullName, email, _id }, driver = true) {
    // create link and send email
    const emailVerificationCode = uuidv4()
    await userTokenController.createEmailVerificationCode(
      emailVerificationCode,
      !driver ? _id : null,
      driver ? _id : null,
      null
    )
    const verifyLink = `${APP_PUBLIC_URL}/api/v1/email/verify/${emailVerificationCode}`
    sendHtmlEmail(
      email,
      'BEDO Verification Email',
      'verification',
      {
        link: verifyLink,
        name: fullName
      },
      `copy this link in your browser: ${verifyLink}`
    )
  }

  async sendForgotPasswordEmail({ fullName, email }, code) {
    // create link and send email
    return sendHtmlEmail(
      email,
      'BEDO Verification Email',
      'forgotPassword',
      {
        code,
        name: fullName
      },
      `your forgot password code is: ${code}`
    )
  }

  getDriverActiveVerificationRequest(driver) {
    // if there was an active verification request
    // will return its index as an string not a number
    // other wise return false
    if (!driver) {
      // message is not found but error is invalid http code
      throw new ApolloError('driver not found', '400')
    }

    if (!driver.verificationRequests) {
      return false
    }

    const activeVerificationRequestIndex = driver.verificationRequests.findIndex(
      i => i.status === 'PENDING'
    )

    return activeVerificationRequestIndex !== -1 ? activeVerificationRequestIndex.toString() : false
  }

  async setInActiveAllDriverSet() {
    await service.updateMany({}, { workStatus: 'INACTIVE' })
  }

  async setWorkDriverStatus(id: Types.ObjectId, status: string) {
    return service.setWorkDriverStatus(id, status)
  }

  async updateWorkStatus(workStatus: String, id: Types.ObjectId) {
    const result: any = await service.findOneAndUpdate(id, { workStatus })
    return {
      ...result._doc
    }
  }

  async getWorkDriverStatus(id: Types.ObjectId, language: any) {
    const driver: any = await service.findById(id)
    if (!driver) {
      const error = await errorService.findOneFromView(
        { title: 'driver does not exists' },
        language
      )
      throw new ApolloError(error.text, '404')
    }
    return {
      message: driver.workStatus
    }
  }

  async getDriverDetails(id: Types.ObjectId) {
    return service.findById(id)
  }

  async getDriverAboutMe(id) {
    const transaction = await transactionSchema.aggregate([
      { $match: { driver: Types.ObjectId(id) } },
      { $group: { _id: id, total: { $sum: '$amount' } } }
    ])
    const transactionNotNull = transaction.length === 0 ? 0 : transaction[0].total

    const trip = await tripSchema.count({ driver: id })

    const tripWaiting = await tripSchema.find({ driver: id, status: 'PENDING' }).count()

    const tripDistance = await tripSchema.aggregate([
      { $match: { driver: Types.ObjectId(id) } },
      { $group: { _id: id, total: { $sum: '$tripDistance' } } }
    ])
    const tripDistanceNotNull = tripDistance.length === 0 ? 0 : tripDistance[0].total

    const totalPayment = await paymentSchema.aggregate([
      { $match: { driver: Types.ObjectId(id) } },
      { $group: { _id: id, total: { $sum: '$amount' } } }
    ])
    const totalPaymentNotNull = totalPayment.length === 0 ? 0 : totalPayment[0].total

    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    const score = await tripSchema.aggregate([
      { $match: { driver: Types.ObjectId(id), createdAt: { $gte: startOfToday } } },
      { $group: { _id: id, total: { $avg: '$rate' } } }
    ])
    const scoreNotNull = score.length === 0 ? 0 : score[0].total

    const result = {
      tripsWaiting: tripWaiting,
      driverPayment: transactionNotNull,
      tripsNumber: trip,
      mileage: tripDistanceNotNull,
      totalAmount: totalPaymentNotNull,
      todayScore: scoreNotNull
    }
    return result
  }

  async getDriverHistoryByShopAdmin(id, driverId, filters: any = {}, pagination) {
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

    const driver = await service.findOne({ _id: Types.ObjectId(driverId) })
    if (!driver) {
      throw new ApolloError('driver does not exist', '404')
    }
    const driverShop = driver.shop
    const shop = await shopSchema.findOne({ shopAdmin: id })
    if (!shop) {
      throw new ApolloError('shop does not exist', '404')
    }
    const shopId = shop.id
    if (shopId != driverShop) {
      throw new ApolloError('driver does not belong to this shop', '403')
    }
    const orderCheck = await orderSchema.findOne({ shop: shopId })
    if (!orderCheck) {
      return
    }

    const orders = await orderSchema
      .aggregate([
        {
          $match: {
            shop: Types.ObjectId(shopId),
            ...filters
          }
        },
        {
          $lookup: {
            from: 'trips',
            let: { trip_id: '$trip' },
            pipeline: [
              { $match: { $expr: { $eq: ['$$trip_id', '$_id'] } } },
              {
                $lookup: {
                  from: 'drivers',
                  let: { driver_id: '$driver' },
                  pipeline: [
                    { $match: { $expr: { $eq: ['$$driver_id', Types.ObjectId(driverId)] } } },

                    { $sort: { driver: 1 } }
                  ],
                  as: 'driveMatch'
                }
              },
              { $unwind: '$driveMatch' }
            ],
            as: 'tripMatch'
          }
        },
        {
          $lookup: {
            from: 'carts',
            let: { cart_id: '$cart' },
            pipeline: [
              { $match: { $expr: { $eq: ['$$cart_id', '$_id'] } } },
              { $unwind: '$_id' },
              { $unwind: '$products' },
              {
                $group: {
                  _id: '$_id',
                  sum: { $sum: '$products.quantity' }
                }
              },
              {
                $group: {
                  _id: null,
                  cartsids: { $push: '$sum' }
                }
              },
              { $sort: { _id: 1 } }
            ],
            as: 'quantityMatch'
          }
        },
        {
          $match: {
            shop: Types.ObjectId(shopId),
            'tripMatch.driveMatch._id': Types.ObjectId(driverId),
            ...filters
          }
        },
        {
          $group: {
            _id: null,
            orderIDs: { $push: { $cond: ['$_id', '$_id', null] } },
            driverId: { $push: { $cond: [driver._id, driver._id, null] } },
            tripsRate: { $push: { $cond: ['$tripMatch.rate', '$tripMatch.rate', null] } },
            tripDistance: {
              $push: { $cond: ['$tripMatch.tripDistance', '$tripMatch.tripDistance', null] }
            },
            tripCost: { $push: { $cond: ['$tripMatch.cost', '$tripMatch.cost', null] } },
            tripRates: { $push: { $cond: ['$tripMatch.rate', '$tripMatch.rate', null] } },
            tripEnd: { $push: { $cond: ['$tripMatch.endDate', '$tripMatch.endDate', null] } },
            ordersCart: { $push: '$cart' },
            orderStatus: { $push: { $cond: ['$status', '$status', null] } },
            orderTrackId: { $push: { $cond: ['$tracking.trackId', '$tracking.trackId', null] } },
            orderPay: { $push: { $cond: ['$finalPrice', '$finalPrice', null] } },
            orderDate: { $push: { $cond: ['$createdAt', '$createdAt', null] } },
            orderDeliverOrderToCourierAt: {
              $push: { $cond: ['$deliverOrderToCourierAt', '$deliverOrderToCourierAt', null] }
            },
            salesQuantity: {
              $push: { $cond: ['$quantityMatch.cartsids', '$quantityMatch.cartsids', null] }
            }
          }
        }
      ])
      .skip(pagination ? pagination.skip : 0)
      .limit(pagination ? pagination.limit : 15)

    const ordersNotNull = orders.length === 0 ? 0 : orders[0]

    if (ordersNotNull == 0) {
      return
    }

    const result: any = []
    for (let i = 0; i < orders[0].orderIDs.length; i++) {
      result[i] = {
        orderStatus: ordersNotNull.orderStatus[i],
        orderTrackId: ordersNotNull.orderTrackId[i],
        orderDate: ordersNotNull.orderDate[i],
        orderPayment: ordersNotNull.orderPay[i],
        NumberOfSales: ordersNotNull.salesQuantity[i][0]
          ? ordersNotNull.salesQuantity[i][0][0]
          : null,
        deliveryRate: ordersNotNull.tripRates[i][0],
        distance: ordersNotNull.tripDistance[i][0],
        courierFee: ordersNotNull.tripCost[i][0],
        deliveryCourierTime: ordersNotNull.orderDeliverOrderToCourierAt[i],
        deliveryCustomerTime: ordersNotNull.tripEnd[i][0]
      }
    }
    return result
  }

  async setDefaultCar(carId: Types.ObjectId, driverId: Types.ObjectId, language: any) {
    let error: any = {}
    let driver: any
    driver = await service.findById(driverId)
    if (!driver) {
      error = await errorService.findOneFromView({ title: 'driver does not exists' }, language)
      throw new ApolloError(error.text, '404')
    }
    const car = await carService.findById(carId)
    if (!car) {
      error = await errorService.findOneFromView({ title: 'your car does not exists' }, language)
      throw new ApolloError(error.text, '404')
    }

    if (!driver.car.includes(carId)) {
      error = await errorService.findOneFromView({ title: 'car is not related to you' }, language)
      throw new ApolloError(error.text, '403')
    }
    driver = await service.findOneAndUpdate(driverId, { defaultCar: carId })

    return {
      ...driver._doc
    }
  }

  async getDefaultCar(id: Types.ObjectId, language) {
    let error: any = {}
    let driver: any
    driver = await service.findById(id)
    if (!driver) {
      error = await errorService.findOneFromView({ title: 'driver does not exists' }, language)
      throw new ApolloError(error.text, '404')
    }
    if (!driver.defaultCar) {
      error = await errorService.findOneFromView({ title: 'first set your default car' }, language)
      throw new ApolloError(error.text, '403')
    }
    const car: any = await carService.findById(driver.defaultCar)
    if (!car) {
      error = await errorService.findOneFromView({ title: 'your car does not exists' }, language)
      throw new ApolloError(error.text, '404')
    }
    return {
      ...car._doc
    }
  }

  async checkDriverPhoneSignupCode(phoneNumber: string, phoneSignUpCode: String, language: any) {
    let error: any = {}
    const codeExists = await AuthService.checkSignUpCodeExists(phoneNumber)
    if (codeExists === null || codeExists === undefined) {
      error = await errorService.findOneFromView(
        { title: 'you took too long please try again ' },
        language
      )
      throw new ApolloError(error.text, '403')
    }

    const triedCount = await AuthService.checkTriedCount(phoneNumber, 'signUpCode')
    const signUpCode = await AuthService.getSignUpCode(phoneNumber)
    if (triedCount < PHONE_VERIFICATION_TRIED_COUNT) {
      await AuthService.updateTriedCount(phoneNumber, signUpCode, triedCount, 'signUpCode')
    } else {
      await AuthService.removeFromRedis(phoneNumber, 'signUpCode')
      error = await errorService.findOneFromView(
        { title: 'maximum try count exceeded please try again later' },
        language
      )
      throw new ApolloError(error.text, '403')
    }
    if (String(phoneSignUpCode) === String(signUpCode)) {
      await AuthService.removeFromRedis(phoneNumber, 'signUpCode')
      return true
    }
    error = await errorService.findOneFromView({ title: 'your signUp code is incorrect' }, language)
    throw new ApolloError(error.text, '403')
  }

  async driverSignUp(
    fullName: string,
    email: string,
    phoneNumber: string,
    password: string,
    FCM: string,
    language: any
  ) {
    await signUpValidation.validateAsync({
      phoneNumber,
      password,
      email,
      fullName
    })
    const phoneNumberExists = await service.findOneByPhoneNumber(phoneNumber)
    const emailDriverExists = await service.findByEmail(email)
    if (phoneNumberExists || emailDriverExists) {
      const error = await errorService.findOneFromView(
        { title: 'Driver already exists.' },
        language
      )
      throw new ApolloError(error.text, '400')
    }
    const passwordHash = await bcrypt.hash(String(password), HASH_SALT)
    const driver = await service.create({
      fullName,
      email,
      phoneNumber,
      passwordHash,
      phoneNumberVerified: true
    })
    const { _id } = driver
    const token = generateToken(_id, 'DRIVER', FCM)
    return {
      ...driver._doc,
      token
    }
  }

  async publicDriverSignUp(driverData, language) {
    const {
      fullName,
      phoneNumber,
      password,
      gender,
      email,
      bithDate,
      address,
      zipCode
    } = driverData
    await signUpValidation.validateAsync({
      phoneNumber,
      password,
      email,
      fullName
    })

    const phoneNumberExists = await service.findOneByPhoneNumber(phoneNumber)
    const emailDriverExists = await service.findByEmail(email)
    if (phoneNumberExists || emailDriverExists) {
      const error = await errorService.findOneFromView(
        { title: 'Driver already exists.' },
        language
      )
      throw new ApolloError(error.text, '400')
    }
    const passwordHash = await bcrypt.hash(String(password), HASH_SALT)
    const driver = await service.create({
      ...driverData,
      passwordHash,
      phoneNumberVerified: true
    })
    const token = generateToken(driver._id, 'DRIVER', '')
    return {
      ...driver._doc,
      token
    }
  }

  async driverLogin(emailOrPhoneNumber: string, password: string, FCM: string, language: any) {
    let error: any = {}
    const redisKey = `${emailOrPhoneNumber}-login`
    let driver: any

    const numberOfRetires = await RedisGet(redisKey)
    if (Number(numberOfRetires) >= LOGIN_NUMBER_OF_RETIRES) {
      if (emailOrPhoneNumber.includes('@')) {
        await sendHtmlEmail(
          emailOrPhoneNumber,
          'Login Attempt',
          'general',
          {
            text:
              'there was some attempt to login to your BEDO account, if it was not you, change your password'
          },
          'there was some attempt to login to your BEDO account, if it was not you, change your password'
        )
      } else {
        await sendSMS(
          emailOrPhoneNumber,
          'there was some attempt to login to your BEDO account, if it was not you, change your password'
        )
      }
      error = await errorService.findOneFromView(
        { title: 'maximum number of tries exceeded please try again in 10 minutes' },
        language
      )
      throw new ApolloError(error.text, '403')
    }
    if (emailOrPhoneNumber.includes('@')) {
      driver = await service.findByEmail(String(emailOrPhoneNumber).toLowerCase())
    } else {
      driver = await service.findOneByPhoneNumber(emailOrPhoneNumber)
    }
    if (driver) {
      const { passwordHash, _id } = driver
      const match = await bcrypt.compare(String(password), passwordHash)
      if (match) {
        const token = generateToken(_id, 'DRIVER', FCM)
        return {
          ...driver._doc,
          token
        }
      }
      if (!numberOfRetires) {
        await RedisSetExpireDate(redisKey, 1, NUMBER_OF_RETIRES_EXPIRE_TIME)
      } else {
        const newNumberOfRetries = Number(numberOfRetires) + 1
        await RedisSetExpireDate(redisKey, newNumberOfRetries, NUMBER_OF_RETIRES_EXPIRE_TIME)
      }
      error = await errorService.findOneFromView({ title: 'incorrect information' }, language)
      throw new ApolloError(error.text, '403')
    }
    error = await errorService.findOneFromView({ title: 'driver not found' }, language)
    throw new ApolloError(error.text, '404')
  }

  async createDriverByShopAdmin(data: any, user: any) {
    const { fullName, email, phoneNumber, password, profileImageUrl, address, gender }: any = data
    // validate data
    await signUpValidation.validateAsync({
      phoneNumber,
      password,
      email,
      fullName
    })
    const shop: any = await shopService.findById(user.shop)
    if (!shop) {
      throw new ApolloError('shop not found', '404')
    }
    const phoneNumberExists: any = await service.findOneByPhoneNumber(phoneNumber)
    const emailDriverExists: any = await service.findByEmail(email)
    if (phoneNumberExists || emailDriverExists) {
      throw new ApolloError('Driver already exists.', '400')
    }
    const passwordHash: any = await bcrypt.hash(String(password), HASH_SALT)
    const newDriver: any = await service.create({
      shop: shop._id,
      fullName,
      email,
      phoneNumber,
      passwordHash,
      profileImageUrl,
      address,
      gender,
      phoneNumberVerified: true
    })

    return newDriver
  }

  async getDriverPhoneSignUpCode(phoneNumber: string, language: any) {
    await phoneNumberValidation.validateAsync({
      phoneNumber
    })
    const driver = await service.findOneByPhoneNumber(phoneNumber)
    if (!driver) {
      const phoneVerificationCode = await AuthService.createSignUpCode(phoneNumber)
      sendSMS(phoneNumber, `Your Verification Code Is ${phoneVerificationCode} `)
      return {
        phoneVerificationCode,
        phoneVerificationCodeExpireTime: PHONE_VERIFICATION_EXPIRE_IN_SECONDS
      }
    }
    const error = await errorService.findOneFromView(
      { title: 'driver with this phone number exists' },
      language
    )
    throw new ApolloError(error.text)
  }

  async driverCheckEmail(email: String) {
    await emailExistsValidation.validateAsync({ email })
    const driver = await service.findByEmail(email)
    if (driver) {
      return {
        message: 'Email already exists',
        exist: true
      }
    }
    return {
      message: 'Email is free',
      exist: false
    }
  }

  async getDriverForgotPasswordCode(phoneNumber: string, language: any) {
    await phoneNumberValidation.validateAsync({
      phoneNumber
    })
    const driver = await service.findOneByPhoneNumber(phoneNumber)
    if (!driver) {
      const error = await errorService.findOneFromView(
        { title: 'driver with this phone number  does not exists' },
        language
      )
      throw new ApolloError(error.text, '404')
    }
    const forgotPasswordCode = await AuthService.createForgotPasswordCode(phoneNumber)
    sendSMS(phoneNumber, `Your Forgot Password Code Is ${forgotPasswordCode} `)
    return {
      phoneForgotPasswordCodeExpireTime: PHONE_FORGOT_PASSWORD_EXPIRE_IN_SECONDS
    }
  }

  async checkDriverForgotPasswordCode(
    phoneNumber: String,
    phoneForgotPasswordCode: String,
    language: any
  ) {
    let error: any = {}
    await phoneNumberValidation.validateAsync({
      phoneNumber
    })
    const forgotPasswordCodeExists = await AuthService.checkForgotPasswordCodeExists(phoneNumber)
    if (forgotPasswordCodeExists === null || forgotPasswordCodeExists === undefined) {
      error = await errorService.findOneFromView(
        { title: 'Your forgot password code has expired please get a new forgot password code ' },
        language
      )
      throw new ApolloError(error.text, '403')
    }
    const triedCount = await AuthService.checkTriedCount(phoneNumber, 'forgotPasswordCode')
    const forgotPasswordCode = await AuthService.getForgotPasswordCode(phoneNumber)
    if (triedCount < PHONE_VERIFICATION_TRIED_COUNT) {
      await AuthService.updateTriedCount(
        phoneNumber,
        forgotPasswordCode,
        triedCount,
        'forgotPasswordCode'
      )
    } else {
      await AuthService.removeFromRedis(phoneNumber, 'forgotPasswordCode')
      error = await errorService.findOneFromView(
        { title: 'maximum try count exceeded please try again later' },
        language
      )
      throw new ApolloError(error.text, '403')
    }
    if (String(phoneForgotPasswordCode) === String(forgotPasswordCode)) {
      const phoneNumberExists = await service.findOneByPhoneNumber(phoneNumber)
      if (!phoneNumberExists) {
        error = await errorService.findOneFromView({ title: 'driver does not exists' }, language)
        throw new ApolloError(error.text, '404')
      }
      const changePasswordCode = await AuthService.createChangePasswordCode(phoneNumber)
      await AuthService.removeFromRedis(phoneNumber, 'forgotPasswordCode')
      return {
        changePasswordCode
      }
    }
    error = await errorService.findOneFromView(
      { title: 'your forgot password code is incorrect' },
      language
    )
    throw new ApolloError(error.text, '403')
  }

  async driverChangePassword(newPassword: String, currentPassword: String, userId, language: any) {
    let error: any = {}
    const driver: any = await service.findById(userId)
    if (driver) {
      const { passwordHash, isVerified } = driver
      const match = await bcrypt.compare(String(currentPassword), passwordHash)
      if (match) {
        const hashPassword = await bcrypt.hash(String(newPassword), HASH_SALT)
        await service.findOneAndUpdate({ _id: driver._id }, { passwordHash: hashPassword })
        const msg = await errorService.findOneFromView(
          { title: 'Password changed successfully.' },
          language
        )
        return {
          message: msg.text
        }
      }
      error = await errorService.findOneFromView({ title: 'incorrect information' }, language)
      throw new ApolloError(error.text, '400')
    }
    error = await errorService.findOneFromView({ title: 'admin does not exists' }, language)
    throw new ApolloError(error.text, '404')
  }

  async changeDriverPassword(
    emailOrPhoneNumber: String,
    password: String,
    phoneChangePasswordCode: String
  ) {
    if (emailOrPhoneNumber.includes('@')) {
      const email = emailOrPhoneNumber
      await changePasswordByEmailValidation.validateAsync({
        email,
        password
      })
    } else {
      const phoneNumber = emailOrPhoneNumber
      await changePasswordByPhoneNumberValidation.validateAsync({
        phoneNumber,
        password
      })
    }
    const changePasswordCodeExists = await AuthService.checkChangePasswordCodeExists(
      emailOrPhoneNumber
    )
    if (changePasswordCodeExists === null || changePasswordCodeExists === undefined) {
      throw new ApolloError('you took too long please try again ', '403')
    }
    const triedCount = await AuthService.checkTriedCount(emailOrPhoneNumber, 'changePasswordCode')
    const changePasswordCode = await AuthService.getChangePasswordCode(emailOrPhoneNumber)
    if (triedCount < PHONE_VERIFICATION_TRIED_COUNT) {
      await AuthService.updateTriedCount(
        emailOrPhoneNumber,
        changePasswordCode,
        triedCount,
        'changePasswordCode'
      )
    } else {
      await AuthService.removeFromRedis(emailOrPhoneNumber, 'changePasswordCode')
      throw new ApolloError('maximum try count exceeded please try again later', '403')
    }
    if (String(phoneChangePasswordCode) === String(changePasswordCode)) {
      await AuthService.removeFromRedis(emailOrPhoneNumber, 'changePasswordCode')
      if (emailOrPhoneNumber.includes('@')) {
        const emailExists = await service.findByEmail(emailOrPhoneNumber)
        if (!emailExists) {
          throw new ApolloError('driver does not exists', '404')
        }
        await service.changePassword(emailOrPhoneNumber, password, 'email')
        return {
          message: 'Password changed successfully'
        }
      }
      const phoneNumberExists = await service.findOneByPhoneNumber(emailOrPhoneNumber)
      if (!phoneNumberExists) {
        throw new ApolloError('driver does not exists', '404')
      }
      await service.changePassword(emailOrPhoneNumber, password, 'phoneNumber')
      return {
        message: 'Password changed successfully'
      }
    }

    throw new ApolloError('your change password code is incorrect', '403')
  }

  async getDriverForgotPasswordEmailCode(email: String, language) {
    let error: any = {}
    await emailExistsValidation.validateAsync({ email })
    let driver: any
    driver = await service.findByEmail(email)
    if (!driver) {
      error = await errorService.findOneFromView(
        { title: 'driver with this email does not exist' },
        language
      )
      throw new ApolloError(error.text, '404')
    }
    if (!driver.emailVerified) {
      error = await errorService.findOneFromView(
        { title: 'please first verify your email' },
        language
      )
      throw new ApolloError(error.text, '403')
    }
    const forgotPasswordCode = await AuthService.createForgotPasswordCode(email)
    this.sendForgotPasswordEmail(driver, forgotPasswordCode)
    return {
      phoneForgotPasswordCodeExpireTime: PHONE_FORGOT_PASSWORD_EXPIRE_IN_SECONDS
    }
  }

  async checkDriverEmailForgotPasswordCode(
    email: String,
    phoneForgotPasswordCode: String,
    language: any
  ) {
    let error: any = {}
    await emailExistsValidation.validateAsync({
      email
    })
    const forgotPasswordCodeExists = await AuthService.checkForgotPasswordCodeExists(email)
    if (forgotPasswordCodeExists === null || forgotPasswordCodeExists === undefined) {
      error = await errorService.findOneFromView(
        { title: 'Your forgot password code has expired please get a new forgot password code ' },
        language
      )
      throw new ApolloError(error.text, '403')
    }
    const triedCount = await AuthService.checkTriedCount(email, 'forgotPasswordCode')
    const forgotPasswordCode = await AuthService.getForgotPasswordCode(email)
    if (triedCount < PHONE_VERIFICATION_TRIED_COUNT) {
      await AuthService.updateTriedCount(
        email,
        forgotPasswordCode,
        triedCount,
        'forgotPasswordCode'
      )
    } else {
      await AuthService.removeFromRedis(email, 'forgotPasswordCode')
      error = await errorService.findOneFromView(
        { title: 'maximum try count exceeded please try again later' },
        language
      )
      throw new ApolloError(error.text, '403')
    }
    if (String(phoneForgotPasswordCode) === String(forgotPasswordCode)) {
      const emailExists = await service.findByEmail(email)
      if (!emailExists) {
        error = await errorService.findOneFromView({ title: 'driver does not exists' }, language)
        throw new ApolloError(error.text, '404')
      }
      const changePasswordCode = await AuthService.createChangePasswordCode(email)
      await AuthService.removeFromRedis(email, 'forgotPasswordCode')

      return {
        changePasswordCode
      }
    }
    error = await errorService.findOneFromView(
      { title: 'your forgot password code is incorrect' },
      language
    )
    throw new ApolloError(error.text, '403')
  }

  async checkDriverVerificationCode(phoneNumber: String, phoneVerificationCode: String) {
    await phoneNumberValidation.validateAsync({
      phoneNumber
    })
    const codeExists = await AuthService.checkVerificationCodeExists(phoneNumber)
    if (codeExists === null || codeExists === undefined) {
      throw new ApolloError(
        'Your verification code has expired please get a new verification code ',
        '403'
      )
    }

    const triedCount = await AuthService.checkTriedCount(phoneNumber, 'verificationCode')
    const verificationCode = await AuthService.getVerificationCode(phoneNumber)
    if (triedCount < PHONE_VERIFICATION_TRIED_COUNT) {
      await AuthService.updateTriedCount(
        phoneNumber,
        verificationCode,
        triedCount,
        'verificationCode'
      )
    } else {
      await AuthService.removeFromRedis(phoneNumber, 'verificationCode')
      throw new ApolloError('maximum try count exceeded please try again later', '403')
    }
    if (String(phoneVerificationCode) === String(verificationCode)) {
      const phoneNumberExists = await service.findOneByPhoneNumber(phoneNumber)
      if (phoneNumberExists) {
        throw new ApolloError('Driver already exists.', '400')
      }
      await AuthService.removeFromRedis(phoneNumber, 'verificationCode')
      const phoneSignUpCode = await AuthService.createSignUpCode(phoneNumber)
      return {
        phoneSignUpCode
      }
    }
    throw new ApolloError('your verification code is incorrect', '403')
  }

  async getDriverInformation(id: Types.ObjectId) {
    return service.findOne({ _id: id })
  }

  async getMenuUnreadFields(user) {
    let { roles }: any = user
    let unreadNotificationExists: any
    roles = roles.toLowerCase().includes('admin') ? 'admin' : roles.toLowerCase()
    let unreadMessageExists: any = await conversationService.findOne({
      $or: [{ user: user.sub }, { driver: user.sub }, { admin: user.sub }],
      [`${roles}UnreadCount`]: { $gt: 0 }
    })
    if (unreadMessageExists) {
      unreadMessageExists = true
    } else {
      unreadMessageExists = false
    }

    if (roles === 'user') {
      unreadNotificationExists = await userService.findOne({
        _id: user.sub,
        hasNotification: true
      })
      if (unreadNotificationExists) {
        unreadNotificationExists = true
      } else {
        unreadNotificationExists = false
      }
    }

    if (roles === 'driver') {
      unreadNotificationExists = await service.findOne({
        _id: user.sub,
        hasNotification: true
      })
      if (unreadNotificationExists) {
        unreadNotificationExists = true
      } else {
        unreadNotificationExists = false
      }
    }

    return {
      unreadMessageExists,
      unreadNotificationExists
    }
  }

  async getOnlineDriverSetByAdmin() {
    return service.find({ workStatus: 'ACTIVE' })
  }

  async getInTripDriverSetByAdmin() {
    const tripSet = await tripService.find({
      $or: [{ state: 'ACCEPTED' }, { state: 'PICKED_UP' }, { state: 'WAITING' }]
    })
    return tripSet.map(trip => ({ driver: trip.driver, trip }))
  }

  async verificationRequest(user, argInputs, language) {
    const inputs = argInputs
    const driver: any = await service.findById(user.userId)
    const hasActiveVerificationRequest = this.getDriverActiveVerificationRequest(driver)
    if (hasActiveVerificationRequest) {
      const error = await errorService.findOneFromView(
        { title: 'you already submitted a verify request' },
        language
      )
      throw new ApolloError(error.text, '400')
    }

    const verifyRequest = {
      status: 'PENDING',
      submitDate: moment(new Date()).utc(),
      verificationDetails: inputs
    }

    return service.findOneAndUpdate(driver._id, {
      $push: { verificationRequests: verifyRequest }
    })
  }

  async approveDriverVerificationRequestByAdmin(driverId) {
    const driver: any = await service.findById(driverId)
    const activeVerificationRequestIndex = this.getDriverActiveVerificationRequest(driver)
    if (!activeVerificationRequestIndex) {
      throw new ApolloError('this driver has no active verification request', '400')
    }

    const { verificationDetails } = driver.verificationRequests[activeVerificationRequestIndex]

    const { address, drivingLicence, gender, birthDate, profileImageUrl } = verificationDetails

    sendEmail(
      driver.email,
      `Dear ${driver.fullName} Congratulations!`,
      'Your account has been verified. Now you can add car to your garage.'
    )

    sendSMS(
      driver.phoneNumber,
      `Dear ${driver.fullName} Congratulations!, your account has been verified . now you can add car to your garage`
    )

    createNotificationAndSendToDriver(
      driver._id,
      'IMPORTANT',
      `Dear ${driver.fullName} Congratulations!`,
      'Your account has been verified. Now you can add car to your garage.'
    )

    if (!driver.emailVerified) {
      await this.sendVerificationEmail(driver)
    }

    return service.findOneAndUpdate(driver._id, {
      isVerified: true,
      address,
      drivingLicence,
      profileImageUrl,
      gender,
      birthDate,
      [`verificationRequests.${activeVerificationRequestIndex}.status`]: 'APPROVED'
    })
  }

  async rejectDriverVerificationRequestByAdmin(driverId, message) {
    const driver: any = await service.findById(driverId)
    const activeVerificationRequestIndex = this.getDriverActiveVerificationRequest(driver)
    if (!activeVerificationRequestIndex) {
      throw new ApolloError('this driver has no active verification request', '400')
    }

    return service.findOneAndUpdate(driver._id, {
      [`verificationRequests.${activeVerificationRequestIndex}.status`]: 'REJECTED',
      [`verificationRequests.${activeVerificationRequestIndex}.rejectionMessage`]: message
    })
  }

  async suspendDriverByAdmin(driverId) {
    const driver: any = await service.findOne({
      _id: driverId
    })
    if (!driver) {
      throw new ApolloError('Driver does not exist.', '400')
    }
    if (driver.state === 'ACTIVE') {
      if (driver.defaultCar) {
        const defaultDriverCar: any = await carService.findById(driver.defaultCar)
        if (defaultDriverCar.isInTrip) {
          throw new ApolloError('Driver is on a trip.', '400')
        }
      }
    }
  }

  async suspendDriverSetByAdmin(idSet) {
    const driverSet: any = []
    for (let index = 0; index < idSet.length; index++) {
      const driverId = idSet[index]
      const driver: any = await service.findOne({
        _id: driverId
      })
      if (!driver) {
        throw new ApolloError('Driver does not exist.', '400')
      }
      if (driver.isDeleted) throw new ApolloError('Driver has been deleted before.', '400')

      if (driver.defaultCar) {
        const defaultDriverCar: any = await carService.findById(driver.defaultCar)
        if (defaultDriverCar.isInTrip) {
          throw new ApolloError('Driver is on a trip.', '400')
        }
      }
      driverSet.push(driver)
    }

    return driverSet.map(async driver => {
      return service.findOneAndUpdate(driver._id, {
        state: driver.state === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED'
      })
    })
  }

  async deleteDriverByShopAdmin(idSet: Types.ObjectId[]) {
    for (let index = 0; index < idSet.length; index++) {
      const driverId = idSet[index]
      const driver: any = await service.findById(driverId)
      if (!driver) {
        throw new ApolloError('Driver does not exist.', '400')
      }
      if (driver.isDeleted) throw new ApolloError('Driver has been deleted before.', '400')

      if (driver.defaultCar) {
        const defaultDriverCar: any = await carService.findById(driver.defaultCar)
        if (defaultDriverCar.isInTrip) {
          throw new ApolloError('Driver is on a trip.', '400')
        }
      }
    }

    return idSet.map(id => service.findOneAndUpdate(id, { isDeleted: true }))
  }

  async activateDriverByAdmin(driverId) {
    const driver: any = await service.findOne({
      _id: driverId,
      state: 'SUSPENDED'
    })
    if (!driver) {
      throw new ApolloError('there is no suspended driver with this id', '400')
    }
    return service.findOneAndUpdate(driver._id, {
      state: 'ACTIVE'
    })
  }

  async driverSignUpByAdmin(input) {
    const { phoneNumber, password, email, fullName }: any = input
    await signUpValidation.validateAsync({
      phoneNumber,
      password,
      email,
      fullName
    })

    const phoneNumberExists = await service.findOneByPhoneNumber(phoneNumber)
    const emailDriverExists = await service.findByEmail(email)
    if (phoneNumberExists || emailDriverExists) {
      throw new ApolloError('Driver already exists.', '400')
    }
    const passwordHash = await bcrypt.hash(String(password), HASH_SALT)
    const driver = await service.create({
      fullName,
      email,
      phoneNumber,
      passwordHash,
      phoneNumberVerified: true,
      emailVerified: true,
      isVerified: true
    })
    const { _id } = driver
    const token = generateToken(_id, 'DRIVER', '')
    return {
      ...driver._doc,
      token
    }
  }

  async driverSignUpByShopAdmin(input) {
    const { phoneNumber, password, email, fullName }: any = input
    await signUpValidation.validateAsync({
      phoneNumber,
      password,
      email,
      fullName
    })

    const phoneNumberExists = await service.findOneByPhoneNumber(phoneNumber)
    const emailDriverExists = await service.findByEmail(email)
    if (phoneNumberExists || emailDriverExists) {
      throw new ApolloError('Driver already exists.', '400')
    }
    const passwordHash = await bcrypt.hash(String(password), HASH_SALT)
    const driver = await service.create({
      fullName,
      email,
      phoneNumber,
      passwordHash,
      phoneNumberVerified: true,
      emailVerified: true,
      isVerified: true
    })
    const { _id } = driver
    const token = generateToken(_id, 'DRIVER', '')
    return {
      ...driver._doc,
      token
    }
  }

  async updateDriverProfile(input, driverId, language) {
    const { profileImageUrl, fullName, birthDate, address } = input
    if (address) {
      if (!address.full || !address.zipCode) {
        const error = await errorService.findOneFromView(
          { title: 'invalid address input' },
          language
        )
        throw new ApolloError(error.text, '400')
      }
    }
    await updateUserInformationValidation.validateAsync({
      profileImageUrl,
      fullName,
      birthDate
    })

    return service.findOneAndUpdate({ _id: driverId }, input)
  }

  async updateDriverInfoByAdmin(input, driverId) {
    const {
      profileImageUrl,
      fullName,
      birthDate,
      address,
      email,
      phoneNumber,
      passwordHash,
      isVerified
    } = input
    if (address) {
      if (!address.full || !address.zipCode) {
        throw new ApolloError('invalid address input', '400')
      }
    }
    await updateUserInformationValidation.validateAsync({
      profileImageUrl,
      fullName,
      birthDate,
      email
    })
    if (email) {
      const findedDriver = await service.findByEmail(email)
      if (findedDriver && findedDriver._id.toString() !== driverId) {
        throw new ApolloError('this email is already taken.', '400')
      }
    }
    if (phoneNumber) {
      const findedDriver = await service.findOneByPhoneNumber(phoneNumber)
      if (findedDriver && findedDriver._id.toString() !== driverId) {
        throw new ApolloError('this phone number is already taken.', '400')
      }
    }
    if (passwordHash) {
      await updateUserPasswordInformationValidation.validateAsync({ passwordHash })
      input.passwordHash = await bcrypt.hash(String(input.passwordHash), HASH_SALT)
    }
    return service.findOneAndUpdate(driverId, input)
  }

  async updateDriverInfoByShopAdmin(input, driverId) {
    const { profileImageUrl, fullName, birthDate, address, email, phoneNumber, isVerified } = input
    if (address) {
      if (!address.full || !address.zipCode) {
        throw new ApolloError('invalid address input', '400')
      }
    }
    await updateUserInformationValidation.validateAsync({
      profileImageUrl,
      fullName,
      birthDate,
      email
    })
    if (email) {
      const findedDriver = await service.findByEmail(email)
      if (findedDriver && findedDriver._id.toString() !== driverId) {
        throw new ApolloError('this email is already taken.', '400')
      }
    }
    if (phoneNumber) {
      const findedDriver = await service.findOneByPhoneNumber(phoneNumber)
      if (findedDriver && findedDriver._id.toString() !== driverId) {
        throw new ApolloError('this phone number is already taken.', '400')
      }
    }
    return service.findOneAndUpdate(driverId, input)
  }

  async setDefaultCarByAdmin(driverId, carId) {
    const driver = await service.findById(driverId)
    if (!driver) {
      throw new ApolloError('driver not found!', '404')
    }
    // @ts-ignore
    if (!driver.car.includes(carId)) {
      throw new ApolloError('this car does not belong to this driver.', '400')
    }
    const currentTrip = await tripService.driverHaveCurrentTrip(driverId)
    if (currentTrip) {
      throw new ApolloError('you cant set the default car during trip ', '400')
    }
    return this.service.findOneAndUpdate(driverId, { defaultCar: carId })
  }

  getDriversVerificationRequestsByAdmin(filters, pagination, sort) {
    return service.getDriversVerificationRequestsByAdmin(filters, pagination, sort)
  }

  getDriversVerificationRequestsCountByAdmin(filters) {
    return service.getDriversVerificationRequestsCountByAdmin(filters)
  }

  async getDriversByAdmin(filters: any = {}, pagination, sort) {
    let filtersInput = {}
    if ('fullName' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.fullName = new RegExp(filters.fullName, 'gi')
    }
    if ('phoneNumber' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.phoneNumber = new RegExp(filters.phoneNumber, 'gi')
    }
    if ('email' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.email = new RegExp(filters.email, 'gi')
    }
    if (filters.IncompleteInformationDrivers != null) {
      if (filters.IncompleteInformationDrivers) {
        filtersInput = {
          $or: [
            { gender: null },
            { address: null },
            { profileImageUrl: null },
            { birthDate: null },
            { drivingLicence: null }
          ]
        }
      } else {
        filtersInput = {
          $and: [
            { gender: { $ne: null } },
            { address: { $ne: null } },
            { profileImageUrl: { $ne: null } },
            { birthDate: { $ne: null } },
            { drivingLicence: { $ne: null } }
          ]
        }
      }
    }
    filters = _.omit(filters, 'IncompleteInformationDrivers')
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

    if ('averageRate' in filters && 'averageRateFrom' in filters) {
      filters.averageRate = {
        $gte: filters.averageRateFrom,
        $lte: filters.averageRate
      }
      delete filters.averageRateFrom
    } else if ('averageRateFrom' in filters) {
      filters.averageRate = {
        $gte: filters.averageRateFrom
      }
      delete filters.averageRateFrom
    } else if ('averageRate' in filters) {
      filters.averageRate = {
        $lte: filters.averageRate
      }
    }

    if ('updatedAt' in filters) {
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
    if ('shop' in filters) {
      filters.shop = {
        $eq: filters.shop
      }
      delete filters.shop
    }
    return service.find({ ...filters, ...filtersInput, isDeleted: false }, pagination, sort)
  }

  async getDriverStatisticsList(user, filters: any = {}) {
    const driver: any = await service.findById(user.sub)
    if (!driver) {
      throw new ApolloError('driver not found', '404')
    }

    if ('to' in filters && 'from' in filters) {
      filters.createdAt = {
        $gte: moment(new Date(filters.from))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.to))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.from
      delete filters.to
    }

    const successfulSubmissions = await tripService.count({
      ...filters,
      driver: driver._id,
      state: 'DESTINATION'
    })
    const unSuccessfulSubmissions = await tripService.count({
      ...filters,
      driver: driver._id,
      state: 'PASSENGER_CANCELED'
    })
    const numAllTrips = await tripService.count({
      ...filters,
      driver: driver._id
    })
    const cashDaySales = await transactionService.count({
      ...filters,
      driver: driver._id,
      transactionMethod: 'CASH'
    })
    const cardDaySales = await transactionService.count({
      ...filters,
      driver: driver._id,
      transactionMethod: 'ONLINE'
    })

    const tripfound: any = await tripService.find({ ...filters, driver: driver._id })

    let driverTotalPrice = 0
    let companyCommission = 0
    const tripIDs: any = []
    for (let i = 0; i < tripfound.length; i++) {
      driverTotalPrice += tripfound[i].driverTotalPrice
      tripIDs.push(tripfound[i]._id)
    }
    for (let i = 0; i < tripIDs.length; i++) {
      const tripOrder: any = await tripOrderService.findOne({ trip: tripIDs[i] })

      if (tripOrder && tripOrder.commission) {
        companyCommission += tripOrder.commission
      }
    }

    return {
      successfulSubmissions,
      unSuccessfulSubmissions,
      numAllTrips,
      cashDaySales,
      cardDaySales,
      driverTotalPrice,
      companyCommission
    }
  }

  addDays(date, days) {
    const copy = new Date(Number(date))
    copy.setDate(date.getDate() + days)
    return copy
  }

  addHours(date, h) {
    const copy = new Date(Number(date))
    copy.setTime(copy.getTime() + h * 60 * 60 * 1000)
    return copy
  }

  differenceDays(day1, day2) {
    const Day1: any = new Date(day1)
    const Day2: any = new Date(day2)
    const difference = Math.abs(Day2 - Day1)
    const days = difference / (1000 * 3600 * 24)
    return Math.floor(days)
  }

  async countTripInOneDay(driverId, filters: any = {}, days, createdFrom) {
    const countTripsInOneDay: any = []
    const from = new Date(createdFrom)
    for (let i = 0; i <= days; i++) {
      const date = this.addDays(from, i)
      filters.createdAt = {
        $gte: moment(new Date(date))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(date))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.from
      delete filters.to
      delete filters.hour
      const numAllTrips = await tripService.count({
        ...filters,
        driver: driverId
      })
      const obj = {
        num: numAllTrips,
        date
      }
      countTripsInOneDay.push(obj)
    }
    return countTripsInOneDay
  }

  async countTripInHours(driverId, filters: any = {}) {
    const countTripsInOneDay: any = []
    const d = filters.from
    const splitDate = d.split('T')[0]
    const date = new Date(splitDate)
    const today = this.addHours(date, 1)
    let from = this.addHours(date, 1)
    const { hour } = filters
    for (let i = 0; i < 24; i += hour) {
      const to = this.addHours(today, i + hour - 1)
      filters.createdAt = {
        $gte: moment(new Date(from))
          .utc()
          .startOf('hour')
          .toDate(),
        $lte: moment(new Date(to))
          .utc()
          .endOf('hour')
          .toDate()
      }
      delete filters.from
      delete filters.to
      delete filters.hour
      const numAllTrips = await tripService.count({
        ...filters,
        driver: driverId
      })
      const obj = {
        num: numAllTrips,
        date: to
      }
      countTripsInOneDay.push(obj)
      from = to
    }
    return countTripsInOneDay
  }

  async getDriverStatisticsListCountTrips(user, filters: any = {}) {
    const driver: any = await service.findById(user.sub)
    if (!driver) {
      throw new ApolloError('driver not found', '404')
    }
    // the last 3 days && the last 7 days && the last 30 days && TODAY
    if ('from' in filters && 'to' in filters) {
      const days = this.differenceDays(filters.to, filters.from)
      // TODAY
      if (days === 0 && 'hour' in filters) {
        const countTripInHours = this.countTripInHours(driver._id, filters)
        return countTripInHours
      }
      // the last 3 days && the last 7 days && the last 30 days

      const countTrip: any = this.countTripInOneDay(driver._id, filters, days, filters.from)
      return countTrip
    }
    // all the time
    if (!filters.from && !filters.to) {
      const trip: any = await Trip.find({ driver: driver._id }).sort({
        createdAt: 1
      })
      if (!trip.length) {
        const countTripsAllTheTime: any = []
        const obj = {
          num: 0,
          date: new Date(Date.now())
        }
        countTripsAllTheTime.push(obj)
        return countTripsAllTheTime
      }
      const from = trip[0].createdAt
      const to = new Date(Date.now())
      const days = this.differenceDays(to, from)
      const countTrip = this.countTripInOneDay(driver._id, filters, days, from)
      return countTrip
    }
  }

  async getDriverStatisticsListByAdmin(driverId, filters: any = {}) {
    const driver: any = await service.findById(driverId)
    if (!driver) {
      throw new ApolloError('driver not found', '404')
    }

    if ('to' in filters && 'from' in filters) {
      filters.createdAt = {
        $gte: moment(new Date(filters.from))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.to))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.from
      delete filters.to
    }

    const successfulSubmissions = await tripService.count({
      ...filters,
      driver: driver._id,
      state: 'DESTINATION'
    })
    const unSuccessfulSubmissions = await tripService.count({
      ...filters,
      driver: driver._id,
      state: 'PASSENGER_CANCELED'
    })
    const numAllTrips = await tripService.count({
      ...filters,
      driver: driver._id
    })
    const cashDaySales = await transactionService.count({
      ...filters,
      driver: driver._id,
      transactionMethod: 'CASH'
    })
    const cardDaySales = await transactionService.count({
      ...filters,
      driver: driver._id,
      transactionMethod: 'ONLINE'
    })

    const tripfound: any = await tripService.find({ ...filters, driver: driver._id })

    let driverTotalPrice = 0
    let companyCommission = 0
    const tripIDs: any = []
    for (let i = 0; i < tripfound.length; i++) {
      driverTotalPrice += tripfound[i].driverTotalPrice
      tripIDs.push(tripfound[i]._id)
    }
    for (let i = 0; i < tripIDs.length; i++) {
      const tripOrder: any = await tripOrderService.findOne({ trip: tripIDs[i] })

      if (tripOrder && tripOrder.commission) {
        companyCommission += tripOrder.commission
      }
    }

    return {
      successfulSubmissions,
      unSuccessfulSubmissions,
      numAllTrips,
      cashDaySales,
      cardDaySales,
      driverTotalPrice,
      companyCommission
    }
  }

  // eslint-disable-next-line consistent-return
  async getDriverStatisticsListCountTripsByAdmin(driverId, filters: any = {}) {
    const driver: any = await service.findById(driverId)
    if (!driver) {
      throw new ApolloError('driver not found', '404')
    }
    // the last 3 days && the last 7 days && the last 30 days && TODAY
    if ('from' in filters && 'to' in filters) {
      const days = this.differenceDays(filters.to, filters.from)
      // TODAY
      if (days === 0 && 'hour' in filters) {
        const countTripInHours = this.countTripInHours(driver._id, filters)
        return countTripInHours
      }
      // the last 3 days && the last 7 days && the last 30 days

      const countTrip: any = this.countTripInOneDay(driver._id, filters, days, filters.from)
      return countTrip
    }
    // all the time
    if (!filters.from && !filters.to) {
      const trip: any = await Trip.find({ driver: driver._id }).sort({
        createdAt: 1
      })
      if (!trip.length) {
        const countTripsAllTheTime: any = []
        const obj = {
          num: 0,
          date: new Date(Date.now())
        }
        countTripsAllTheTime.push(obj)
        return countTripsAllTheTime
      }
      const from = trip[0].createdAt
      const to = new Date(Date.now())
      const days = this.differenceDays(to, from)
      const countTrip = this.countTripInOneDay(driver._id, filters, days, from)
      return countTrip
    }
  }

  async getDriversByShopAdmin(user, filters: any = {}, sort) {
    let filtersInput = {}
    if ('fullName' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.fullName = new RegExp(filters.fullName, 'gi')
    }
    if ('phoneNumber' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.phoneNumber = new RegExp(filters.phoneNumber, 'gi')
    }
    if ('email' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.email = new RegExp(filters.email, 'gi')
    }
    if (filters.IncompleteInformationDrivers != null) {
      if (filters.IncompleteInformationDrivers) {
        filtersInput = {
          $or: [
            { gender: null },
            { address: null },
            { profileImageUrl: null },
            { birthDate: null },
            { drivingLicence: null }
          ]
        }
      } else {
        filtersInput = {
          $and: [
            { gender: { $ne: null } },
            { address: { $ne: null } },
            { profileImageUrl: { $ne: null } },
            { birthDate: { $ne: null } },
            { drivingLicence: { $ne: null } }
          ]
        }
      }
    }
    filters = _.omit(filters, 'IncompleteInformationDrivers')
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

    if ('averageRate' in filters && 'averageRateFrom' in filters) {
      filters.averageRate = {
        $gte: filters.averageRateFrom,
        $lte: filters.averageRate
      }
      delete filters.averageRateFrom
    } else if ('averageRateFrom' in filters) {
      filters.averageRate = {
        $gte: filters.averageRateFrom
      }
      delete filters.averageRateFrom
    } else if ('averageRate' in filters) {
      filters.averageRate = {
        $lte: filters.averageRate
      }
    }

    if ('updatedAt' in filters) {
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
    if ('shop' in filters) {
      filters['shop'] = Types.ObjectId(filters.shop)
    }
    return service.find(
      { ...filters, ...filtersInput, isDeleted: false, shop: Types.ObjectId(user.shop) },
      sort
    )
  }

  async createDriverVerificationRequestByAdmin(
    argInputs: any,
    driverId: Types.ObjectId,
    language: any
  ) {
    let error: any = {}
    const inputs = argInputs

    const { address, drivingLicence, gender, birthDate, profileImageUrl }: any = inputs
    if (!address) {
      error = await errorService.findOneFromView({ title: 'address is required' }, language)
      throw new ApolloError(error.text, '400')
    }

    if (!address.full || !address.zipCode) {
      error = await errorService.findOneFromView({ title: 'invalid address input' }, language)
      throw new ApolloError(error.text, '400')
    }
    if (!drivingLicence) {
      error = await errorService.findOneFromView({ title: 'driving licence is required' }, language)
      throw new ApolloError(error.text, '400')
    }
    if (!drivingLicence.licenceId || !drivingLicence.photoUrl || !drivingLicence.expireDate) {
      error = await errorService.findOneFromView(
        { title: 'invalid driving licence input' },
        language
      )
      throw new ApolloError('invalid driving licence input', '400')
    }

    await updateUserInformationValidation.validateAsync({
      profileImageUrl,
      birthDate
    })
    const verifyRequest = {
      status: 'APPROVED',
      submitDate: moment(new Date()).utc(),
      verificationDetails: inputs
    }

    const driver: any = await service.findOneAndUpdate(driverId, {
      $set: {
        isVerified: true,
        address,
        drivingLicence,
        profileImageUrl,
        gender,
        birthDate
      },
      $push: { verificationRequests: verifyRequest }
    })
    if (!driver) {
      error = await errorService.findOneFromView({ title: 'driver does not exists' }, language)
      throw new ApolloError(error.text, '400')
    }

    sendEmail(
      driver.email,
      `Dear ${driver.fullName} Congratulations!`,
      'Your account has been verified. Now you can add car to your garage.'
    )

    sendSMS(
      driver.phoneNumber,
      `Dear ${driver.fullName} Congratulations! , your account has been verified . now you can add car to your garage`
    )

    createNotificationAndSendToDriver(
      driver._id,
      'IMPORTANT',
      `Dear ${driver.fullName} Congratulations!`,
      'Your account has been verified. Now you can add car to your garage.'
    )

    if (!driver.emailVerified) {
      await this.sendVerificationEmail(driver)
    }

    return driver
  }

  async getDriversCountByAdmin(filters: any = {}) {
    let filtersInput = {}
    if ('fullName' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.fullName = new RegExp(filters.fullName, 'gi')
    }
    if ('phoneNumber' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.phoneNumber = new RegExp(filters.phoneNumber, 'gi')
    }
    if ('email' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.email = new RegExp(filters.email, 'gi')
    }
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
    if ('updatedAt' in filters) {
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
    if ('shop' in filters) {
      filters.shop = {
        $eq: filters.shop
      }
      delete filters.shop
    }
    if (filters.IncompleteInformationDrivers != null) {
      if (filters.IncompleteInformationDrivers) {
        filtersInput = {
          $or: [
            { gender: null },
            { address: null },
            { profileImageUrl: null },
            { birthDate: null },
            { drivingLicence: null }
          ]
        }
      } else {
        filtersInput = {
          $and: [
            { gender: { $ne: null } },
            { address: { $ne: null } },
            { profileImageUrl: { $ne: null } },
            { birthDate: { $ne: null } },
            { drivingLicence: { $ne: null } }
          ]
        }
      }
    }
    filters = _.omit(filters, 'IncompleteInformationDrivers')
    return service.count({ ...filters, ...filtersInput, isDeleted: false })
  }

  async getDriversCountByShopAdmin(filters: any = {}) {
    let filtersInput = {}
    if ('fullName' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.fullName = new RegExp(filters.fullName, 'gi')
    }
    if ('phoneNumber' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.phoneNumber = new RegExp(filters.phoneNumber, 'gi')
    }
    if ('email' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.email = new RegExp(filters.email, 'gi')
    }
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
    if ('updatedAt' in filters) {
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
    if ('shop' in filters) {
      filters.shop = {
        $eq: filters.shop
      }
      delete filters.shop
    }
    if (filters.IncompleteInformationDrivers != null) {
      if (filters.IncompleteInformationDrivers) {
        filtersInput = {
          $or: [
            { gender: null },
            { address: null },
            { profileImageUrl: null },
            { birthDate: null },
            { drivingLicence: null }
          ]
        }
      } else {
        filtersInput = {
          $and: [
            { gender: { $ne: null } },
            { address: { $ne: null } },
            { profileImageUrl: { $ne: null } },
            { birthDate: { $ne: null } },
            { drivingLicence: { $ne: null } }
          ]
        }
      }
    }
    filters = _.omit(filters, 'IncompleteInformationDrivers')
    return service.count({ ...filters, ...filtersInput, isDeleted: false })
  }
})(service)
function language(arg0: { title: string }, language: any, arg2: string) {
  throw new Error('Function not implemented.')
}
