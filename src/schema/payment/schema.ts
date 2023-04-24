import mongoose, { Schema, model } from 'mongoose'

const PaymentSchema = new Schema(
  {
    order: {
      type: mongoose.Types.ObjectId,
      ref: 'Order'
    },
    trip: {
      type: mongoose.Types.ObjectId,
      ref: 'Trip'
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User'
    },
    shop: {
      type: mongoose.Types.ObjectId,
      ref: 'Shop',
      index: true
    },
    driver: {
      type: mongoose.Types.ObjectId,
      ref: 'Driver',
      index: true
    },
    transactionId: {
      type: mongoose.Types.ObjectId,
      ref: 'Transaction'
    },
    status: {
      type: String,
      enum: ['UNPAID', 'PAID', 'FAILED'],
      index: true
    },
    type: {
      type: String,
      enum: [
        'PAY_FROM_USER_TO_SHOP',
        'PAY_FROM_USER_TO_DRIVER',
        'PAY_FROM_SHOP_TO_DRIVER',
        'PAY_FROM_USER_TO_BEDO',
        'PAY_FROM_SHOP_TO_BEDO',
        'PAY_FROM_DRIVER_TO_BEDO',
        'PAY_FROM_DRIVER_TO_SHOP',
        'PAY_FROM_BEDO_TO_SHOP',
        'PAY_FROM_BEDO_TO_DRIVER',
        'PAY_FROM_BEDO_TO_USER'
      ]
    },
    for: {
      type: String,
      enum: ['DELIVERY', 'RIDE', 'RESTAURANT', 'PURCHASE']
    },
    description: String,
    amount: {
      type: Number
    }
  },
  { timestamps: true }
)

export default model('Payment', PaymentSchema)
