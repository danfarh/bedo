import mongoose, { Schema, model, Document } from 'mongoose'
import { IAttribute } from '../attribute/schema'
import { ICategory } from '../category/schema'
import { IShopMenu } from '../shopMenu/schema'

const ShopSchema = new Schema(
  {
    stripeAccountId: String,
    shopAdmin: { type: mongoose.Types.ObjectId, ref: 'Admin' },
    deliveryUser: { type: mongoose.Types.ObjectId, ref: 'User' },
    shopMenu: { type: mongoose.Types.ObjectId, ref: 'shopMenu' },
    preparingTime: Number,
    budget: {
      enum: ['B', 'BB', 'BBB'],
      type: String
    },
    acceptCash: Boolean,
    creditCardData: [
      {
        id: mongoose.Types.ObjectId,
        value: String
      }
    ],
    verified: { type: Boolean, default: false },
    isRejected: { type: Boolean, default: false },
    rejectionMessage: String,
    active: { type: Boolean, default: true }, // store can be inactive in emergency situation
    state: {
      enum: ['ACTIVE', 'SUSPENDED'],
      type: String,
      default: 'ACTIVE'
    },
    name: String,
    address: String,
    phoneNumbers: [String],
    origin: String,
    location: {
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: {
        type: [Number] // Note that longitude comes first in a GeoJSON coordinate array, not latitude
      }
    },
    description: String,
    workingHoursInMinutes: [
      // for all days of week
      {
        type: {
          type: String,
          enum: ['SAT', 'SUN', 'MON', 'TUE', 'WEN', 'THU', 'FRI']
        },
        from: Number, // in minutes : 14:25 => 14*60 +25
        to: Number
      }
    ],
    notWorkingDays: [
      {
        type: {
          type: String,
          enum: ['SAT', 'SUN', 'MON', 'TUE', 'WEN', 'THU', 'FRI']
        }
      }
    ],
    averageRate: {
      type: Number,
      default: 0
    },
    numberOfRates: {
      type: Number,
      default: 0
    },
    sumOfRates: {
      type: Number,
      default: 0
    },
    bannerUrl: String,
    logoUrl: String,
    taxCode: String,
    cardNumber: String,
    attributesCount: [
      {
        count: Number,
        attribute: { type: mongoose.Types.ObjectId, ref: 'Attribute' }
      }
    ],
    attributes: [{ type: mongoose.Types.ObjectId, ref: 'Attribute' }], // halal, dairy allergic proof ,
    rootCategory: { type: mongoose.Types.ObjectId, ref: 'Category' }, // restaurant, grocery
    categories: [{ type: mongoose.Types.ObjectId, ref: 'Category' }], // Ex: fast food , seafood, vegetarian
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
)

export interface IShop extends Document {
  stripeAccountId: String
  shopMenu: IShopMenu['_id']
  budget: string
  acceptCash: boolean
  active: boolean
  state: string
  name: string
  address: string
  phoneNumbers: [string]
  origin: string
  // location: {
  //   type: {
  //     type: String
  //     enum: ['Point']
  //   }
  //   coordinates: {
  //     type: [Number] // Note that longitude comes first in a GeoJSON coordinate array, not latitude
  //   }
  // }
  description: string
  workingHoursInMinutes: [
    {
      type: String
      from: number // in minutes : 14:25 => 14*60 +25
      to: number
    }
  ]
  notWorkingDays: [string]
  averageRate: number
  numberOfRates: number
  sumOfRates: number
  bannerUrl: string
  logoUrl: string
  attributes: IAttribute['_id']
  rootCategory: ICategory['_id']
  categories: [ICategory['_id']]
}

ShopSchema.index({ location: '2dsphere' })

export default model<IShop>('Shop', ShopSchema)
