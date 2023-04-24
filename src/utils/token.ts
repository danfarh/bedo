import { Types } from 'mongoose'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { JWT_SECRET, TOKEN_EXPIRE_TIME } from '../config'
import { RedisSetExpireDate } from './redis'
import userTokenController from '../schema/userToken/controller'

export default async function generateToken(
  userId: Types.ObjectId,
  role: string,
  fcm: string,
  shop?: Types.ObjectId
) {
  const accessTokenKey = uuidv4()
  const refreshTokenKey = uuidv4()
  const accessToken = jwt.sign(
    {
      userId,
      sub: userId,
      iss: 'spark.com',
      tokenType: 'ACCESS_TOKEN',
      roles: role,
      fcm,
      tokenKey: accessTokenKey,
      shop: role === 'SHOP_ADMIN' ? shop : null
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  )
  const refreshToken = jwt.sign(
    {
      userId,
      sub: userId, // TODO delete later
      iss: 'spark.com',
      tokenType: 'REFRESH_TOKEN',
      roles: role,
      fcm,
      tokenKey: refreshTokenKey,
      shop: role === 'SHOP_ADMIN' ? shop : null
    },
    JWT_SECRET,
    { expiresIn: '130d' }
  )
  if (role === 'USER') {
    userTokenController.createTokensData(fcm, userId, null, null, refreshTokenKey)
  } else if (role === 'DRIVER') {
    userTokenController.createTokensData(fcm, null, userId, null, refreshTokenKey)
  } else if (role === 'SHOP_ADMIN' || role === 'SUPER_ADMIN') {
    userTokenController.createTokensData(fcm, null, null, userId, refreshTokenKey)
  }
  const tokenRedisName: string = `${userId}_TOKEN`
  await RedisSetExpireDate(tokenRedisName, accessTokenKey, TOKEN_EXPIRE_TIME)
  return {
    accessToken,
    refreshToken
  }
}
