import mongoose, { Schema, model } from 'mongoose'
import { LANGUAGES_OF_APP } from '../../config'
import { createViews } from '../../internal/connection'

const ErrorSchema = new Schema(
  {
    title: {
      type: String,
      unique: true
    },
    text: [{ lang: { type: String, lowercase: true }, value: String, _id: false }],
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
)

const multiLanguagesFields = ['text']

createViews(multiLanguagesFields, 'errors')

export const errorsViews = LANGUAGES_OF_APP.map(language =>
  mongoose.connection.collection(`errors-${language}`)
)

export default model('Error', ErrorSchema)
