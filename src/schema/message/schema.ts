import mongoose, { Schema, model } from 'mongoose'

const MessageSchema = new Schema(
  {
    senderType: {
      enum: ['Driver', 'User', 'Admin'],
      type: String
    },
    driver: { type: mongoose.Types.ObjectId, ref: 'Driver' },
    user: { type: mongoose.Types.ObjectId, ref: 'User' },
    admin: { type: mongoose.Types.ObjectId, ref: 'Admin' },
    messageType: {
      enum: ['Upload', 'Text', 'Object'],
      type: String
    },
    text: String,
    conversation: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation'
    }
  },
  { timestamps: true }
)
export default model('Message', MessageSchema)
