import mongoose, { Schema, model } from 'mongoose'

const CommentSchema = new Schema(
  {
    text: String,
    sender: { type: mongoose.Types.ObjectId, ref: 'User' },
    shop: { type: mongoose.Types.ObjectId, ref: 'Shop' }
  },
  { timestamps: true }
)

export default model('Comment', CommentSchema)
