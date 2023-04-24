import mongoose, { Schema, model } from 'mongoose'

const ShopReceiptSchema = new Schema(
  {
    HST: Number,
    cart: Number,
    discount: Number,
    delivery: Number,
    subTotal: Number,
    options: Number,
    total: Number,
    user: { type: mongoose.Types.ObjectId, ref: 'User' },
    order: { type: mongoose.Types.ObjectId, ref: 'Order' }
  },
  { timestamps: true }
)

export default model('ShopReceipt', ShopReceiptSchema)
