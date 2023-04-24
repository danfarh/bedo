import mongoose, { Schema, model } from 'mongoose'

const UserTokenSchema = new Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User'
    },
    driver: {
      type: mongoose.Types.ObjectId,
      ref: 'Driver'
    },
    admin: {
      type: mongoose.Types.ObjectId,
      ref: 'Admin'
    },
    FCM: [String],
    emailVerificationCode: String,
    securityStamp: String,
    refreshTokenKey: [String],
    isOrderNotificationActive: { type: Boolean, default: true },
    isOrderStatusNotificationActive: { type: Boolean, default: true },
    isPaymentNotificationActive: { type: Boolean, default: true },
    isDeliveryNotificationActive: { type: Boolean, default: true },
    isMessageNotificationActive: { type: Boolean, default: true }
  },
  { timestamps: true }
)

export default model('UserToken', UserTokenSchema)
