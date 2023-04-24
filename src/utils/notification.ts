import * as admin from 'firebase-admin'
import path from 'path'
import fs from 'fs'

import { ANDROID_FCM_CONFIG, getApnsFcmConfig } from '../config/firebase'

const firebaseJsonConfigPath = path.join(__dirname, '../config/sparkFireBase.json')
const ServiceAccount = JSON.parse(fs.readFileSync(firebaseJsonConfigPath, 'utf8'))

admin.initializeApp({
  credential: admin.credential.cert(ServiceAccount),
  databaseURL: 'https://spark-3f7a0.firebaseio.com'
})

export function sendNotifications(message: any) {
  admin
    .messaging()
    .sendMulticast(message)
    .then(response => {
      console.log(response, 'response')
      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          console.log(resp, idx)
        })
      }
    })
    .catch(e => {
      console.log(e, 'error')
    })
}

export function sendNotification(message: any) {
  admin
    .messaging()
    .send(message)
    .then(response => {
      console.log(response, 'response')
    })
    .catch(e => {
      console.log(e, 'error')
    })
}

export function sendNotificationToFCMToken(token, title, body, data?) {
  if (!data) {
    data = {
      title,
      body
    }
  }
  const message = {
    notification: {
      title,
      body
    },
    data,
    android: ANDROID_FCM_CONFIG,
    apns: getApnsFcmConfig(title, body),
    token
  }
  sendNotification(message)
}

export function sendNotificationToFCMTokens(token, title, body, data?) {
  if (!data) {
    data = {
      title,
      body
    }
  }
  const message = {
    notification: {
      title,
      body
    },
    data,
    android: ANDROID_FCM_CONFIG,
    apns: getApnsFcmConfig(title, body),
    tokens: token
  }
  sendNotifications(message)
}
