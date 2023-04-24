import mongoose, { Schema, model } from 'mongoose'
import { LANGUAGES_OF_APP } from '../../config'
import { createViews } from '../../internal/connection'

const CarColorSchema = new Schema(
  {
    name: [{ lang: { type: String, upperCase: true }, value: String, _id: false }],
    code: String,
    admin: { type: mongoose.Types.ObjectId, ref: 'Admin' },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
)

const multiLanguagesFields = ['name']

createViews(multiLanguagesFields, 'carcolors')

export const carColorsViews = LANGUAGES_OF_APP.map(language =>
  mongoose.connection.collection(`carcolors-${language}`)
)

export default model('CarColor', CarColorSchema)
