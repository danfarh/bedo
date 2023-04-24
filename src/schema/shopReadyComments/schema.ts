import mongoose, { Schema, model } from 'mongoose'
import { LANGUAGES_OF_APP } from '../../config'
import { createViews } from '../../internal/connection'

const ShopReadyCommentSchema = new Schema(
  {
    type: [{ lang: { type: String, upperCase: true }, value: String, _id: false }],
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
)
const multiLanguagesFields = ['type']

createViews(multiLanguagesFields, 'shopreadycomments')

export const ShopReadyCommentsViews = LANGUAGES_OF_APP.map(language =>
  mongoose.connection.collection(`shopreadycomments-${language}`)
)

export default model('ShopReadyComment', ShopReadyCommentSchema)
