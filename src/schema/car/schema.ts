import mongoose, { Schema, model } from 'mongoose'

const CarSchema = new Schema(
  {
    plate: {
      type: String,
      trim: true,
      unique: true
    },
    color: { type: mongoose.Types.ObjectId, ref: 'CarColor' },
    carType: { type: mongoose.Types.ObjectId, ref: 'CarType' },
    pictures: {
      inner: [{ url: String }],
      outer: [{ url: String }]
    },
    insurance: {
      insuranceImageUrl: String,
      expireDate: Date
    },
    carOptions: {
      inHurry: Boolean,
      orderingForSomeoneElse: Boolean,
      pet: Boolean,
      bagsWithMe: Boolean,
      reserved: Boolean,
      airConditioner: Boolean,
      welcomeSign: Boolean,
      driverAssistant: Boolean,
      withInfant: Boolean,
      waitTimesInMinutes: Boolean,
      tipValue: Boolean
    },
    ride: Boolean,
    delivery: Boolean,
    description: String,
    brand: { type: mongoose.Types.ObjectId, ref: 'CarBrand' },
    model: { type: mongoose.Types.ObjectId, ref: 'CarModel' },
    manufacturingYear: Number,
    isInTrip: {
      type: Boolean
    },
    isDeleted: { type: Boolean, default: false },
    registrationDocumentUrl: String
  },
  { timestamps: true }
)

export default model('Car', CarSchema)
