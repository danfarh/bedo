import { UserInputError, ApolloError } from 'apollo-server-express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'
import userToken from '../userToken/service'
import notificationController from '../notification/controller'
import stripe from '../../utils/payment/gateways/Stripe'
import sendEmail from '../../utils/email'
import sendSMS from '../../utils/sms'
import { RedisGet, RedisSetExpireDate, RedisDelete } from '../../utils/redis'
// import nodemailer from 'nodemailer'
import {
  phoneNumberValidation,
  signUpValidation,
  emailExistsValidation,
  changePasswordByPhoneNumberValidation,
  changePasswordByEmailValidation
} from '../../utils/validation/validation'
import userTokenService from '../userToken/service'
import service from './service'
import {
  PHONE_VERIFICATION_TRIED_COUNT,
  JWT_SECRET,
  LOGIN_NUMBER_OF_RETIRES,
  TOKEN_EXPIRE_TIME,
  PHONE_VERIFICATION_EXPIRE_IN_SECONDS,
  PHONE_FORGOT_PASSWORD_EXPIRE_IN_SECONDS,
  APP_PUBLIC_URL,
  NUMBER_OF_RETIRES_EXPIRE_TIME,
  EMAIL_RECEIPT_IMAGE
} from '../../config'

import userService from '../user/service'
import driverService from '../driver/service'
import adminService from '../admin/service'
import generateToken from '../../utils/token'
import sendHtmlEmail from '../../utils/htmlContentEmail'
import userTokenController from '../userToken/controller'
import errorService from '../errors/service'

