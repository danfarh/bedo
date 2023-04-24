import mongoose, { Schema, model } from 'mongoose'

const LogSchema = new Schema(
  {
    log: String,
    when: String
  },
  { timestamps: true }
)

export default model('Log', LogSchema)
