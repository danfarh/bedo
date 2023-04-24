import mongoose, { Schema, model } from 'mongoose'
import { LANGUAGES_OF_APP } from '../../config'
import { createViews } from '../../internal/connection'

const CarTypeSchema = new Schema(
  {
    type: String,
    alias: {
      type: String,
      index: true
    },
    maximumPassengersCount: Number,
    maximumWeight: Number,
    logoUrl: String,
    description: [{ lang: { type: String, upperCase: true }, value: String, _id: false }]
  },
  { timestamps: true }
)

const multiLanguagesFields = ['title', 'description']

createViews(multiLanguagesFields, 'cartypes')

export const carTypesViews = LANGUAGES_OF_APP.map(language =>
  mongoose.connection.collection(`cartypes-${language}`)
)

export default model('CarType', CarTypeSchema)
