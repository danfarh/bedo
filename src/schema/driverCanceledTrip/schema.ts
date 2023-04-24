import mongoose, { Schema, model } from 'mongoose'

const DriverCanceledTripSchema = new Schema(
  {
    driver: { type: mongoose.Types.ObjectId, ref: 'Driver' },
    trip: { type: mongoose.Types.ObjectId, ref: 'Trip' },
    reason: { type: mongoose.Types.ObjectId, ref: 'CanceledTripReason' }
  },
  { timestamps: true }
)

export default model('DriverCanceledTrip', DriverCanceledTripSchema)
