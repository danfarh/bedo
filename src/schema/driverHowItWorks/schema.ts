import mongoose, { Schema, model } from 'mongoose'
import { LANGUAGES_OF_APP } from '../../config'
import { createViews } from '../../internal/connection'

const driverHowItWorksSchema = new Schema(
  {
    title: [{ lang: { type: String, upperCase: true }, value: String, _id: false }],
    description: [{ lang: { type: String, upperCase: true }, value: String, _id: false }],
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
)

const multiLanguagesFields = ['title', 'description']

createViews(multiLanguagesFields, 'driverhowitworks')

export const driverHowItWorksViews = LANGUAGES_OF_APP.map(language =>
  mongoose.connection.collection(`driverhowitworks-${language}`)
)

export default model('DriverHowItWorks', driverHowItWorksSchema)
