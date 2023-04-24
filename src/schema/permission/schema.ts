import { model, Schema } from 'mongoose'

const PermissionSchema = new Schema({
  name: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    required: true
  }
})

export default model('Permission', PermissionSchema)
