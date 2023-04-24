import mongoose, { Schema, model } from 'mongoose'

const TripSchema = new Schema(
  {
    tripType: {
      enum: ['DELIVERY', 'RIDE'],
      type: String
    },
    orderType: {
      enum: ['RESTAURANT', 'PURCHASE'],
      type: String
    },
    car: {
      type: Schema.Types.ObjectId,
      ref: 'Car'
    },
    reqCarType: {
      type: Schema.Types.ObjectId,
      ref: 'ReqCarType'
    },
    driver: {
      type: Schema.Types.ObjectId,
      ref: 'Driver'
    },
    staticWaitTime: Number,
    passenger: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    promotion: {
      type: Schema.Types.ObjectId,
      ref: 'TripPromotion'
    },
    payment: {
      type: Schema.Types.ObjectId,
      ref: 'Payment'
    },
    driverPayment: {
      type: Schema.Types.ObjectId,
      ref: 'Payment'
    },
    paymentMethod: String, //! strip payment method used to pay the trip at the end of trip
    setupIntent: String,
    isLookingForLongerDistance: {
      type: Boolean,
      default: false
    },
    shopOrder: {
      type: Schema.Types.ObjectId,
      ref: 'Order'
    },
    ended: {
      type: Boolean,
      default: false
    },
    staticMapImageUrl: String,
    state: {
      enum: [
        'PENDING',
        'RESERVED',
        'SEARCHING',
        'ACCEPTED',
        'PICKED_UP',
        'DRIVER_CANCELED',
        'PASSENGER_CANCELED',
        'FINISHED_DUE_TO_NOT_PAYING',
        'PASSENGER_CANCELED_DURING_TRIP', //! if passenger cancels trip during trip should be charged
        'ARRIVED',
        'WAITING',
        'DESTINATION'
      ],
      type: String,
      default: 'PENDING'
    },
    origin: {
      type: {
        type: String,
        enum: ['Point']
      },
      address: String,
      coordinates: {
        type: [Number] // Note that longitude comes first in a GeoJSON coordinate array
      }
    },
    destinations: [
      {
        type: {
          type: String,
          enum: ['Point']
        },
        address: String,
        coordinates: {
          type: [Number]
        },
        order: Number
      }
    ],
    radiusCoefficient: {
      type: Number,
      default: 1
    },
    waitTimesInMinutes: [
      {
        title: {
          enum: [
            'AT_THE_ORIGIN_UNTIL_PICK_UP_THE_PASSENGER',
            'DURING_RIDE_HOLD_TIME',
            'DELIVERY_PICK_UP_PACKAGE_HOLD_TIME',
            'DELIVERY_DROP_PACKAGE_HOLD_TIME'
          ],
          type: String
        },
        start: Date,
        end: Date
      }
    ],
    // Taxi more options
    orderingForSomeoneElse: {
      is: Boolean,
      info: {
        fullName: String,
        address: String,
        phoneNumber: String
      }
    },
    inHurry: {
      is: Boolean,
      givingMoney: Number, // fixed
      costPercentage: Number // or percentage
    },
    bagsWithMe: {
      has: Boolean,
      value: String,
      weight: Number,
      volume: Number
    },
    withInfant: Boolean,
    pet: {
      hasPet: Boolean,
      hasCarrier: Boolean
    },
    driverAssistant: Boolean,
    welcomeSign: Boolean,
    airConditioner: Boolean,
    reserved: {
      type: {
        type: Boolean
      },
      date: Date
    },
    // + Delivery more options
    parcelDestinations: [
      {
        order: Number,
        receiverInfo: {
          fullName: String,
          phoneNumber: String,
          address: String
        },
        parcelsInfo: {
          numberOfParcels: Number,
          parcelsWeight: {
            type: Schema.Types.ObjectId,
            ref: 'ParcelWeight'
          },
          parcelsVolume: {
            type: Schema.Types.ObjectId,
            ref: 'ParcelVolume'
          },
          parcelsValue: String,
          ParcelsDescription: String
        },
        signaturePhoto: [{ url: String }],
        delivered: {
          type: Boolean,
          default: false
        },
        orderingForSomeoneElse: {
          is: Boolean,
          info: {
            fullName: String,
            address: String,
            phoneNumber: String
          }
        }
      }
    ],
    doorToDoorInBuilding: Boolean,
    signatureNeeded: Boolean,
    idNeeded: Boolean,
    accompanyParcel: Boolean,
    parcelWeight: {
      type: Schema.Types.ObjectId,
      ref: 'ParcelWeight'
    },
    parcelVolume: {
      type: Schema.Types.ObjectId,
      ref: 'ParcelVolume'
    },
    parcelPacked: Boolean,
    //
    bookingFee: Number,
    baseFare: Number,
    driverTotalPrice: Number,
    cost: Number,
    tripDistance: Number,
    startDate: Date,
    endDate: Date,
    distancePrice: Number,
    distancePriceDetails: [
      {
        order: Number,
        price: Number,
        distance: Number,
        duration: Number
      }
    ],
    reqCarTypePrice: Number, // => deprecated
    reqCarTypeDistancePrice: Number,
    reqCarTypeDurationPrice: Number,
    requestFromFarPrice: Number,
    waitTimePrice: Number,
    optionsPrice: Number,
    optionsPriceDetails: [
      {
        option: String,
        price: Number
      }
    ],
    passedDestinationOrder: {
      type: Number
    },
    returnToDestinationOrder: {
      type: Number
    },
    tipValue: {
      type: Number
    },
    receiverInfo: {
      fullName: String,
      phoneNumber: String,
      address: String
    },
    other: String,
    rate: Number,
    trackId: String,
    isForShopDelivery: Boolean
  },
  { timestamps: true }
)

export default model('Trip', TripSchema)
