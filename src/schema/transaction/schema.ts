import mongoose, { Schema, Types, model } from 'mongoose'

const TransactionSchema = new Schema(
  {
    paymentIntent: String,
    refundId: String,
    transactionId: String,
    reversalId: String,
    reversed: {
      type: Boolean,
      default: false
    },
    payments: [
      {
        type: Types.ObjectId,
        ref: 'Payment'
      }
    ],
    status: {
      type: String,
      enum: ['UNPAID', 'PAID', 'FAILED']
    },
    paidAt: Date,
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
    amount: Number,
    user: {
      type: Types.ObjectId,
      ref: 'User'
    },
    driver: {
      type: Types.ObjectId,
      ref: 'Driver'
    },
    shop: {
      type: Types.ObjectId,
      ref: 'Shop'
    },
    transactionMethod: {
      type: String,
      enum: ['ONLINE', 'CASH']
    }
  },
  { timestamps: true }
)

export default model('Transaction', TransactionSchema)
