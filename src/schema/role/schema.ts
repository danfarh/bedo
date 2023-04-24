import { model, Schema } from 'mongoose'

const RoleSchema = new Schema(
  {
    name: {
      type: String,
      unique: true
    },
    description: {
      type: String,
      default: false
    },
    permissions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Permission'
      }
    ]
  },
  { timestamps: true }
)

export default model('Role', RoleSchema)
