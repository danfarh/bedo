import mongoose, { Schema, model } from 'mongoose'

const CommentsOnPassengerSchema = new Schema(
  {
    driverComment: String,
    readyComments: [
      {
        rate: {
          type: Number,
          min: 1,
          max: 5,
          default: 1
        },
        readyComment: {
          type: mongoose.Types.ObjectId,
          ref: 'passengerReadyComments'
        }
      }
    ],
    trip: {
      type: mongoose.Types.ObjectId,
      ref: 'Trip'
    },
    passenger: {
      type: mongoose.Types.ObjectId,
      ref: 'User'
    },
    driver: {
      type: mongoose.Types.ObjectId,
      ref: 'Driver'
    }
  },
  { timestamps: true }
)

export default model('CommentsOnPassenger', CommentsOnPassengerSchema)
