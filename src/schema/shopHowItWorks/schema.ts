import mongoose, { Schema, model } from 'mongoose'
import { LANGUAGES_OF_APP } from '../../config'
import { createViews } from '../../internal/connection'

const shopHowItWorksSchema = new Schema(
  {
    title: [{ lang: { type: String, upperCase: true }, value: String, _id: false }],
    description: [{ lang: { type: String, upperCase: true }, value: String, _id: false }],
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
)

const multiLanguagesFields = ['title', 'description']

createViews(multiLanguagesFields, 'shophowitworks')

export const shopHowItWorksViews = LANGUAGES_OF_APP.map(language =>
  mongoose.connection.collection(`shophowitworks-${language}`)
)

export default model('shopHowItWorks', shopHowItWorksSchema)
