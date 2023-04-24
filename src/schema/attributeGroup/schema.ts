import mongoose, { Schema, model, Document } from 'mongoose'
import { ICategory } from '../category/schema'

const AttributeGroupSchema = new Schema(
  {
    rootCategory: { type: mongoose.Types.ObjectId, ref: 'Category' }, // fast food
    name: String,
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
)

export interface IAttributeGroup extends Document {
  category: ICategory['_id']
  name: string
}

export default model<IAttributeGroup>('AttributeGroup', AttributeGroupSchema)
