import mongoose, { Schema, model } from 'mongoose'

const ConversationSchema = new Schema(
  {
    title: String,
    user: { type: mongoose.Types.ObjectId, ref: 'User' },
    driver: { type: mongoose.Types.ObjectId, ref: 'Driver' },
    admin: { type: mongoose.Types.ObjectId, ref: 'Admin' },
    shop: { type: mongoose.Types.ObjectId, ref: 'Shop' },
    trip: { type: mongoose.Types.ObjectId, ref: 'Trip' },
    order: { type: mongoose.Types.ObjectId, ref: 'Order' },
    driverUnreadCount: { type: Number, default: 0 },
    userUnreadCount: { type: Number, default: 0 },
    adminUnreadCount: { type: Number, default: 0 },
    conversationType: {
      type: String,
      enum: ['DELIVERY', 'RIDE', 'FOOD', 'GROCERY', 'SUPPORT', 'SHOP_SUPPORT']
    },
    conversationCategory: {
      type: String,
      enum: ['MESSAGE', 'SUPPORT_TICKET']
    },
    closed: {
      type: Boolean,
      default: false
    },
    repliedByAdmin: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

export default model('Conversation', ConversationSchema)
