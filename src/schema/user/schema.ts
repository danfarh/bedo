import mongoose, { Schema, model } from 'mongoose'

const UserSchema = new Schema(
  {
    fullName: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    phoneNumber: {
      type: String,
      trim: true
    },
    passwordHash: {
      type: String,
      trim: true
    },
    birthDate: Date,
    hasNotification: {
      type: Boolean,
      default: false
    },
    profileImageUrl: {
      type: String,
      trim: true
    },
    state: {
      enum: ['ACTIVE', 'SUSPENDED'],
      type: String,
      default: 'ACTIVE'
    },
    gender: {
      enum: ['MALE', 'FEMALE'],
      type: String
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    phoneNumberVerified: {
      type: Boolean,
      default: false
    },
    lockTillDate: Date,
    phoneNumberVerification: {
      tries: Number,
      sentTime: Date
    },
    creditCardData: [
      {
        id: mongoose.Types.ObjectId,
        value: String // encrypt
      }
    ],
    defaultCreditCard: mongoose.Types.ObjectId,
    paypal: mongoose.Types.ObjectId,
    addresses: [
      {
        full: { type: String, lowercase: true },
        zipCode: String
      }
    ],
    defaultAddress: {
      full: { type: String, lowercase: true },
      zipCode: String
    },
    averageRate: {
      type: Number,
      default: 0
    },
    sumRate: {
      type: Number,
      default: 0
    },
    numberOfRates: {
      type: Number,
      default: 0
    },
    shopUser: {
      type: Boolean,
      default: false
    },
    stripeCustomerId: String
  },
  { timestamps: true }
)

export default model('User', UserSchema)
