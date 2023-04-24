import mongoose, { Schema, model, Document } from 'mongoose'
import { LANGUAGES_OF_APP } from '../../config'
import { createViews } from '../../internal/connection'

const CategorySchema = new Schema(
  {
    parent: {
      type: mongoose.Types.ObjectId,
      ref: 'Category'
    }, // EX: Purchase, RESTAURANT
    title: [{ lang: { type: String, upperCase: true }, value: String, _id: false }], // EX: fast food
    photoUrl: String,
    isDeleted: { type: Boolean, default: false }
    // Purchase is a category too and it's parent null (its a root category)
  },
  { timestamps: true }
)

const multiLanguagesFields = ['title', 'description']

createViews(multiLanguagesFields, 'categories')

export const categoriesViews = LANGUAGES_OF_APP.map(language =>
  mongoose.connection.collection(`categories-${language}`)
)
export interface ICategory extends Document {
  parent: ICategory['_id']
  title: string
  photoUrl: string
}

export default model<ICategory>('Category', CategorySchema)
