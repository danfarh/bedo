import mongoose, { Schema, model } from 'mongoose'

const CarModelSchema = new Schema(
  {
    name: String,
    brand: { type: mongoose.Types.ObjectId, ref: 'Brand' },
    admin: { type: mongoose.Types.ObjectId, ref: 'Admin' },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
)

export default model('CarModel', CarModelSchema)
