import { Schema, model } from 'mongoose'

const ParcelVolumeSchema = new Schema(
  {
    name: String,
    value: Number,
    order: Number,
    typeOfAttribute: {
      enum: ['PERCENTAGE', 'NUMBER'],
      type: String
    },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
)

export default model('ParcelVolume', ParcelVolumeSchema)
