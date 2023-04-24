import mongoose, { model, Schema } from 'mongoose'
import { LANGUAGES_OF_APP } from '../../config'
import { createViews } from '../../internal/connection'

const readyMessageSchema = new Schema(
  {
    message: [{ lang: { type: String, upperCase: true }, value: String, _id: false }],
    order: Number,
    type: {
      enum: ['TAXI', 'DELIVERY'],
      type: String
    },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
)

const multiLanguagesFields = ['message']

createViews(multiLanguagesFields, 'readymessages')

export const readMessagesViews = LANGUAGES_OF_APP.map(language =>
  mongoose.connection.collection(`readymessages-${language}`)
)

export default model('ReadyMessage', readyMessageSchema)
