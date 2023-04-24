module.exports = {
  apps: [
    {
      name: 'bedo',
      script: './build/server.js',
      env: {
        PORT: 5000,
        DEBUG_MODE: 'DEBUG_MODE',
        APP_DEBUG: true,
        APP_ENV: 'local',
        APP_URL: 'http://188.34.204.172',
        JWT_SECRET: 'JWT_SECRET',
        ENCRYPT_SECRET_KEY: 'secretKey',
        APP_PUBLIC_URL: 'http://188.34.204.172:5000',
        LANGUAGES_OF_APP: 'en ru az',
        DEFAULT_LANGUAGE: 'az',

        TEST_PAYMENT: true,
        STRIPE_SECRET_KEY:
          'sk_test_51INlJTH4zfio9GWnjnfECqxXlvFxlzVsRQv917CYUeuZ9BOVOG7gmktx5ZCVEAZlVyWke304u2xqhvShCCXmTNDV00H7YJViK2',

        GOOGLE_API_KEY: 'AIzaSyCy1sbB33yDg7RRDnlfadPtc4EJb8W6h9M',

        MONGO_CONNECTION_TYPE: 'local',
        MONGO_CONNECTION_URI_LOCAL: 'mongodb://localhost:27017/bedo',
        MONGO_CONNECTION_URI: 'mongodb://localhost:27017/bedo',

        REDIS_HOST: 'localhost',
        REDIS_PASSWORD: '',
        REDIS_PORT: 6379,

        SMS_ACCOUNT_SID: 'ACfd4dc628a689124a55760cfd5aca5bbe',
        SMS_AUTH_TOKEN: 'c88ed27dd80bf098cc027dcf50aed824',
        SMS_FROM: '+12267731620',
        SMS_OPERATION: 'submit',
        SMS_LOGIN: 'bedosms',
        SMS_PASSWORD: 'bedo!2020sms',
        SMS_TITLE: 'Bedo.az',
        SMS_ISBULK: false,
        SMS_API_URL: 'https://sms.atatexnologiya.az/bulksms/api',

        SPARK_EMAIL_HOST: 'mail.bedo.az',
        SPARK_EMAIL_SERVICE: '',
        SPARK_EMAIL_PORT: 465,
        SPARK_EMAIL_USERNAME: 'register@bedo.az',
        SPARK_EMAIL_PASSWORD: 'QsasKJHfn392//sdkj',
        EMAIL_FROM: 'register@bedo.az',
        EMAIL_RECEIPT_IMAGE: 'https://iili.io/fHohiv.png',

        EXPIRE_ACCESS_TOKEN: '30d',
        SMS_CODE_LENGTH: 4,
        SMS_CODE_EXPIRE: 120,
        SMS_CODE_CHECK_PERIOD: 5,
        PHONE_VERIFICATION_MAX_VALUE: 9000,
        PHONE_VERIFICATION_MIN_VALUE: 1000,
        PHONE_VERIFICATION_TRIED_COUNT: 3,
        PHONE_VERIFICATION_EXPIRE_IN_SECONDS: 300,
        HASH_SALT: 10,
        LOGIN_NUMBER_OF_RETIRES: 5,
        TOKEN_EXPIRE_TIME: 605000,
        NUMBER_OF_RETIRES_EXPIRE_TIME: 600,
        PHONE_SIGN_UP_EXPIRE_IN_SECONDS: 450,
        PHONE_CHANGE_PASSWORD_EXPIRE_IN_SECONDS: 450,
        PHONE_FORGOT_PASSWORD_EXPIRE_IN_SECONDS: 450,

        DEFAULT_UPLOAD: './ static /',
        STATIC_ROUTE: './ static /',
        LIST_UPLOAD: '/ list /',
        PROFILE_UPLOAD: '/profile/',

        STATIC_MAP_ORIGIN_MARKER_IMAGE_URL: 'http://188.34.204.172:5000/images/icons/marker-origin.png',
        STATIC_MAP_DESTINATION_MARKER_IMAGE_URL:
          'http://188.34.204.172:5000/images/icons/marker-destination.png',

        PRICE_VARIANCE: 2,
        ONLINE_CAR_REDIS_KEY: 'ONLINE_CAR',
        FIND_DRIVER: 'FIND_DRIVER',
        ACCEPTED_TRIP: 'ACCEPTED_TRIP',
        REMOVE_TRIP_FROM_DRIVERS: 'REMOVE_TRIP_FROM_DRIVERS',
        TRIP_CHAT: 'TRIP_CHAT'
      }
    }
  ]
}

