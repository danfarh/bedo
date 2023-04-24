import mongoose, { Schema, model } from 'mongoose'

const FavoritesShopsSchema = new Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: 'User' },
    favorites: [
      {
        category: { type: mongoose.Types.ObjectId, ref: 'Category' },
        favorites: [{ type: mongoose.Types.ObjectId, ref: 'Shop' }]
      }
    ]
  },
  { timestamps: true }
)

export default model('FavoritesShops', FavoritesShopsSchema)
