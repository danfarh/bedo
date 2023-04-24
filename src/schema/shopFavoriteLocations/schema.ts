import mongoose, { Schema, model } from 'mongoose'

const ShopFavoriteLocationsSchema = new Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User'
    },
    favorites: [
      {
        title: String,
        type: {
          type: String,
          enum: ['Point']
        },
        address: String,
        coordinates: {
          type: [Number]
        }
      }
    ]
  },
  { timestamps: true }
)

export default model('ShopFavoriteLocations', ShopFavoriteLocationsSchema)
