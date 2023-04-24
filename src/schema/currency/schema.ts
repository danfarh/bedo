import { Schema, model } from 'mongoose'

const CurrencySchema = new Schema(
  {
    type: String
    // ['USD', 'EUR'],
  },
  { timestamps: true }
)

export default model('Currency', CurrencySchema)
