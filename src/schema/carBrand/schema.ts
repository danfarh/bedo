import mongoose, { Schema, model } from 'mongoose'

const CarBrandSchema = new Schema(
  {
    name: String,
    admin: { type: mongoose.Types.ObjectId, ref: 'Admin' },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
)

export default model('CarBrand', CarBrandSchema)
