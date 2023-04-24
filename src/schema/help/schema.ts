import mongoose, { Schema, model } from 'mongoose'
import { LANGUAGES_OF_APP } from '../../config'
import { createViews } from '../../internal/connection'

const LegalSchema = new Schema(
  {
    name: String,
    title: [{ lang: { type: String, upperCase: true }, value: String, _id: false }],
    type: {
      enum: ['TAXI', 'DELIVERY', 'DRIVER_RIDE', 'DRIVER_DELIVERY', 'FOOD', 'GROCERY'],
      type: String
    },
    description: [{ lang: { type: String, upperCase: true }, value: String, _id: false }],
    order: Number,
    admin: { type: mongoose.Types.ObjectId, ref: 'Admin' },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
)
const multiLanguagesFields = ['title', 'description']

createViews(multiLanguagesFields, 'helps')

export const helpsViews = LANGUAGES_OF_APP.map(language =>
  mongoose.connection.collection(`helps-${language}`)
)
export default model('Help', LegalSchema)
