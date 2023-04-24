import { Types } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import sendHtmlContentEmail from './htmlContentEmail'
import userTokenController from '../schema/userToken/controller'
import { APP_PUBLIC_URL } from '../config'

export default async function createEmailVerificationLink(
  userId: Types.ObjectId,
  role: string,
  email: string
) {
  const emailVerificationCode = uuidv4()
  if (role === 'USER') {
    await userTokenController.createEmailVerificationCode(emailVerificationCode, userId, null, null)
    sendHtmlContentEmail(
      email,
      'BEDO Email Verification',
      `<h2>Email Verification Link</h2>
    <a href="${APP_PUBLIC_URL}/api/v1/email/verify/${emailVerificationCode}">Verify Email</a>
    `
    )
  } else {
    await userTokenController.createEmailVerificationCode(emailVerificationCode, null, userId, null)
    sendHtmlContentEmail(
      email,
      'BEDO Email Verification',
      `<h2>Email Verification Link</h2>
      <a href="${APP_PUBLIC_URL}/api/v1/email/verify/${emailVerificationCode}">Verify Email</a>
      `
    )
  }
}
