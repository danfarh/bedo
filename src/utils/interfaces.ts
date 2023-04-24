import { Types } from 'mongoose'

export interface TripInput {
  reqCarType: Types.ObjectId
  origin: any
  destinations: any[]
  waitTimeInMinutes?: number
  cargo?: any
  reserved?: any
  hasAnimal?: boolean
  tipValue: number
  priceFromClient?: number
  promotion?: string
  tripType?: string
  orderType?: string
  cost?: number
  receiverInfo?: any
  passenger: Types.ObjectId
  inHurry?: any
  bagsWithMe?: any
  airConditioner?: Boolean
  doorToDoorInBuilding?: Boolean
  signatureNeeded?: Boolean
  idNeeded?: Boolean
  accompanyParcel?: Boolean
  parcelWeight?: any
  parcelPacked?: Boolean
  baseFare?: number
  passedDestinationOrder?: number
  returnToDestinationOrder?: number
  staticWaitTime?: number
  radiusCoefficient: number
  trackId?: String
  isForShopDelivery?: Boolean
  shopOrder?: Types.ObjectId
  parcelDestinations?: any
}

export interface Pagination {
  skip: number
  limit: number
}
