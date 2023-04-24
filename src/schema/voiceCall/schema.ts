import mongoose, { Schema, model } from 'mongoose'
import { SESSION_TTL } from '../../config/index'

const VoiceCallSchema = new Schema(
  {
    tripId: {
      type: mongoose.Types.ObjectId,
      ref: 'trip',
      expires: 300
    },
    proxyIdentifier: { type: String },
    from: { type: String },
    to: { type: String },
    sessionId: { type: String }
  },
  { timestamps: true }
)
export default model('VoiceCall', VoiceCallSchema)
