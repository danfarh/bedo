/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-undef */
import { Types } from 'mongoose'
import { ApolloError, UserInputError } from 'apollo-server-express'
import bcrypt from 'bcryptjs'
import moment from 'moment'
import jwt from 'jsonwebtoken'
import * as _ from 'lodash'
import service from './service'
import sendEmail from '../../utils/email'
import sendHtmlEmail from '../../utils/htmlContentEmail'
import sendSMS from '../../utils/sms'
import authService from '../auth/service'
import userTokenService from '../userToken/service'
import roleService from '../role/service'
import shopService from '../shop/service'
import orderService from '../order/service'
import controllerBase from '../../utils/controllerBase'
import { RedisGet, RedisSetExpireDate, RedisDelete } from '../../utils/redis'
import {
  phoneNumberValidation,
  signUpValidation,
  emailExistsValidation,
  changeShopAdminPasswordValidation,
  shopAdminPasswordValidation
} from '../../utils/validation/validation'
import {
  PHONE_VERIFICATION_TRIED_COUNT,
  LOGIN_NUMBER_OF_RETIRES,
  PHONE_VERIFICATION_EXPIRE_IN_SECONDS,
  HASH_SALT,
  JWT_SECRET,
  NUMBER_OF_RETIRES_EXPIRE_TIME
} from '../../config'
import generateToken from '../../utils/token'
import driverOrPassengerFilters from '../../utils/driverOrPassengerFilters'

