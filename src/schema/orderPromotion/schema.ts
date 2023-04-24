import mongoose, { Schema, model } from 'mongoose'

const OrderPromotionSchema = new Schema(
  {
    condition: {
      enum: ['TIMELY', 'FIRST_ORDER', 'PERCENTAGE'],
      type: String
    },
    type: {
      enum: ['FIXED', 'PERCENT'],
      type: String
    },
    shop: { type: mongoose.Types.ObjectId, ref: 'Shop' },
    from: {
      type: Date
    },
    to: {
      type: Date
    },
    percent: Number,
    maximumPromotion: Number,
    useLimitCount: {
      type: Number,
      default: 1
    },
    isDeleted: { type: Boolean, default: false },
    promotionCode: String
  },
  { timestamps: true }
)

export default model('OrderPromotion', OrderPromotionSchema)
