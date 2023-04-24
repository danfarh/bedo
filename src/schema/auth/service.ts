// database request
import redis from 'redis'
import { RedisGet, RedisSet, RedisSetExpireDate, RedisDelete } from '../../utils/redis'

import {
  PHONE_VERIFICATION_EXPIRE_IN_SECONDS,
  PHONE_VERIFICATION_MAX_VALUE,
  PHONE_VERIFICATION_MIN_VALUE,
  PHONE_FORGOT_PASSWORD_EXPIRE_IN_SECONDS,
  PHONE_CHANGE_PASSWORD_EXPIRE_IN_SECONDS,
  PHONE_SIGN_UP_EXPIRE_IN_SECONDS,
  REDIS_HOST,
  REDIS_PORT,
  REDIS_PASSWORD
} from '../../config'

const client = redis.createClient({
  host: REDIS_HOST,
  port: REDIS_PORT,
  ...(REDIS_PASSWORD ? { password: REDIS_PASSWORD } : {})
})
export default new (class service {
  async checkVerificationCodeExists(key: String) {
    const result = await RedisGet(key.concat('verificationCode'))
    return result
  }

  async getLoginTryCount(key: String): Promise<string> {
    return new Promise((resolve, reject) => {
      client.get(String(key), (err, res) => {
        if (err) {
          reject(err)
        }
        resolve(res)
      })
    })
  }

  async setLoginRedisData(key: String, exp: number, value: string): Promise<string> {
    return new Promise((resolve, reject) => {
      client.setex(String(key), exp, value, (err, res) => {
        if (err) {
          reject(err)
        }
        resolve(res)
      })
    })
  }

  async createVerificationCode(phoneNumber: String): Promise<number> {
    const verificationCode =
      Math.floor(Math.random() * PHONE_VERIFICATION_MAX_VALUE) + PHONE_VERIFICATION_MIN_VALUE
    const value = { verificationCode, triedCount: 0 }
    await RedisSetExpireDate(
      phoneNumber.concat('verificationCode'),
      value,
      PHONE_VERIFICATION_EXPIRE_IN_SECONDS
    )
    return verificationCode
  }

  async checkTriedCount(phoneNumber: String, type: String): Promise<number> {
    if (type === 'verificationCode') {
      const result = await RedisGet(phoneNumber.concat('verificationCode'))
      const { triedCount } = JSON.parse(result)
      return triedCount
    }
    if (type === 'forgotPasswordCode') {
      const result = await RedisGet(phoneNumber.concat('forgotPasswordCode'))
      const { triedCount } = JSON.parse(result)
      return triedCount
    }
    if (type === 'signUpCode') {
      const result = await RedisGet(phoneNumber.concat('signUpCode'))
      const { triedCount } = JSON.parse(result)
      return triedCount
    }

    if (type === 'changePhoneNumberCode') {
      const result = await RedisGet(phoneNumber.concat('changePhoneNumberCode'))
      const { triedCount } = JSON.parse(result)
      return triedCount
    }

    const result = await RedisGet(phoneNumber.concat('changePasswordCode'))
    const { triedCount } = JSON.parse(result)
    return triedCount
  }

  async getVerificationCode(phoneNumber: String): Promise<String> {
    const result = await RedisGet(phoneNumber.concat('verificationCode'))
    const { verificationCode } = JSON.parse(result)
    return verificationCode
  }

  async updateTriedCount(key: String, code: String, triedCount: number, type: String) {
    if (type === 'verificationCode') {
      const value = {
        verificationCode: code,
        triedCount: triedCount + 1
      }
      await RedisSet(key.concat('verificationCode'), value)
    }
    if (type === 'forgotPasswordCode') {
      const value = {
        forgotPasswordCode: code,
        triedCount: triedCount + 1
      }
      await RedisSet(key.concat('forgotPasswordCode'), value)
    }
    if (type === 'signUpCode') {
      const value = {
        signUpCode: code,
        triedCount: triedCount + 1
      }
      await RedisSet(key.concat('signUpCode'), value)
    }
    if (type === 'changePasswordCode') {
      const value = {
        changePasswordCode: code,
        triedCount: triedCount + 1
      }
      await RedisSet(key.concat('changePasswordCode'), value)
    }
    if (type === 'changePhoneNumberCode') {
      const value = {
        changePhoneNumberCode: code,
        triedCount: triedCount + 1
      }
      await RedisSet(key.concat('changePhoneNumberCode'), value)
    }
  }

  async removeFromRedis(key: String, type: String) {
    if (type === 'verificationCode') {
      await RedisDelete(key.concat('verificationCode'))
    }
    if (type === 'forgotPasswordCode') {
      await RedisDelete(key.concat('forgotPasswordCode'))
    }
    if (type === 'signUpCode') {
      await RedisDelete(key.concat('signUpCode'))
    }
    if (type === 'changePasswordCode') {
      await RedisDelete(key.concat('changePasswordCode'))
    }
    if (type === 'changePhoneNumberCode') {
      await RedisDelete(key.concat('changePhoneNumberCode'))
    }
  }

  async createForgotPasswordCode(phoneNumber: String): Promise<number> {
    const forgotPasswordCode =
      Math.floor(Math.random() * PHONE_VERIFICATION_MAX_VALUE) + PHONE_VERIFICATION_MIN_VALUE
    const value = { forgotPasswordCode, triedCount: 0 }
    await RedisSetExpireDate(
      phoneNumber.concat('forgotPasswordCode'),
      value,
      PHONE_FORGOT_PASSWORD_EXPIRE_IN_SECONDS
    )
    return forgotPasswordCode
  }

  async checkForgotPasswordCodeExists(key: String) {
    const result = await RedisGet(key.concat('forgotPasswordCode'))
    return result
  }

  async getForgotPasswordCode(key: String): Promise<String> {
    const result = await RedisGet(key.concat('forgotPasswordCode'))
    const { forgotPasswordCode } = JSON.parse(result)
    return forgotPasswordCode
  }

  async createChangePasswordCode(key: String): Promise<number> {
    const changePasswordCode =
      Math.floor(Math.random() * PHONE_VERIFICATION_MAX_VALUE) + PHONE_VERIFICATION_MIN_VALUE
    const value = { changePasswordCode, triedCount: 0 }
    await RedisSetExpireDate(
      key.concat('changePasswordCode'),
      value,
      PHONE_CHANGE_PASSWORD_EXPIRE_IN_SECONDS
    )
    return changePasswordCode
  }

  async checkChangePasswordCodeExists(key: String) {
    const result = await RedisGet(key.concat('changePasswordCode'))
    return result
  }

  async getChangePasswordCode(key: String): Promise<String> {
    const result = await RedisGet(key.concat('changePasswordCode'))
    const { changePasswordCode } = JSON.parse(result)
    return changePasswordCode
  }

  async createSignUpCode(key: String): Promise<number> {
    const signUpCode =
      Math.floor(Math.random() * PHONE_VERIFICATION_MAX_VALUE) + PHONE_VERIFICATION_MIN_VALUE
    const value = { signUpCode, triedCount: 0 }
    await RedisSetExpireDate(key.concat('signUpCode'), value, PHONE_SIGN_UP_EXPIRE_IN_SECONDS)
    return signUpCode
  }

  async checkSignUpCodeExists(key: String) {
    const result = await RedisGet(key.concat('signUpCode'))
    return result
  }

  async getSignUpCode(key: String): Promise<String> {
    const result = await RedisGet(key.concat('signUpCode'))
    const { signUpCode } = JSON.parse(result)
    return signUpCode
  }

  async createChangePhoneNumberCode(key: String): Promise<number> {
    const changePhoneNumberCode =
      Math.floor(Math.random() * PHONE_VERIFICATION_MAX_VALUE) + PHONE_VERIFICATION_MIN_VALUE
    const value = { changePhoneNumberCode, triedCount: 0 }
    await RedisSetExpireDate(
      key.concat('changePhoneNumberCode'),
      value,
      PHONE_SIGN_UP_EXPIRE_IN_SECONDS
    )
    return changePhoneNumberCode
  }

  async checkChangePhoneNumberCodeExists(key: String) {
    const result = await RedisGet(key.concat('changePhoneNumberCode'))
    return result
  }

  async getChangePhoneNumberCode(key: String): Promise<String> {
    const result = await RedisGet(key.concat('changePhoneNumberCode'))
    const { changePhoneNumberCode } = JSON.parse(result)
    return changePhoneNumberCode
  }
})()
