import mongoose, { Schema, model } from 'mongoose'

const NotificationSchema = new Schema(
  {
    title: String,
    body: String,
    for: {
      enum: ['USER', 'DRIVER'],
      type: String
    },
    type: {
      enum: ['IMPORTANT', 'GENERAL', 'PRIVATE'],
      type: String
    },
    user: { type: mongoose.Types.ObjectId, ref: 'User' },
    driver: { type: mongoose.Types.ObjectId, ref: 'Driver' }
  },
  { timestamps: true }
)

export default model('Notification', NotificationSchema)