export default new (class Controller extends controllerBase {
  async adminLogin(loginData: Object) {
    const { emailOrPhoneNumber, password, fcm }: any = loginData
    if (!emailOrPhoneNumber || !password) {
      throw new ApolloError('provide all inputs', '400')
    }
    const redisKey = `${emailOrPhoneNumber}-adminLogin`
    let admin: any

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
      throw new ApolloError(
        'maximum number of tries exceeded please try again in 10 minutes',
        '403'
      )
    }
    if (emailOrPhoneNumber.includes('@')) {
      admin = await service.findByEmail(String(emailOrPhoneNumber).toLocaleLowerCase())
    } else {
      admin = await service.findOneByPhoneNumber(emailOrPhoneNumber)
    }
    if (admin) {
      const { passwordHash, _id, type, shop, verificationState, email, state } = admin
      if (state === 'SUSPENDED')
        throw new ApolloError('You have been suspended by system administrator.', '403')
      const match = await bcrypt.compare(String(password), passwordHash)
      if (match) {
        if (type === 'SUPER-ADMIN') {
          sendEmail(
            email,
            'admin login notification',
            `we noticed a login in to your account at ${moment()
              .utc()
              .tz('America/Toronto')
              .format(
                'D MMM h:m A'
              )} , was that you ? if yes ignore , otherwise change your password`
          )
          const token = generateToken(_id, 'SUPER_ADMIN', '')
          return {
            ...admin._doc,
            token
          }
        }
        if (verificationState !== 'VERIFIED') {
          throw new ApolloError('you are not verified', '400')
        }
        const token = generateToken(_id, 'SHOP_ADMIN', fcm, shop)
        return {
          ...admin._doc,
          token
        }
      }
      if (!numberOfRetires) {
        await RedisSetExpireDate(redisKey, 1, NUMBER_OF_RETIRES_EXPIRE_TIME)
      } else {
        const newNumberOfRetries = Number(numberOfRetires) + 1
        await RedisSetExpireDate(redisKey, newNumberOfRetries, NUMBER_OF_RETIRES_EXPIRE_TIME)
      }
      throw new ApolloError('incorrect information', '400')
    }
    throw new ApolloError('admin not found', '404')
  }

  async getShopAdminPhoneVerificationCode(phoneNumber: string) {
    await phoneNumberValidation.validateAsync({
      phoneNumber
    })
    const admin = await service.findOneByPhoneNumber(phoneNumber)
    if (!admin) {
      const phoneVerificationCode = await authService.createVerificationCode(phoneNumber)
      await sendSMS(phoneNumber, `Your Verification Code Is ${phoneVerificationCode}`)
      return {
        phoneVerificationCode,
        phoneVerificationCodeExpireTime: PHONE_VERIFICATION_EXPIRE_IN_SECONDS
      }
    }

    throw new ApolloError('admin with this phone number exists')
  }

  async checkShopAdminPhoneVerificationCode(input: object) {
    const { phoneNumber, phoneVerificationCode }: any = input
    await phoneNumberValidation.validateAsync({
      phoneNumber
    })
    const codeExists = await authService.checkVerificationCodeExists(phoneNumber)
    if (!codeExists) {
      throw new ApolloError(
        'Your verification code has expired please get a new verification code ',
        '401'
      )
    }
    const triedCount = await authService.checkTriedCount(phoneNumber, 'verificationCode')
    const verificationCode = await authService.getVerificationCode(phoneNumber)
    if (triedCount < PHONE_VERIFICATION_TRIED_COUNT) {
      await authService.updateTriedCount(
        phoneNumber,
        verificationCode,
        triedCount,
        'verificationCode'
      )
    } else {
      await authService.removeFromRedis(phoneNumber, 'verificationCode')
      throw new ApolloError('maximum try count exceeded please try again later', '403')
    }
    if (String(phoneVerificationCode) === String(verificationCode)) {
      const phoneNumberExists = await service.findOneByPhoneNumber(phoneNumber)
      if (phoneNumberExists) {
        throw new ApolloError('admin already exists', '403')
      }
      await authService.removeFromRedis(phoneNumber, 'verificationCode')
      const phoneSignUpCode = await authService.createSignUpCode(phoneNumber)
      return {
        phoneSignUpCode
      }
    }
    throw new UserInputError('your verification code is incorrect')
  }

  async shopAdminSignUp(input: object) {
    const { phoneNumber, password, email, fullName, phoneSignUpCode }: any = input
    await signUpValidation.validateAsync({
      phoneNumber,
      password,
      email,
      fullName
    })
    const codeExists = await authService.checkSignUpCodeExists(phoneNumber)
    if (!codeExists) {
      throw new ApolloError('you took too long please try again ', '403')
    }

    const triedCount = await authService.checkTriedCount(phoneNumber, 'signUpCode')
    const signUpCode = await authService.getSignUpCode(phoneNumber)
    if (triedCount < PHONE_VERIFICATION_TRIED_COUNT) {
      await authService.updateTriedCount(phoneNumber, signUpCode, triedCount, 'signUpCode')
    } else {
      await authService.removeFromRedis(phoneNumber, 'signUpCode')
      throw new ApolloError('maximum try count exceeded please try again later', '403')
    }
    if (String(phoneSignUpCode) === String(signUpCode)) {
      const phoneNumberExists = await service.findOneByPhoneNumber(phoneNumber)
      const emailExists = await service.findByEmail(email)
      if (phoneNumberExists || emailExists) {
        throw new ApolloError('admin already exists', '403')
      }
      await authService.removeFromRedis(phoneNumber, 'signUpCode')
      const passwordHash = await bcrypt.hash(String(password), HASH_SALT)
      return service.create({
        phoneNumber,
        passwordHash,
        email,
        fullName,
        verificationState: 'VERIFIED',
        type: 'SHOP-ADMIN',
        phoneNumberVerified: true
      })
    }

    throw new UserInputError('your signUp code is incorrect')
  }

  async adminCheckEmail(email: String) {
    await emailExistsValidation.validateAsync({ email })
    const admin = await service.findByEmail(email)
    if (admin) {
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

  async updateShopAdminVerificationStateByAdmin(
    adminId: Types.ObjectId,
    verificationState: String
  ) {
    return service.findOneAndUpdate({ _id: adminId, type: 'SHOP-ADMIN' }, { verificationState })
  }

  async getWaitingVerificationStateShopAdminsByAdmin(filters: any = {}, pagination, sort) {
    if ('fullName' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.fullName = new RegExp(`.*${filters.fullName}.*`, 'i')
    }
    return service.find(
      { type: 'SHOP-ADMIN', verificationState: 'WAITING', ...filters },
      pagination,
      sort
    )
  }

  async getWaitingVerificationStateShopAdminsByAdminCount(filters: any = {}) {
    if ('fullName' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.fullName = new RegExp(`.*${filters.fullName}.*`, 'i')
    }
    return this.service.count({ type: 'SHOP-ADMIN', verificationState: 'WAITING', ...filters })
  }

  async updateAdminRoles(adminId: Types.ObjectId, roles: Array<Types.ObjectId>) {
    const updatedAdmin = await service.findOneAndUpdate({ _id: adminId }, { roles })
    return updatedAdmin
  }

  async createAdminByAdmin({ fullName, phoneNumber, password, email, state, shop, roles }) {
    await signUpValidation.validateAsync({
      fullName,
      password,
      email,
      phoneNumber
    })
    const admin = await this.service.findOne({ $or: [{ email }, { phoneNumber }] })
    if (admin) {
      throw new ApolloError('admin with this email or phone number already exists!', '400')
    }
    if (!roles.length)
      throw new ApolloError('You must select at least one role for your admin.', '400')
    const roleNameSet: string[] = await Promise.all(
      roles.map(async roleId => {
        const role: any = await roleService.findById(roleId)
        return role.name
      })
    )
    if (
      _.isEqual(['SHOP-ADMIN', 'SUPER-ADMIN'].sort(), roleNameSet.sort()) ||
      _.isEqual(['SHOP-ADMIN', 'SYSTEM-ADMINISTRATOR'].sort(), roleNameSet.sort()) ||
      _.isEqual(['SHOP-ADMIN', 'SYSTEM-ADMINISTRATOR', 'SUPER-ADMIN'].sort(), roleNameSet.sort())
    )
      throw new ApolloError('You can’t use shop-admin role with other roles.', '400')

    const type = roleNameSet.every(role => ['SUPER-ADMIN', 'SYSTEM-ADMINISTRATOR'].includes(role))
      ? 'SUPER-ADMIN'
      : 'SHOP-ADMIN'
    return this.service.create({
      fullName,
      phoneNumber,
      email,
      type,
      shop,
      roles,
      passwordHash: await bcrypt.hash(password, HASH_SALT),
      phoneNumberVerified: true,
      state: state || 'ACTIVE',
      verificationState: 'VERIFIED'
    })
  }

  async updateAdminByAdmin(data: any, adminId: any) {
    const { email, phoneNumber, passwordHash }: any = data
    if (email) {
      await emailExistsValidation.validateAsync({
        email
      })
      const findedAdmin = await service.findByEmail(email)
      if (findedAdmin && findedAdmin._id.toString() !== adminId.toString()) {
        throw new ApolloError('this email is already taken.', '400')
      }
    }
    if (phoneNumber) {
      const findedAdmin = await service.findOneByPhoneNumber(phoneNumber)
      if (findedAdmin && findedAdmin._id.toString() !== adminId.toString()) {
        throw new ApolloError('this phone number is already taken.', '400')
      }
    }
    const admin = await this.service.findById(adminId)
    if (!admin) {
      throw new ApolloError('admin does not exist.', '400')
    }
    if (passwordHash) {
      await shopAdminPasswordValidation.validateAsync({
        passwordHash
      })
      data.passwordHash = await bcrypt.hash(String(passwordHash), HASH_SALT)
    }
    return this.service.findOneAndUpdate(adminId, data)
  }

  async deleteAdmin(idSet: Types.ObjectId[], user) {
    if (user.roles !== 'SUPER_ADMIN')
      throw new ApolloError('You do not have permission to delete admin.', '400')
    for (let index = 0; index < idSet.length; index++) {
      const adminId = idSet[index]
      const admin = await service.findById(adminId)
      if (!admin) throw new ApolloError('Amin does not exist.', '400')
      if (await this.isSystemAdministrator(admin.roles))
        throw new ApolloError('You can not delete main admin.', '400')
      if (admin.type === 'SHOP-ADMIN') {
        const shopSet = await shopService.find({ shopAdmin: admin._id })
        if (shopSet.length) throw new ApolloError('This admin has at least one shop(s).', '400')
      }
    }
    return idSet.map(id => service.findOneAndUpdate(id, { isDeleted: true }))
  }

  async isSystemAdministrator(roleIdSet) {
    for (let i = 0; i < roleIdSet.length; i++) {
      const role: any = await roleService.findById(roleIdSet[i])
      delete role._doc.permissions
      console.log('main admin', role.name === 'SYSTEM-ADMINISTRATOR')
      if (role.name === 'SYSTEM-ADMINISTRATOR') return true
    }
    return false
  }

  async getAdminsByAdmin(filters: any = {}, pagination, sort) {
    filters = await driverOrPassengerFilters(filters)
    if ('fullName' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.fullName = new RegExp(filters.fullName, 'gi')
    }
    if ('email' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.email = new RegExp(filters.email, 'gi')
    }
    if ('phoneNumber' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.phoneNumber = new RegExp(filters.phoneNumber, 'gi')
    }

    if ('createdAt' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.createdAt = {
        $gte: moment(new Date(filters.createdAt))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.createdAt))
          .utc()
          .endOf('date')
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

    return this.service.find(filters, pagination, sort)
  }

  async getAdminsByAdminCount(filters: any = {}) {
    filters = await driverOrPassengerFilters(filters)
    if ('fullName' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.fullName = new RegExp(filters.fullName, 'gi')
    }
    if ('email' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.email = new RegExp(filters.email, 'gi')
    }
    if ('phoneNumber' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.phoneNumber = new RegExp(filters.phoneNumber, 'gi')
    }

    if ('createdAt' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.createdAt = {
        $gte: moment(new Date(filters.createdAt))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.createdAt))
          .utc()
          .endOf('date')
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

    return this.service.count(filters)
  }

  async suspendShopByAdmin(idSet: any[]) {
    const shopSet: any[] = []
    for (let index = 0; index < idSet.length; index++) {
      const shopId = idSet[index]
      const shop = await shopService.findById(shopId)
      const activeOrder = await orderService.find({
        $or: [
          { shop, status: 'PENDING' },
          { shop, status: 'PAID' },
          { shop, status: 'SHIPPING' },
          { shop, status: 'DELIVERY_NOT_ACCEPTED' }
        ]
      })
      if (activeOrder.length) throw new ApolloError('Some of shops have an active order', '400')
      shopSet.push(shop)
    }
    return shopSet.map(shop =>
      shopService.findOneAndUpdate(shop._id, {
        state: shop.state === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE',
        active: !shop.active
      })
    )
  }

  async suspendAdminByAdmin(idSet: any[]) {
    const adminSet: any = []
    for (let index = 0; index < idSet.length; index++) {
      const adminId = idSet[index]
      const admin = await service.findById(adminId)
      if (!admin) throw new ApolloError('Admin does not exist.', '400')
      if (admin.isDeleted) throw new ApolloError('Admin has been deleted before.', '400')
      if (admin.state === 'ACTIVE') {
        for (let i = 0; i < admin.roles.length; i++) {
          const role = admin.roles[i]
          const adminRole: any = await roleService.findById(role)
          if (adminRole && adminRole.name === 'SYSTEM-ADMINISTRATOR')
            throw new ApolloError("You can't suspend SYSTEM-ADMINISTRATOR.", '400')
        }
      }
      adminSet.push(admin)
    }
    return adminSet.map(admin =>
      service.findOneAndUpdate(admin._id, {
        state: admin.state === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
      })
    )
  }

  async generateNewTokenByAdmin(refreshToken: string): Promise<Object> {
    let decoded
    try {
      decoded = jwt.verify(refreshToken, JWT_SECRET)
    } catch (err) {
      throw new ApolloError('invalid token', '401')
    }
    if (decoded.roles !== 'SUPER_ADMIN' && decoded.roles !== 'SHOP_ADMIN') {
      throw new ApolloError(' invalid token', '401')
    }
    const admin = await service.findById(decoded.userId)
    if (admin) {
      const { _id, type, shop } = admin
      const refreshTokenData = await userTokenService.findOne({ admin: _id })
      if (!refreshTokenData) {
        throw new ApolloError('admin not found', '404')
      }
      if (type === 'SUPER-ADMIN') {
        if (refreshTokenData.refreshTokenKey.includes(decoded.tokenKey)) {
          const token = generateToken(_id, 'SUPER_ADMIN', '')
          return {
            ...admin.toObject(),
            token
          }
        }
        throw new ApolloError('invalid token', '401')
      } else if (type === 'SHOP-ADMIN') {
        if (refreshTokenData.refreshTokenKey.includes(decoded.tokenKey)) {
          const token = generateToken(_id, 'SHOP_ADMIN', '', shop)
          return {
            ...admin.toObject(),
            token
          }
        }
        throw new ApolloError('invalid token', '401')
      }
      throw new ApolloError('invalid token', '401')
    }
    throw new ApolloError('admin not found', '404')
  }

  async getAdminByAdmin(id: Types.ObjectId) {
    const admin = await service.findById(id)
    if (!admin) {
      throw new ApolloError('admin does not exists', '400')
    }
    return admin
  }

  async getAdminInformation(user: any) {
    const admin = await service.findById(user.userId)
    if (!admin) {
      throw new ApolloError('admin does not exists', '400')
    }
    return admin
  }

  async changeShopAdminPassword(input: any, user: any) {
    const { userId }: any = user
    const { newPassword, currentPassword }: any = input
    await changeShopAdminPasswordValidation.validateAsync({
      password: newPassword
    })
    let admin: any = await service.findById(userId)
    if (admin) {
      const { passwordHash, _id, shop, verificationState } = admin
      const match = await bcrypt.compare(String(currentPassword), passwordHash)
      if (match) {
        if (verificationState !== 'VERIFIED') {
          throw new ApolloError('you are not verified', '400')
        }
        const hashPassword = await bcrypt.hash(String(newPassword), HASH_SALT)
        admin = await service.findOneAndUpdate({ _id: admin }, { passwordHash: hashPassword })
        const token = generateToken(_id, 'SHOP_ADMIN', '', shop)
        return {
          ...admin.toObject(),
          token
        }
      }
      throw new ApolloError('incorrect information', '400')
    }
    throw new ApolloError('admin does not exists', '404')
  }
})(service)
