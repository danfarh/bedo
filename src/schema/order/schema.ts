import mongoose, { Schema, model } from 'mongoose'

const OrderSchema = new Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: 'User' },
    cart: { type: mongoose.Types.ObjectId, ref: 'Cart' },
    payment: { type: mongoose.Types.ObjectId, ref: 'Payment' },
    shopPayment: { type: mongoose.Types.ObjectId, ref: 'Payment' },
    shop: { type: mongoose.Types.ObjectId, ref: 'Shop' },
    promotion: { type: mongoose.Types.ObjectId, ref: 'OrderPromotion' },
    trip: { type: mongoose.Types.ObjectId, ref: 'Trip' },
    address: String,
    shipmentModel: {
      enum: ['SHOP', 'BEDO'],
      type: String
    },
    type: {
      enum: ['RESTAURANT', 'PURCHASE'],
      type: String
    },
    reserveCanceled: Boolean,
    commission: Number, // پورسانت
    commissionPercent: Number, // پورسانت درصد
    HST: Number, // tax in dollar
    HSTPercent: Number, // tax in percent
    status: {
      enum: [
        'PENDING',
        'ACCEPTED',
        'PREPARING',
        'SHIPPING',
        'DELIVERED',
        'REJECTED',
        'DELIVERY_NOT_ACCEPTED',
        'FINISHED_DUE_TO_NOT_PAYING'
      ],
      type: String
    },
    rejectedFor: {
      enum: [
        'packingDamaged',
        'damagedForPacking',
        'differentProduct',
        'noReceiver',
        'canceledByShopAdmin',
        'deliveryWasNotAccepted'
      ],
      type: String
    },
    createdAt: Date,
    deliverOrderToCourierAt: Date,
    paidAt: Date,
    shipmentAt: Date,
    tracking: {
      trackId: String,
      estimatedDelivery: Date
    },
    finished: { type: Boolean, index: true }, // IF FINISHED SHOULD ASK FOR COMMENT
    commented: {
      enum: ['NOT_COMMENTED', 'COMMENTED', 'SKIPPED'], // IF NOT_COMMENTED WE ASK FOR COMMENT
      type: String,
      default: 'NOT_COMMENTED'
    },
    userLocation: {
      type: {
        long: Number,
        lat: Number
      }
    },
    productsPrice: Number,
    priceAfterDiscount: Number,
    delivery: Number,
    subtotal: Number,
    total: Number,
    shopIncome: Number,
    discount: Number,
    finalPrice: Number,
    priceAfterPromotionDiscount: Number,
    promotionDiscount: Number,
    description: String,
    shopInvoice: Number,
    sparkShare: Number,
    shopShare: Number,
    deliveryWithoutPromotion: Number,
    deliveryPromotionDiscount: Number
  },
  { timestamps: true }
)

export default model('Order', OrderSchema)
