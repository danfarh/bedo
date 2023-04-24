import mongoose, { Schema, model } from 'mongoose'

const TripOrderSchema = new Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: 'User' },
    trip: { type: mongoose.Types.ObjectId, ref: 'Trip' },
    payment: { type: mongoose.Types.ObjectId, ref: 'Payment' },
    promotion: { type: mongoose.Types.ObjectId, ref: 'tripPromotion' },
    discount: Number, // promotion in dollar
    commission: Number, // پورسانت
    commissionPercent: Number, // پورسانت درصد
    HST: Number, // tax in dollar
    HSTPercent: Number, // tax in percent
    createdAt: Date,
    paidAt: Date,
    finished: Boolean, // IF FINISHED SHOULD ASK FOR COMMENT
    commented: {
      enum: ['NOT_COMMENTED', 'COMMENTED', 'SKIPPED'], // IF NOT_COMMENTED WE ASK FOR COMMENT
      type: String,
      default: 'NOT_COMMENTED'
    }
  },
  { timestamps: true }
)

export default model('TripOrder', TripOrderSchema)
