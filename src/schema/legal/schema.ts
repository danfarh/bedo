import mongoose, { Schema, model } from 'mongoose'
import { LANGUAGES_OF_APP } from '../../config'
import { createViews } from '../../internal/connection'

const LegalSchema = new Schema(
  {
    title: [{ lang: { type: String, upperCase: true }, value: String, _id: false }],
    description: [{ lang: { type: String, upperCase: true }, value: String, _id: false }],
    admin: { type: mongoose.Types.ObjectId, ref: 'Admin' },
    order: Number,
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
)

const multiLanguagesFields = ['title', 'description']

createViews(multiLanguagesFields, 'legals')

export const legalsViews = LANGUAGES_OF_APP.map(language =>
  mongoose.connection.collection(`legals-${language}`)
)

export default model('Legal', LegalSchema)
