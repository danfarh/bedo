import mongoose, { Schema, model, Document } from 'mongoose'
import { IAttributeGroup } from '../attributeGroup/schema'

const AttributeSchema = new Schema(
  {
    attributeGroup: { type: mongoose.Types.ObjectId, ref: 'AttributeGroup' },
    name: String,
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
)

export interface IAttribute extends Document {
  attributeGroup: IAttributeGroup['_id']
  name: string
}

export default model<IAttribute>('Attribute', AttributeSchema)
