import mongoose, { Schema, model } from 'mongoose'

const CommentsOnShopSchema = new Schema(
  {
    userComment: String,
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
          ref: 'shopReadyComments'
        }
      }
    ],
    shopAdminReply: {
      comment: {
        type: mongoose.Types.ObjectId,
        ref: 'commentsOnShop'
      },
      admin: {
        type: mongoose.Types.ObjectId,
        ref: 'admin'
      }
    },
    order: {
      type: mongoose.Types.ObjectId,
      ref: 'Order'
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User'
    },
    shop: {
      type: mongoose.Types.ObjectId,
      ref: 'Shop'
    },
    status: {
      enum: ['PENDING', 'CONFIRMED', 'REJECTED'],
      type: String
    },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
)

export default model('CommentsOnShop', CommentsOnShopSchema)
