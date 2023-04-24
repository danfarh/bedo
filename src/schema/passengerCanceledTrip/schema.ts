import mongoose, { Schema, model } from 'mongoose'

const PassengerCanceledTripSchema = new Schema(
  {
    passenger: { type: mongoose.Types.ObjectId, ref: 'User' },
    trips: [
      {
        trip: { type: mongoose.Types.ObjectId, ref: 'Trip' },
        reasonId: { type: mongoose.Types.ObjectId, ref: 'CanceledTripReason' },
        reason: String // reference to @PassengerCanceledTripReason
      }
    ]
  },
  { timestamps: true }
)

export default model('PassengerCanceledTrip', PassengerCanceledTripSchema)
