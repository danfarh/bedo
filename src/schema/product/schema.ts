import mongoose, { Schema, model, Document } from 'mongoose'
import { IShop } from '../shop/schema'
import { IAttributeGroup } from '../attributeGroup/schema'
import { IAttribute } from '../attribute/schema'
import { LANGUAGES_OF_APP } from '../../config'
import { createViews } from '../../internal/connection'

const ProductSchema = new Schema(
  {
    title: [{ lang: { type: String, upperCase: true }, value: String, _id: false }],
    attributes: [
      {
        attributeGroup: { type: mongoose.Types.ObjectId, ref: 'AttributeGroup' },
        att: [{ type: mongoose.Types.ObjectId, ref: 'Attribute' }]
      }
    ],
    shop: {
      type: mongoose.Types.ObjectId,
      ref: 'Shop'
    },
    promotion: {
      percent: Number,
      discountFrom: Date,
      discountTo: Date
    },
    preparationTime: Number,
    description: [{ lang: { type: String, upperCase: true }, value: String, _id: false }],
    photoUrl: [String],
    productDetails: [
      {
        size: {
          enum: ['SMALL', 'MEDIUM', 'LARGE'],
          type: String
        },
        price: Number,
        stock: { type: Number, min: 0, default: 0 },
        afterDiscountPrice: Number
      }
    ],
    reqCarTypes: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'ReqCarType'
      }
    ],
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
)

const multiLanguagesFields = ['title', 'description']

createViews(multiLanguagesFields, 'products')

export const productsViews = LANGUAGES_OF_APP.map(language =>
  mongoose.connection.collection(`products-${language}`)
)

export interface IProduct extends Document {
  title: string
  attributes: [
    {
      attributeGroup: IAttributeGroup['_id']
      att: IAttribute['_id']
    }
  ]
  shop: IShop['_id']
  price: number
  promotion: {
    percent: number
  }
  afterDiscountPrice: number
  description: string
  photoUrl: string
  isDeleted: boolean
}

export default model<IProduct>('Product', ProductSchema)
