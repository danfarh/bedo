import mongoose, { Schema, model } from 'mongoose'

const OrderPromotionUsedSchema = new Schema(
  {
    promotion: {
      type: mongoose.Types.ObjectId,
      ref: 'OrderPromotion'
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User'
    },
    usedFor: {
      type: mongoose.Types.ObjectId,
      ref: 'Order'
    }
  },
  { timestamps: true }
)

export default model('OrderPromotionUsed', OrderPromotionUsedSchema)
