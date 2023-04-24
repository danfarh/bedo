import mongoose, { Schema, model } from 'mongoose'
import { LANGUAGES_OF_APP } from '../../config'
import { createViews } from '../../internal/connection'

const AdvertisementSchema = new Schema(
  {
    description: [{ lang: { type: String, lowercase: true }, value: String, _id: false }],
    title: [{ lang: { type: String, lowercase: true }, value: String, _id: false }],
    startAt: Date,
    endAt: Date,
    photoUrl: String,
    redirectTo: String,
    admin: { type: mongoose.Types.ObjectId, ref: 'Admin' },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
)

const multiLanguagesFields = ['title', 'description']

createViews(multiLanguagesFields, 'advertisements')

export const advertisementsViews = LANGUAGES_OF_APP.map(language =>
  mongoose.connection.collection(`advertisements-${language}`)
)

export default model('Advertisement', AdvertisementSchema)
