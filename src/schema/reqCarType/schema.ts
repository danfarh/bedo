import { Schema, model } from 'mongoose'

const ReqCarTypeSchema = new Schema(
  {
    name: {
      type: String,
      enum: [
        'COMPACT',
        'INTERMEDIATE',
        'FULL_SIZE',
        'PREMIUM',
        'BIKE_MOTORCYCLE',
        'CARS',
        'TRUCK_TRAILER'
      ]
    },
    description: String,
    logoUrl: [String],
    tripType: {
      type: String,
      enum: ['DELIVERY', 'RIDE'],
      index: true
    },
    increasePricePercent: Number,
    DistanceBasePricePerKM: Number,
    PerMinute: Number,
    BookingFee: Number,
    BaseFare: Number,
    maximumPassengersCount: Number,
    maximumWeight: Number,
    carTypes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'CarType'
      }
    ]
  },
  { timestamps: true }
)

export default model('ReqCarType', ReqCarTypeSchema)
