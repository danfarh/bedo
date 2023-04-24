import mongoose, { Schema, model, Document } from 'mongoose'
import { IProduct } from '../product/schema'
import { createShopMenuViews } from '../../internal/connection'

const ShopMenuSchema = new Schema(
  {
    subMenus: [
      {
        name: [{ lang: { type: String, upperCase: true }, value: String, _id: false }], // hot drinks
        products: [
          { type: mongoose.Types.ObjectId, ref: 'Product' } // Ex: coffee, tea
        ]
      }
    ]
  },
  { timestamps: true }
)

createShopMenuViews()

export interface IShopMenu extends Document {
  subMenus: [
    {
      name: string
      products: [IProduct['_id']]
    }
  ]
}

export default model<IShopMenu>('ShopMenu', ShopMenuSchema)
