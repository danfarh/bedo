import mongoose, { Schema, model } from 'mongoose'

const FavoritesProductsSchema = new Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: 'User' },
    favorites: [
      {
        category: { type: mongoose.Types.ObjectId, ref: 'Category' },
        favorites: [{ type: mongoose.Types.ObjectId, ref: 'Product' }]
      }
    ]
  },
  { timestamps: true }
)

export default model('FavoritesProducts', FavoritesProductsSchema)
