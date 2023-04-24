import mongoose, { Schema, model } from 'mongoose'

const CartSchema = new Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User'
    },
    currency: String,
    productsPrice: {
      type: Number
    },
    shipmentCost: {
      // shipment cost
      type: Number
    },
    finalPrice: {
      // after promotion
      type: Number
    },
    discount: Number,
    afterDiscountPrice: Number,
    rootCategory: {
      type: mongoose.Types.ObjectId,
      ref: 'Category'
    },
    shop: { type: mongoose.Types.ObjectId, ref: 'Shop' },
    products: [
      {
        product: {
          type: mongoose.Types.ObjectId,
          ref: 'Product'
        },
        quantity: {
          quantity_small: {
            type: Number
          },
          quantity_medium: {
            type: Number
          },
          quantity_large: {
            type: Number
          }
        }
      }
    ],
    promotion: {
      type: mongoose.Types.ObjectId,
      ref: 'orderPromotion'
    }
  },
  { timestamps: true }
)

export default model('Cart', CartSchema)
