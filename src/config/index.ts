import path from 'path'
import dotEnv from 'dotenv'

import env from '../utils'

dotEnv.config({ path: path.join(__dirname, '../../.env') })

// ----- app main configs -----

export const PORT = env('PORT', 4000)
export const DEBUG_MODE = env('DEBUG_MODE', 'DEBUG_MODE')
export const APP_DEBUG = env('APP_DEBUG', true)
export const APP_ENV = env('APP_ENV', 'local')
export const APP_URL = env('APP_URL', 'http://5.9.198.230')
export const JWT_SECRET = env('JWT_SECRET', 'JWT_SECRET')
export const MODE = env('MODE', 'sandbox')
export const ENCRYPT_SECRET_KEY = env('ENCRYPT_SECRET_KEY', 'secretKey')
export const STRIPE_SECRET_KEY = env(
  'STRIPE_SECRET_KEY',
  'sk_test_51INlJTH4zfio9GWnjnfECqxXlvFxlzVsRQv917CYUeuZ9BOVOG7gmktx5ZCVEAZlVyWke304u2xqhvShCCXmTNDV00H7YJViK2'
)
export const APP_PUBLIC_URL = env('APP_PUBLIC_URL', 'http://localhost:4000')
export const STRIPE_ORDER_ENDPOINT_SECRET_KEY = env(
  'STRIPE_ORDER_ENDPOINT_SECRET_KEY',
  'whsec_QngFPrRhnXG6JeSP7PmavQIoKcBCOfwS'
)
export const STRIPE_TRIP_ENDPOINT_SECRET_KEY = env(
  'STRIPE_TRIP_ENDPOINT_SECRET_KEY',
  'whsec_kzBOZzZuSc8EZ3RJVfbY0uKSqCLfPAXe'
)

// ----- connection configs -----

// google api key
export const GOOGLE_API_KEY = env('GOOGLE_API_KEY', null)

// mongodb
const defaultMongoUriLocal = 'mongodb://localhost:27017/spark'
export const MONGO_CONNECTION_TYPE = env('MONGO_CONNECTION_TYPE', 'local')
export const MONGO_CONNECTION_URI_LOCAL = env('MONGO_CONNECTION_URI_LOCAL', defaultMongoUriLocal)
export const MONGO_CONNECTION_URI = env('MONGO_CONNECTION_URI', 'MONGO_CONNECTION_URI')

// redis
export const REDIS_HOST = env('REDIS_HOST', '127.0.0.1')
export const REDIS_PASSWORD = env('REDIS_PASSWORD', null)
export const REDIS_PORT = env('REDIS_PORT', 6379)

// sms
export const SMS_ACCOUNT_SID = env('ACCOUNT_SID', 'ACfd4dc628a689124a55760cfd5aca5bbe')
export const SMS_AUTH_TOKEN = env('AUTH_TOKEN', 'c88ed27dd80bf098cc027dcf50aed824')
export const SMS_FROM = env('SMS_FROM', '+12267731620')
export const SMS_OPERATION = env('OPERATION', 'submit')
export const SMS_LOGIN = env('LOGIN', 'bedosms')
export const SMS_PASSWORD = env('PASSWORD', 'bedo!2020sms')
export const SMS_TITLE = env('TITLE', 'Bedo.az')
export const SMS_ISBULK = env('ISBULK', 'false')
export const SMS_API_URL = env('API_URL', 'https://sms.atatexnologiya.az/bulksms/api')

// voice call
export const SESSION_TTL = env('SESSION_TTL', '300')

// email
export const SPARK_EMAIL_HOST = env('SPARK_EMAIL_HOST', undefined)
export const SPARK_EMAIL_SERVICE = env('SPARK_EMAIL_SERVICE', undefined)
export const SPARK_EMAIL_PORT = env('SPARK_EMAIL_PORT', undefined)
export const SPARK_EMAIL_USERNAME = env('SPARK_EMAIL_USERNAME', 'info.sparkapps@gmail.com')
// export const SPARK_EMAIL_PASSWORD = env('SPARK_EMAIL_PASSWORD', 'TeddyWaya12')
export const SPARK_EMAIL_PASSWORD = env('SPARK_EMAIL_PASSWORD', 'Mymaster123!')
export const EMAIL_FROM = env('EMAIL_FROM', 'info.sparkapps@gmail.com')
export const EMAIL_RECEIPT_IMAGE = env('EMAIL_RECEIPT_IMAGE', 'https://iili.io/fHohiv.png')
// ----- general configs -----

