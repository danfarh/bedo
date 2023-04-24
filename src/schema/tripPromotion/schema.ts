import mongoose, { Schema, model } from 'mongoose'

const TripPromotionSchema = new Schema(
  {
    condition: {
      enum: ['TIMELY', 'FIRST_TRIP'],
      type: String
    },
    type: {
      enum: ['FIXED', 'PERCENT'],
      type: String
    },
    for: {
      enum: ['DELIVERY', 'RIDE', 'ALL'],
      type: String
    },
    canUse: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    canNotUse: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    from: {
      type: Date
    },
    to: {
      type: Date
    },
    useLimitCount: {
      type: Number,
      default: 1
    },
    percent: Number,
    maximumPromotion: Number,
    promotionCode: String,
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
)

export default model('TripPromotion', TripPromotionSchema)
