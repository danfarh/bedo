import mongoose, { Schema, model } from 'mongoose'

const DriverSchema = new Schema(
  {
    fullName: {
      type: String,
      trim: true
    },
    car: [{ type: mongoose.Types.ObjectId, ref: 'Car' }],
    drivingLicence: {
      licenceId: String,
      photoUrl: String,
      expireDate: Date
    },
    shop: { type: mongoose.Types.ObjectId, ref: 'Shop' },
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
    defaultCar: { type: mongoose.Types.ObjectId, ref: 'Car', index: true },
    // USER
    hasNotification: {
      type: Boolean,
      default: false
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
    profileImageUrl: {
      type: String,
      trim: true
    },
    birthDate: Date,
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
    phoneNumberVerification: {
      tries: Number,
      sentTime: Date
    },
    creditCardData: [
      {
        id: mongoose.Types.ObjectId,
        value: String
      }
    ],
    // [
    // {
    //   name: String,
    //   email: String,
    //   cardType: String,
    //   cardNumber: String,
    //   expireDate: {
    //     month: Number,
    //     year: Number
    //   },
    //   cvv2: String,
    //   billingAddress: String
    // }
    // ],
    address: {
      full: { type: String, lowercase: true },
      zipCode: String
    },
    workStatus: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE']
    },
    stripeAccountId: String,
    isDeleted: { type: Boolean, default: false },
    verificationRequests: {
      type: [
        {
          status: {
            type: String,
            enum: ['APPROVED', 'REJECTED', 'PENDING'],
            default: 'PENDING'
          },
          submitDate: {
            type: Date,
            default: Date.now
          },
          verificationDetails: {
            gender: String,
            birthDate: String,
            taxCode: String,
            creditCardNumber: String,
            address: {
              full: { type: String, lowercase: true },
              zipCode: String
            },
            profileImageUrl: String,
            drivingRecordPhotoUrl: String,
            canadianVerificationPhotoUrl: String,
            backgroundCheckDocumentPhotoUrl: String,
            canadianVerificationExpireDate: Date,
            drivingLicence: {
              licenceId: String,
              photoUrl: String,
              expireDate: Date
            }
          },
          responseDate: Date,
          rejectionMessage: String
        }
      ]
    },
    default: []
  },
  { timestamps: true }
)

export default model('Driver', DriverSchema)
