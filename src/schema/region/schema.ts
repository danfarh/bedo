import { Schema, model } from 'mongoose'

const RegionSchema = new Schema(
  {
    name: { type: String, lowercase: true, trim: true }
  },
  { timestamps: true }
)

export default model('Region', RegionSchema)
