import mongoose, { Schema, model } from 'mongoose'
import { LANGUAGES_OF_APP } from '../../config'
import { createViews } from '../../internal/connection'

const CanceledTripReasonSchema = new Schema(
  {
    by: {
      enum: ['DRIVER', 'PASSENGER', 'ADMIN'],
      type: String
    },
    when: {
      type: String,
      enum: ['BEFORE_PICK_UP', 'DURING_TRIP']
    },
    type: {
      type: String,
      enum: ['RIDE', 'DELIVERY']
    },
    title: [{ lang: { type: String, upperCase: true }, value: String, _id: false }],
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
)

const multiLanguagesFields = ['title', 'description']

createViews(multiLanguagesFields, 'canceledtripreasons')

export const canceledTripReasonViews = LANGUAGES_OF_APP.map(language =>
  mongoose.connection.collection(`canceledtripreasons-${language}`)
)

export default model('CanceledTripReason', CanceledTripReasonSchema)
