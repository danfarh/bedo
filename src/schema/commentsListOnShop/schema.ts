import mongoose, { Schema, model } from 'mongoose'

const CommentsListOnShopSchema = new Schema(
  {
    shop: { type: mongoose.Types.ObjectId, ref: 'Shop' },
    comments: [{ type: mongoose.Types.ObjectId, ref: 'Comment' }]
  },
  { timestamps: true }
)

export default model('CommentsListOnShop', CommentsListOnShopSchema)
