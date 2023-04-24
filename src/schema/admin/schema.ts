import mongoose, { Schema, model } from 'mongoose'

const AdminSchema = new Schema(
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
    phoneNumberVerified: Boolean,
    state: {
      enum: ['ACTIVE', 'SUSPENDED'],
      type: String,
      default: 'ACTIVE'
    },
    verificationState: {
      enum: ['VERIFIED', 'WAITING'],
      type: String
    },
    type: {
      enum: ['SHOP-ADMIN', 'SUPER-ADMIN'],
      type: String
    },
    shop: { type: mongoose.Types.ObjectId, ref: 'Shop' },
    roles: [{ type: mongoose.Types.ObjectId, ref: 'Role' }],
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
)

export default model('Admin', AdminSchema)