// user
export const EXPIRE_ACCESS_TOKEN = env('EXPIRE_ACCESS_TOKEN', '30d')
export const SMS_CODE_LENGTH = env('SMS_CODE_LENGTH', 4)
export const SMS_CODE_EXPIRE = env('SMS_CODE_EXPIRE', 120)
export const SMS_CODE_CHECK_PERIOD = env('SMS_CODE_CHECK_PERIOD', 5)
export const PHONE_VERIFICATION_MAX_VALUE = env('PHONE_VERIFICATION_MAX_VALUE', 9000)
export const PHONE_VERIFICATION_MIN_VALUE = env('PHONE_VERIFICATION_MIN_VALUE', 1000)
export const EMAIL_VERIFICATION_MAX_VALUE = env('PHONE_VERIFICATION_MAX_VALUE', 90000)
export const EMAIL_VERIFICATION_MIN_VALUE = env('PHONE_VERIFICATION_MIN_VALUE', 10000)
export const PHONE_VERIFICATION_TRIED_COUNT = env('PHONE_VERIFICATION_TRIED_COUNT', 3)
export const PHONE_VERIFICATION_EXPIRE_IN_SECONDS = env('PHONE_VERIFICATION_EXPIRE_IN_SECONDS', 300)
export const HASH_SALT = env('HASH_SALT', 10)
export const LOGIN_NUMBER_OF_RETIRES = env('LOGIN_NUMBER_OF_RETIRES', 5)
export const TOKEN_EXPIRE_TIME = env('TOKEN_EXPIRE_TIME', 605000)
export const NUMBER_OF_RETIRES_EXPIRE_TIME = env('NUMBER_OF_RETIRES_EXPIRE_TIME', 600)
export const PHONE_SIGN_UP_EXPIRE_IN_SECONDS = env('PHONE_SIGN_UP_EXPIRE_IN_SECONDS', 450)
export const PHONE_CHANGE_PASSWORD_EXPIRE_IN_SECONDS = env(
  'PHONE_CHANGE_PASSWORD_EXPIRE_IN_SECONDS',
  450
)
export const PHONE_FORGOT_PASSWORD_EXPIRE_IN_SECONDS = env(
  'PHONE_FORGOT_PASSWORD_EXPIRE_IN_SECONDS',
  450
)

// upload paths
export const DEFAULT_UPLOAD = env('DEFAULT_UPLOAD', './static/')
export const STATIC_ROUTE = env('STATIC_ROUTE', './static/')
export const LIST_UPLOAD = env('LIST_UPLOAD', '/list/')
export const PROFILE_UPLOAD = env('PROFILE_UPLOAD', '/profile/')

// google static map
const originMarkerKey = 'STATIC_MAP_ORIGIN_MARKER_IMAGE_URL'
const destinationMarkerKey = 'STATIC_MAP_DESTINATION_MARKER_IMAGE_URL'
export const STATIC_MAP_ORIGIN_MARKER_IMAGE_URL = env(originMarkerKey, '')
export const STATIC_MAP_DESTINATION_MARKER_IMAGE_URL = env(destinationMarkerKey, '')

// other
export const PRICE_VARIANCE = env('PRICE_VARIANCE', 2)
export const ONLINE_CAR_REDIS_KEY = env('ONLINE_CAR_REDIS_KEY', 'ONLINE_CAR')

// shop
export const SHOP_MAXIMUM_DISTANCE = env('SHOP_MAXIMUM_DISTANCE', 10000)

export const LANGUAGES_OF_APP = env('LANGUAGES_OF_APP', 'en').split(' ')
export const DEFAULT_LANGUAGE = env('DEFAULT_LANGUAGE', 'en')
