import { Schema, model } from 'mongoose'

const ConstantSchema = new Schema(
  {
    attribute: String,
    description: String,
    value: String,
    typeOfAttribute: {
      enum: ['PERCENTAGE', 'STRING', 'NUMBER', 'BOOLEAN'],
      type: String
    }
  },
  { timestamps: true }
)

export default model('Constant', ConstantSchema)