export default new (class Controller {
  async sendVerificationEmail({ fullName, email, _id }, driver = false) {
    // create link and send email
    const emailVerificationCode = uuidv4()
    await userTokenController.createEmailVerificationCode(
      emailVerificationCode,
      !driver ? _id : null,
      driver ? _id : null,
      null
    )
    const verifyLink = `${APP_PUBLIC_URL}/api/v1/email/verify/${emailVerificationCode}`
    return sendHtmlEmail(
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
        name: fullName,
        imageURL: EMAIL_RECEIPT_IMAGE
      },
      `your forgot password code is: ${code}`
    )
  }

  async sendTripReceiptEmail({ fullName, email }, receiptData) {
    return sendHtmlEmail(
      email,
      'BEDO Receipt Email',
      'tripReceipt',
      {
        ...receiptData,
        name: fullName,
        imageURL: EMAIL_RECEIPT_IMAGE
      },
      'your receipt is:'
    )
  }

  async sendOrderReceiptEmail({ fullName, email }, receiptData) {
    return sendHtmlEmail(
      email,
      'BEDO Receipt Email',
      'orderReceipt',
      {
        ...receiptData,
        name: fullName
      },
      'your receipt is:'
    )
  }

  async localSignUp(
    phoneNumber: string,
    phoneSignUpCode: string,
    password: string,
    email: string,
    fullName: string,
    fcm: string,
    language: any
  ) {
    let error: any = {}
    let user: any
    await signUpValidation.validateAsync({
      phoneNumber,
      password,
      email,
      fullName
    })
    const codeExists = await service.checkSignUpCodeExists(phoneNumber)
    if (codeExists === null || codeExists === undefined) {
      error = await errorService.findOneFromView(
        { title: 'you took too long please try again.' },
        language
      )
      throw new ApolloError(error.text, '403')
    }

    const triedCount = await service.checkTriedCount(phoneNumber, 'signUpCode')
    const signUpCode = await service.getSignUpCode(phoneNumber)
    if (triedCount < PHONE_VERIFICATION_TRIED_COUNT) {
      await service.updateTriedCount(phoneNumber, signUpCode, triedCount, 'signUpCode')
    } else {
      await service.removeFromRedis(phoneNumber, 'signUpCode')
      error = await errorService.findOneFromView(
        { title: 'maximum try count exceeded please try again later.' },
        language
      )
      throw new ApolloError(error.text, '403')
    }
    if (String(phoneSignUpCode) === String(signUpCode)) {
      const phoneNumberExists = await userService.findOneByPhoneNumber(phoneNumber)
      const emailUserExists = await userService.findByEmail(email)
      if (phoneNumberExists || emailUserExists) {
        error = await errorService.findOneFromView({ title: 'user already exists.' }, language)
        throw new ApolloError(error.text, '403')
      }
      await service.removeFromRedis(phoneNumber, 'signUpCode')
      // Stripe
      const customer = await stripe
        .createCustomer(fullName, 0, email, phoneNumber, { role: 'User' })
        .catch(err => {
          console.log('customer not created.', err)
          throw new ApolloError(err, '400')
        })

      user = await userService.save(phoneNumber, password, email, fullName, false, customer.id)
      const { _id } = user

      // create link and send email
      // await this.sendVerificationEmail(user)

      // notification
      const token = generateToken(_id, 'USER', fcm)
      notificationController.createNotificationByAdmin({
        type: 'GENERAL',
        for: 'USER',
        title: 'Welcome',
        body: 'Welcome to BEDO',
        user: _id
      })

      return {
        ...user._doc,
        token
      }
    }
    error = await errorService.findOneFromView(
      { title: 'your signUp code is incorrect.' },
      language
    )
    throw new UserInputError(error.text)
  }

  async localLogin(loginData: Object, language: any): Promise<any> {
    let error: any = {}
    const { emailOrPhoneNumber, password, fcm }: any = loginData
    const redisKey = `${emailOrPhoneNumber}-login`
    let user: any

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
      user = await userService.findByEmail(String(emailOrPhoneNumber).toLowerCase())
    } else {
      user = await userService.findOneByPhoneNumber(emailOrPhoneNumber)
    }
    if (user) {
      const { passwordHash, _id } = user
      const match = await bcrypt.compare(password, passwordHash)
      if (match) {
        const token = generateToken(_id, 'USER', fcm)
        return {
          ...user._doc,
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
      throw new ApolloError(error.text, '400')
    }
    error = await errorService.findOneFromView({ title: 'user not found' }, language)
    throw new ApolloError(error.text, '404')
  }

  async generateNewToken(refreshToken: string, fcm: string, language: any): Promise<Object> {
    let error: any = {}
    let decoded
    try {
      decoded = jwt.verify(refreshToken, JWT_SECRET)
    } catch (err) {
      error = await errorService.findOneFromView({ title: 'invalid token' }, language)
      throw new ApolloError(error.text, '401')
    }
    if (decoded.roles === 'USER') {
      const user = await userService.findById(decoded.sub)
      if (user) {
        const { _id } = user
        const refreshTokenData = await userTokenService.findOne({ user: _id })
        if (refreshTokenData.refreshTokenKey.includes(decoded.tokenKey)) {
          return generateToken(_id, 'USER', fcm)
        }
        error = await errorService.findOneFromView({ title: 'invalid token' }, language)
        throw new ApolloError(error.text, '401')
      }
      error = await errorService.findOneFromView({ title: 'user not found' }, language)
      throw new ApolloError(error.text, '404')
    } else if (decoded.roles === 'DRIVER') {
      const driver = await driverService.findById(decoded.sub)
      if (driver) {
        const { _id } = driver
        const refreshTokenData = await userTokenService.findOne({ driver: _id })
        if (refreshTokenData.refreshTokenKey.includes(decoded.tokenKey)) {
          return generateToken(_id, 'DRIVER', fcm)
        }
        error = await errorService.findOneFromView({ title: 'invalid token' }, language)
        throw new ApolloError(error.text, '401')
      }
      error = await errorService.findOneFromView({ title: 'driver not found' }, language)
      throw new ApolloError(error.text, '404')
    }
    error = await errorService.findOneFromView({ title: 'undefind role' }, language)
    throw new ApolloError(error.text, '404')
  }

  async getUserPhoneVerificationCode(phoneNumber: string, language: any) {
    await phoneNumberValidation.validateAsync({
      phoneNumber
    })
    const user = await userService.findOneByPhoneNumber(phoneNumber)
    if (!user) {
      const phoneVerificationCode = await service.createVerificationCode(phoneNumber)
      sendSMS(phoneNumber, `Your Verification Code Is ${phoneVerificationCode} `)
      return {
        phoneVerificationCode,
        phoneVerificationCodeExpireTime: PHONE_VERIFICATION_EXPIRE_IN_SECONDS
      }
    }
    const error = await errorService.findOneFromView(
      { title: 'user with this phone number exists' },
      language
    )
    throw new ApolloError(error.text)
  }

  async userCheckEmail(email: String) {
    await emailExistsValidation.validateAsync({ email })
    const user = await userService.findByEmail(email)
    if (user) {
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

  async getUserForgotPasswordCode(phoneNumber: string, language: any) {
    let error: any = {}
    await phoneNumberValidation.validateAsync({
      phoneNumber
    })
    const user = await userService.findOneByPhoneNumber(phoneNumber)
    if (!user) {
      error = await errorService.findOneFromView(
        { title: 'user with this phone number  does not exists' },
        language
      )
      throw new ApolloError(error.text, '404')
    }
    const forgotPasswordCode = await service.createForgotPasswordCode(phoneNumber)
    sendSMS(phoneNumber, `Your Forgot Password Code Is ${forgotPasswordCode} `)
    return {
      phoneForgotPasswordCodeExpireTime: PHONE_FORGOT_PASSWORD_EXPIRE_IN_SECONDS
    }
  }

  async checkUserForgotPasswordCode(
    phoneNumber: String,
    phoneForgotPasswordCode: String,
    language: any
  ) {
    let error: any = {}
    await phoneNumberValidation.validateAsync({
      phoneNumber
    })
    const forgotPasswordCodeExists = await service.checkForgotPasswordCodeExists(phoneNumber)
    if (forgotPasswordCodeExists === null || forgotPasswordCodeExists === undefined) {
      error = await errorService.findOneFromView(
        { title: 'Your forgot password code has expired please get a new forgot password code ' },
        language
      )
      throw new ApolloError(error.text, '404')
    }
    const triedCount = await service.checkTriedCount(phoneNumber, 'forgotPasswordCode')
    const forgotPasswordCode = await service.getForgotPasswordCode(phoneNumber)
    if (triedCount < PHONE_VERIFICATION_TRIED_COUNT) {
      await service.updateTriedCount(
        phoneNumber,
        forgotPasswordCode,
        triedCount,
        'forgotPasswordCode'
      )
    } else {
      await service.removeFromRedis(phoneNumber, 'forgotPasswordCode')
      error = await errorService.findOneFromView(
        { title: 'maximum try count exceeded please try again later' },
        language
      )
      throw new ApolloError(error.text, '403')
    }
    if (String(phoneForgotPasswordCode) === String(forgotPasswordCode)) {
      const phoneNumberExists = await userService.findOneByPhoneNumber(phoneNumber)
      if (!phoneNumberExists) {
        error = await errorService.findOneFromView({ title: 'user does not exists' }, language)
        throw new ApolloError(error.text, '403')
      }
      const changePasswordCode = await service.createChangePasswordCode(phoneNumber)
      await service.removeFromRedis(phoneNumber, 'forgotPasswordCode')
      return {
        changePasswordCode
      }
    }
    error = await errorService.findOneFromView(
      { title: 'your forgot password code is incorrect' },
      language
    )
    throw new UserInputError(error.text)
  }

  async changeUserPassword(
    emailOrPhoneNumber: String,
    password: String,
    phoneChangePasswordCode: String,
    language: any
  ) {
    let error: any = {}
    const msg = await errorService.findOneFromView(
      { title: 'Password changed successfully' },
      language
    )
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
    const changePasswordCodeExists = await service.checkChangePasswordCodeExists(emailOrPhoneNumber)
    if (changePasswordCodeExists === null || changePasswordCodeExists === undefined) {
      error = await errorService.findOneFromView(
        { title: 'you took too long please try again ' },
        language
      )
      throw new ApolloError(error.text, '403')
    }
    const triedCount = await service.checkTriedCount(emailOrPhoneNumber, 'changePasswordCode')
    const changePasswordCode = await service.getChangePasswordCode(emailOrPhoneNumber)
    if (triedCount < PHONE_VERIFICATION_TRIED_COUNT) {
      await service.updateTriedCount(
        emailOrPhoneNumber,
        changePasswordCode,
        triedCount,
        'changePasswordCode'
      )
    } else {
      await service.removeFromRedis(emailOrPhoneNumber, 'changePasswordCode')
      error = await errorService.findOneFromView(
        { title: 'maximum try count exceeded please try again later' },
        language
      )
      throw new ApolloError(error.text, '403')
    }
    if (String(phoneChangePasswordCode) === String(changePasswordCode)) {
      await service.removeFromRedis(emailOrPhoneNumber, 'changePasswordCode')
      if (emailOrPhoneNumber.includes('@')) {
        const emailExists = await userService.findByEmail(emailOrPhoneNumber)
        if (!emailExists) {
          error = await errorService.findOneFromView({ title: 'user does not exists' }, language)
          throw new ApolloError(error.text, '404')
        }
        await userService.changePassword(emailOrPhoneNumber, password, 'email')
        return {
          message: msg.text
        }
      }
      const phoneNumberExists = await userService.findOneByPhoneNumber(emailOrPhoneNumber)
      if (!phoneNumberExists) {
        error = await errorService.findOneFromView({ title: 'user does not exists' }, language)
        throw new ApolloError(error.text, '404')
      }
      await userService.changePassword(emailOrPhoneNumber, password, 'phoneNumber')
      return {
        message: msg.text
      }
    }
    error = await errorService.findOneFromView(
      { title: 'your change password code is incorrect' },
      language
    )
    throw new UserInputError(error.text)
  }

  async getUserForgotPasswordEmailCode(email: string) {
    let user: any
    await emailExistsValidation.validateAsync({ email })
    user = await userService.findByEmail(email)
    if (!user) {
      throw new ApolloError('user with this email does not exist', '404')
    }
    if (!user.emailVerified) {
      throw new ApolloError('please first verify your email', '403')
    }
    const forgotPasswordCode = await service.createForgotPasswordCode(email)
    await this.sendForgotPasswordEmail(user, forgotPasswordCode)
    return {
      forgotPasswordCode,
      phoneForgotPasswordCodeExpireTime: PHONE_FORGOT_PASSWORD_EXPIRE_IN_SECONDS
    }
  }

  async getUserEmailVerificationCode(email: string) {
    await emailExistsValidation.validateAsync({ email })
    let user: any
    let hasBeenAlreadyVerified = false
    user = await userService.findByEmail(email)
    if (!user) {
      throw new ApolloError('user with this email does not exist', '404')
    }
    const { emailVerified } = user
    if (emailVerified) {
      hasBeenAlreadyVerified = true
    }

    const emailVerificationCode = await userTokenService.createEmailVerificationCode(user._id)

    // sendEmail(email, 'Verify Email', `Your BEDO Email Verification Code Is ${email}`)
    return {
      message: `Email sent to ${email}.`,
      email,
      emailVerificationCode,
      hasBeenAlreadyVerified
    }
  }

  async checkUserEmailVerificationCode(email: String, EmailVerificationCodeFromFront: String) {
    await emailExistsValidation.validateAsync({ email })
    let hasBeenAlreadyVerified = false
    const user: any = await userService.findByEmail(email)
    if (user.emailVerified) {
      hasBeenAlreadyVerified = true
      return { hasBeenAlreadyVerified }
    }
    const { _id } = user
    const userToken: any = await userTokenService.findByUserId(_id)
    const { emailVerificationCode } = userToken
    if (String(EmailVerificationCodeFromFront) === String(emailVerificationCode)) {
      await userTokenService.removeVerificationCode(_id)
      await userService.verifyEmail(email)
      return {
        message: 'Your Email has been verified ',
        email,
        hasBeenAlreadyVerified
      }
    }
    throw new UserInputError('your email verification code is incorrect')
  }

  async checkUserEmailForgotPasswordCode(email: String, phoneForgotPasswordCode: String) {
    await emailExistsValidation.validateAsync({ email })
    const forgotPasswordCodeExists = await service.checkForgotPasswordCodeExists(email)
    if (forgotPasswordCodeExists === null || forgotPasswordCodeExists === undefined) {
      throw new ApolloError(
        'Your forgot password code has expired please get a new forgot password code ',
        '403'
      )
    }
    const triedCount = await service.checkTriedCount(email, 'forgotPasswordCode')
    const forgotPasswordCode = await service.getForgotPasswordCode(email)
    if (triedCount < PHONE_VERIFICATION_TRIED_COUNT) {
      await service.updateTriedCount(email, forgotPasswordCode, triedCount, 'forgotPasswordCode')
    } else {
      await service.removeFromRedis(email, 'forgotPasswordCode')
      throw new ApolloError('maximum try count exceeded please try again later', '403')
    }
    if (String(phoneForgotPasswordCode) === String(forgotPasswordCode)) {
      const emailExists = await userService.findByEmail(email)
      if (!emailExists) {
        throw new ApolloError('user does not exist', '404')
      }
      const changePasswordCode = await service.createChangePasswordCode(email)
      await service.removeFromRedis(email, 'forgotPasswordCode')

      return {
        changePasswordCode
      }
    }
    throw new UserInputError('your forgot password code is incorrect')
  }

  async checkUserVerificationCode(
    phoneNumber: String,
    phoneVerificationCode: String,
    language: any
  ) {
    let error: any = {}
    await phoneNumberValidation.validateAsync({
      phoneNumber
    })
    const codeExists = await service.checkVerificationCodeExists(phoneNumber)
    if (codeExists === null || codeExists === undefined) {
      error = await errorService.findOneFromView(
        { title: 'Your verification code has expired please get a new verification code ' },
        language
      )
      throw new ApolloError(error.text, '403')
    }
    const triedCount = await service.checkTriedCount(phoneNumber, 'verificationCode')
    const verificationCode = await service.getVerificationCode(phoneNumber)
    if (triedCount < PHONE_VERIFICATION_TRIED_COUNT) {
      await service.updateTriedCount(phoneNumber, verificationCode, triedCount, 'verificationCode')
    } else {
      await service.removeFromRedis(phoneNumber, 'verificationCode')
      error = await errorService.findOneFromView(
        { title: 'maximum try count exceeded please try again later' },
        language
      )
      throw new ApolloError(error.text, '403')
    }
    if (String(phoneVerificationCode) === String(verificationCode)) {
      const phoneNumberExists = await userService.findOneByPhoneNumber(phoneNumber)
      if (phoneNumberExists) {
        error = await errorService.findOneFromView({ title: 'user already exists' }, language)
        throw new ApolloError(error.text, '403')
      }
      await service.removeFromRedis(phoneNumber, 'verificationCode')
      const phoneSignUpCode = await service.createSignUpCode(phoneNumber)
      return {
        phoneSignUpCode
      }
    }
    error = await errorService.findOneFromView(
      { title: 'your verification code is incorrect' },
      language
    )
    throw new UserInputError(error.text)
  }

  async userGoogle(accessToken: string, fcm: string) {
    const { data } = await axios({
      url: 'https://www.googleapis.com/oauth2/v2/userinfo',
      method: 'get',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    let user: any
    user = await userService.findByEmail(data.email)
    if (user) {
      const { _id } = user
      const token = generateToken(_id, 'USER', fcm)
      return {
        user: {
          ...user._doc,
          token
        },
        message: 'Login successfully',
        phoneNumber: user.phoneNumber
      }
    }
    return {
      user: null,
      message: 'Please first verify your phone number',
      phoneNumber: data.phoneNumber
    }
  }

  async userFacebook(accessToken: string, fcm: string) {
    const { data } = await axios({
      url: 'https://graph.facebook.com/me',
      method: 'get',
      params: {
        fields: [
          'id',
          'email',
          'first_name',
          'last_name',
          'birthday',
          'gender',
          'name',
          'is_verified'
        ].join(','),
        access_token: accessToken
      }
    })
    let user
    // { id, email, first_name, last_name }
    user = await userService.findByEmail(data.email)
    if (user) {
      const { _id } = user
      const token = generateToken(_id, 'USER', fcm)
      return {
        user: {
          ...user._doc,
          token
        },
        message: 'Login successfully',
        phoneNumber: user.phoneNumber
      }
    }
    return {
      user: null,
      message: 'Please first verify your phone number'
    }
  }

  async userGoogleWithPhoneVerification(
    phoneNumber: string,
    phoneVerificationCode: string,
    accessToken: string,
    fcm: string
  ) {
    let user: any
    await phoneNumberValidation.validateAsync({
      phoneNumber
    })
    const { data } = await axios({
      url: 'https://www.googleapis.com/oauth2/v2/userinfo',
      method: 'get',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    // { id, email, first_name, last_name }
    const codeExists = await service.checkVerificationCodeExists(phoneNumber)
    if (codeExists === null || codeExists === undefined) {
      throw new ApolloError(
        'Your verification code has expired please get a new verification code ',
        '403'
      )
    }

    const triedCount = await service.checkTriedCount(phoneNumber, 'verificationCode')
    const verificationCode = await service.getVerificationCode(phoneNumber)
    if (triedCount < PHONE_VERIFICATION_TRIED_COUNT) {
      await service.updateTriedCount(phoneNumber, verificationCode, triedCount, 'verificationCode')
    } else {
      await service.removeFromRedis(phoneNumber, 'verificationCode')
      throw new ApolloError('maximum try count exceeded please try again later', '403')
    }
    if (String(phoneVerificationCode) === String(verificationCode)) {
      const phoneNumberExists = await userService.findOneByPhoneNumber(phoneNumber)
      if (phoneNumberExists) {
        throw new ApolloError('user already exists', '403')
      }
      await service.removeFromRedis(phoneNumber, 'verificationCode')
      user = await userService.saveWithGoogleOrFacebook(phoneNumber, data.email, data.name)
      const { _id } = user
      const token = generateToken(_id, 'USER', fcm)
      return {
        ...user._doc,
        token
      }
    }
    throw new UserInputError('your verification code is incorrect')
  }

  async userFacebookWithPhoneVerification(
    phoneNumber: string,
    phoneVerificationCode: string,
    accessToken: string,
    fcm: string
  ) {
    let user: any
    await phoneNumberValidation.validateAsync({
      phoneNumber
    })
    const { data } = await axios({
      url: 'https://graph.facebook.com/me',
      method: 'get',
      params: {
        fields: [
          'id',
          'email',
          'first_name',
          'last_name',
          'birthday',
          'gender',
          'name',
          'is_verified'
        ].join(','),
        access_token: accessToken
      }
    })
    // { id, email, first_name, last_name }
    const codeExists = await service.checkVerificationCodeExists(phoneNumber)
    if (codeExists === null || codeExists === undefined) {
      throw new ApolloError(
        'Your verification code has expired please get a new verification code ',
        '403'
      )
    }

    const triedCount = await service.checkTriedCount(phoneNumber, 'verificationCode')
    const verificationCode = await service.getVerificationCode(phoneNumber)
    if (triedCount < PHONE_VERIFICATION_TRIED_COUNT) {
      await service.updateTriedCount(phoneNumber, verificationCode, triedCount, 'verificationCode')
    } else {
      await service.removeFromRedis(phoneNumber, 'verificationCode')
      throw new ApolloError('maximum try count exceeded please try again later', '403')
    }
    if (String(phoneVerificationCode) === String(verificationCode)) {
      const phoneNumberExists = await userService.findOneByPhoneNumber(phoneNumber)
      if (phoneNumberExists) {
        throw new ApolloError('user already exists', '403')
      }
      await service.removeFromRedis(phoneNumber, 'verificationCode')
      user = await userService.saveWithGoogleOrFacebook(phoneNumber, data.email, data.name)
      const { _id } = user
      const token = generateToken(_id, 'USER', fcm)
      return {
        ...user._doc,
        token
      }
    }
    throw new UserInputError('your verification code is incorrect')
  }

  async signOut(user) {
    const { userId, fcm } = user
    await RedisDelete(`${userId}_TOKEN`)
    await userToken.findOneAndUpdate({ user: userId }, { $pull: { FCM: fcm } })
    return {
      message: 'user signed out'
    }
  }

  async userChangeEmail(newEmail: String, userId) {
    const registeredUserSet: any = await userService.findByEmail(newEmail)
    if (registeredUserSet) throw new ApolloError('This email is taken by another user.', '400')
    const updatedUser = await userService.findOneAndUpdate(userId, {
      email: String(newEmail).toLowerCase()
    })
    return updatedUser
  }

  async driverChangeEmail(newEmail: String, driverId) {
    const registeredDriverSet: any = await driverService.findByEmail(newEmail)
    if (registeredDriverSet) throw new ApolloError('This email is taken by another driver.', '400')
    const updatedDriver = await driverService.findOneAndUpdate(driverId, {
      email: String(newEmail).toLowerCase()
    })
    return updatedDriver
  }

  async getNewEmailVerificationCode(user: any) {
    const { userId, roles }: any = user
    let hasBeenAlreadyVerified = false
    if (roles === 'USER') {
      const userExists = await userService.findOne({ _id: userId })
      if (userExists.emailVerified) {
        hasBeenAlreadyVerified = true
        return { hasBeenAlreadyVerified }
      }
      await this.sendVerificationEmail(userExists)
      return {
        message: `Email sent to ${userExists.email}.`,
        hasBeenAlreadyVerified
      }
    }
    if (roles === 'DRIVER') {
      const driverExists = await driverService.findOne({ _id: userId })
      if (driverExists.emailVerified) {
        hasBeenAlreadyVerified = true
        return { hasBeenAlreadyVerified }
      }
      await this.sendVerificationEmail(driverExists, true)
      return {
        message: `Email sent to ${driverExists.email}.`,
        hasBeenAlreadyVerified
      }
    }
    return {
      message: 'Email sent.',
      hasBeenAlreadyVerified
    }
  }

  async getAdminForgotPasswordByEmail(email) {
    await emailExistsValidation.validateAsync({ email })
    const admin: any = await adminService.findByEmail(email)
    if (!admin) {
      throw new ApolloError('admin with this email does not exist', '404')
    }
    const forgotPasswordCode = await service.createForgotPasswordCode(email)
    await this.sendForgotPasswordEmail(admin, forgotPasswordCode)
    return {
      forgotPasswordCode,
      phoneForgotPasswordCodeExpireTime: PHONE_FORGOT_PASSWORD_EXPIRE_IN_SECONDS
    }
  }

  async getAdminForgotPasswordByPhoneNumber(phoneNumber) {
    await phoneNumberValidation.validateAsync({
      phoneNumber
    })
    const admin = await adminService.findOneByPhoneNumber(phoneNumber)
    if (!admin) {
      throw new ApolloError('admin with this phone number  does not exists', '404')
    }
    const forgotPasswordCode = await service.createForgotPasswordCode(phoneNumber)
    sendSMS(phoneNumber, `Your Forgot Password Code Is ${forgotPasswordCode} `)
    return {
      changePasswordCode: null,
      phoneForgotPasswordCodeExpireTime: PHONE_FORGOT_PASSWORD_EXPIRE_IN_SECONDS
    }
  }

  async adminForgotPassword(emailOrPhoneNumber) {
    if (emailOrPhoneNumber.includes('@'))
      return this.getAdminForgotPasswordByEmail(emailOrPhoneNumber)
    return this.getAdminForgotPasswordByPhoneNumber(emailOrPhoneNumber)
  }

  async checkAdminForgotPasswordByEmail(email, phoneForgotPasswordCode) {
    await emailExistsValidation.validateAsync({ email })
    const forgotPasswordCodeExists = await service.checkForgotPasswordCodeExists(email)
    if (forgotPasswordCodeExists === null || forgotPasswordCodeExists === undefined) {
      throw new ApolloError(
        'Your forgot password code has expired please get a new forgot password code ',
        '403'
      )
    }
    const triedCount = await service.checkTriedCount(email, 'forgotPasswordCode')
    const forgotPasswordCode = await service.getForgotPasswordCode(email)
    if (triedCount < PHONE_VERIFICATION_TRIED_COUNT) {
      await service.updateTriedCount(email, forgotPasswordCode, triedCount, 'forgotPasswordCode')
    } else {
      await service.removeFromRedis(email, 'forgotPasswordCode')
      throw new ApolloError('maximum try count exceeded please try again later', '403')
    }
    if (String(phoneForgotPasswordCode) === String(forgotPasswordCode)) {
      const emailExists = await adminService.findByEmail(email)
      if (!emailExists) {
        throw new ApolloError('user does not exist', '404')
      }
      const changePasswordCode = await service.createChangePasswordCode(email)
      await service.removeFromRedis(email, 'forgotPasswordCode')

      return {
        changePasswordCode
      }
    }
    throw new UserInputError('your forgot password code is incorrect')
  }

  async checkAdminForgotPasswordByPhoneNumber(phoneNumber, phoneForgotPasswordCode) {
    await phoneNumberValidation.validateAsync({
      phoneNumber
    })
    console.log(phoneNumber)
    const forgotPasswordCodeExists = await service.checkForgotPasswordCodeExists(phoneNumber)
    if (forgotPasswordCodeExists === null || forgotPasswordCodeExists === undefined) {
      throw new ApolloError(
        'Your forgot password code has expired please get a new forgot password code ',
        '404'
      )
    }
    const triedCount = await service.checkTriedCount(phoneNumber, 'forgotPasswordCode')
    const forgotPasswordCode = await service.getForgotPasswordCode(phoneNumber)
    if (triedCount < PHONE_VERIFICATION_TRIED_COUNT) {
      await service.updateTriedCount(
        phoneNumber,
        forgotPasswordCode,
        triedCount,
        'forgotPasswordCode'
      )
    } else {
      await service.removeFromRedis(phoneNumber, 'forgotPasswordCode')
      throw new ApolloError('maximum try count exceeded please try again later', '403')
    }
    if (String(phoneForgotPasswordCode) === String(forgotPasswordCode)) {
      const phoneNumberExists = await adminService.findOneByPhoneNumber(phoneNumber)
      if (!phoneNumberExists) {
        throw new ApolloError('Admin does not exists.', '403')
      }
      const changePasswordCode = await service.createChangePasswordCode(phoneNumber)
      await service.removeFromRedis(phoneNumber, 'forgotPasswordCode')
      return {
        changePasswordCode
      }
    }
    throw new UserInputError('your forgot password code is incorrect')
  }

  async checkAdminForgotPasswordCode(emailOrPhoneNumber, emailOrPhoneNumberForgotPasswordCode) {
    if (emailOrPhoneNumber.includes('@'))
      return this.checkAdminForgotPasswordByEmail(
        emailOrPhoneNumber,
        emailOrPhoneNumberForgotPasswordCode
      )
    return this.checkAdminForgotPasswordByPhoneNumber(
      emailOrPhoneNumber,
      emailOrPhoneNumberForgotPasswordCode
    )
  }

  async changeAdminPassword(
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
    const changePasswordCodeExists = await service.checkChangePasswordCodeExists(emailOrPhoneNumber)
    if (changePasswordCodeExists === null || changePasswordCodeExists === undefined) {
      throw new ApolloError('you took too long please try again ', '403')
    }
    const triedCount = await service.checkTriedCount(emailOrPhoneNumber, 'changePasswordCode')
    const changePasswordCode = await service.getChangePasswordCode(emailOrPhoneNumber)
    if (triedCount < PHONE_VERIFICATION_TRIED_COUNT) {
      await service.updateTriedCount(
        emailOrPhoneNumber,
        changePasswordCode,
        triedCount,
        'changePasswordCode'
      )
    } else {
      await service.removeFromRedis(emailOrPhoneNumber, 'changePasswordCode')
      throw new ApolloError('maximum try count exceeded please try again later', '403')
    }
    if (String(phoneChangePasswordCode) === String(changePasswordCode)) {
      await service.removeFromRedis(emailOrPhoneNumber, 'changePasswordCode')
      if (emailOrPhoneNumber.includes('@')) {
        const emailExists = await adminService.findByEmail(emailOrPhoneNumber)
        if (!emailExists) {
          throw new ApolloError('user does not exists', '404')
        }
        await adminService.changePassword(emailOrPhoneNumber, password, 'email')
        return {
          message: 'Password changed successfully'
        }
      }
      const phoneNumberExists = await adminService.findOneByPhoneNumber(emailOrPhoneNumber)
      if (!phoneNumberExists) {
        throw new ApolloError('user does not exists', '404')
      }
      await adminService.changePassword(emailOrPhoneNumber, password, 'phoneNumber')
      return {
        message: 'Password changed successfully'
      }
    }

    throw new UserInputError('your change password code is incorrect')
  }
})()
