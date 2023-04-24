import mongoose, { Schema, model } from 'mongoose'

const TripPromotionUsedSchema = new Schema(
  {
    promotion: {
      type: mongoose.Types.ObjectId,
      ref: 'TripPromotion'
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User'
    },
    usedFor: {
      type: mongoose.Types.ObjectId,
      ref: 'Trip'
    }
  },
  { timestamps: true }
)

export default model('TripPromotionUsed', TripPromotionUsedSchema)
