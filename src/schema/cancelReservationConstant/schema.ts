import { Schema, model } from 'mongoose'

const CancelReservationConstantSchema = new Schema(
  {
    from: Number,
    to: Number,
    ratePunishment: Number,
    costPunishment: Number,
    forType: {
      enum: ['DRIVER', 'PASSENGER'],
      type: String
    }
  },
  { timestamps: true }
)

export default model('CancelReservationConstant', CancelReservationConstantSchema)
