import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type Trip {
    _id: ID
    driver: Driver
    reqCarType: ReqCarType
    car: Car
    passenger: ID
    passengerDetail: User
    promotion: ID
    payment: ID
    driverPayment: ID
    paymentMethod: String
    setupIntent: String
    isLookingForLongerDistance: Boolean
    createdAt: Date
    ended: Boolean
    staticMapImageUrl: String
    state: String
    origin: TripLocation
    destinations: [Destination]
    waitTimesInMinutes: [WaitTimesInMinutes]
    staticWaitTime: Int
    orderingForSomeoneElse: OrderingForSomeoneElse
    cost: Float
    distancePrice: Float
    requestFromFarPrice: Float
    distancePriceDetails: [DistancePriceDetail]
    reqCarTypePrice: Float
    reqCarTypeDistancePrice: Float
    reqCarTypeDurationPrice: Float
    waitTimePrice: Float
    optionsPrice: Float
    optionsPriceDetails: [OptionsPriceDetail]
    driverTotalPrice: Float
    tripDistance: Float
    passedDestinationOrder: Int
    cancelReason: String
    reserved: Reserved
    orderType: OrderType
    returnToDestinationOrder: Int
    tipValue: Int
    hasAnimal: Boolean
    allCost: [AllCost]
    tripType: String
    inHurry: InHurry
    bagsWithMe: BagsWithMe
    withInfant: Boolean
    pet: Pet
    welcomeSign: Boolean
    airConditioner: Boolean
    doorToDoorInBuilding: Boolean
    signatureNeeded: Boolean
    parcelDestinations: [ParcelDestination]
    idNeeded: Boolean
    accompanyParcel: Boolean
    parcelWeight: ID
    parcelVolume: ID
    parcelPacked: Boolean
    driverAssistant: Boolean
    baseFare: Float
    bookingFee: Float
    radiusCoefficient: Float
    other: String
    updatedAt: Date
    endDate: Date
    startDate: Date
    rate: Float
    trackId: String
    isForShopDelivery: Boolean
    shopOrder: Order
  }
  type TripLocation {
    coordinates: [Float]
    type: String
    address: String
  }
  type InHurry {
    is: Boolean
    givingMoney: Float
    costPercentage: Float
  }

  type DistancePriceDetail {
    order: Int
    price: Float
  }

  type OptionsPriceDetail {
    option: String
    price: Float
  }

  type OrderingForSomeoneElse {
    is: Boolean
    info: OrderingForSomeoneElseInfo
  }
  type OrderingForSomeoneElseInfo {
    fullName: String
    address: String
    phoneNumber: String
  }
  type Pet {
    hasPet: Boolean
    hasCarrier: Boolean
  }

  type BagsWithMe {
    has: Boolean
    value: String
    weight: Float
    volume: Float
  }

  type AllCostReqType {
    id: String
    name: String
    tripType: String
    maximumPassengersCount: Int
    maximumWeight: Int
    logoUrl: [String]
  }

  type AllCost {
    reqCarType: AllCostReqType
    distancePrice: Float
    requestFromFarPrice: Float
    distancePriceDetails: [DistancePriceDetail]
    optionsPriceDetails: [OptionsPriceDetail]
    reqCarTypePrice: Float
    reqCarTypeDistancePrice: Float
    reqCarTypeDurationPrice: Float
    waitTimePrice: Float
    optionsPrice: Float
    hstPrice: Float
    hstPercent: Float
    commissionPrice: Float
    commissionPercent: Float
    driverTotalPrice: Float
    cost: Float
    promotionPrice: Float
    bookingFee: Float
    baseFare: Float
  }

  type Destination {
    coordinates: [Float]
    type: String
    address: String
    order: Int
  }

  type WaitTimesInMinutes {
    title: WaitTimesInMinutesInput
    start: Date
    end: Date
  }

  type Cargo {
    has: Boolean
    value: Int
    weight: Int
    volume: Int
  }
  type Reserved {
    type: Boolean
    date: Date
  }
  type Price {
    tripPrice: Float
  }

  type AcceptedTrip {
    driver: Driver!
    trip: Trip!
  }

  type TripChat {
    message: String
  }

  type TripReceipt {
    BaseFare: Float
    Distance: Float
    WaitTimes: Float
    BookingFee: Float
    CarType: Float
    CarTypeDistancePrice: Float
    CarTypeDurationPrice: Float
    MoreOption: Float
    Promotion: Float
    RequestFromFarPrice: Float
    SubTotal: Float
    HST: Float
    Total: Float
  }

  type DriverTripReceipt {
    driverTotalPrice: Float
    tripDistance: Float
    holdTimesInMinutes: Float
    tripTimeInMinutes: Float
  }

  type ParcelDestination {
    order: Int
    receiverInfo: ReceiverInfo
    parcelsInfo: ParcelsInfo
    signaturePhoto: [SignaturePhoto]
    delivered: Boolean
    orderingForSomeoneElse: OrderingForSomeoneElse
  }

  type ReceiverInfo {
    fullName: String
    phoneNumber: String
    address: String
  }

  type ParcelsInfo {
    numberOfParcels: Int
    parcelsWeight: ParcelWeight
    parcelsVolume: ParcelVolume
    parcelsValue: String
    ParcelsDescription: String
  }

  type SignaturePhoto {
    url: String
  }

  ########## OPERATIONS ##########
  extend type Subscription {
    # setDriverWorkStatus(status:DriverWorkStatusInput!,location:LocationInput!):Boolean!
    setOnlineCar: Location!
    findDriver: Trip!
    acceptedTrip(trackId: String): AcceptedTrip!
    updateTrip(trackId: String): Trip
    removeTrip: ID!
    tripCarLocation(trackId: String): Location!
    tripChat(trackId: String): TripChat
    removeTripFromFindDriver: Trip!
  }
  extend type Query {
    getRedisKeys: [String]
    getCarsAround(location: LocationInput!, tripType: TripType!): [Location]!
    haveCurrentTrip: Trip
    driverHaveCurrentTrip: Trip
    getTrip(id: ID!): Trip
    getTrips(filters: GetTripsQueryInput, pagination: Pagination, sort: GetTripsSortInput): [Trip]
    getTripReceipt(tripId: ID!): TripReceipt!
    getTripReceiptForDriver(tripId: ID!): DriverTripReceipt!
    getAddressFromLongLat(location: LocationInput!): String
    getDriverReservedTrips(pagination: Pagination, sort: GetTripsSortInput): [Trip]
    getUserReservedTrips(pagination: Pagination, sort: GetTripsSortInput): [Trip]
    getTripsByAdmin(
      filters: GetTripsByAdminQueryInput
      pagination: Pagination
      sort: GetTripsByAdminSortInput
    ): [Trip]
    getTripsByAdminCount(filters: GetTripsByAdminQueryInput): Int
    getTripReceiptForPassengerByAdmin(tripId: ID!): TripReceipt!
    getTripReceiptForDriverByAdmin(tripId: ID!): DriverTripReceipt!
    getTripForOfflineDrivers: [Trip]
  }
  extend type Mutation {
    setOnlineCar(long: Float!, lat: Float!, angle: Float): Boolean!
    updateTripCarLocation(tripId: ID!, location: LocationWithAngleInput): Boolean!
    setOfflineCar: Boolean!
    setOfflineAllCarSet: Boolean!
    # createTrip(locations:[TripLocationInput]!):Trip!
    createTrip(input: TripInput!, onlyCalculate: Boolean! = false): Trip!
    addHoldTime(data: AddHoldTimeInput!): Trip!
    cancelTripByPassenger(data: cancelTripByPassengerInput): Trip!
    enterSignature(tripId: ID!, deliveryOrder: Int!, signatures: [String]!): Trip!
    parcelDelivered(tripId: ID!, deliveryOrder: Int!): Trip!
    acceptTripByDriver(tripId: ID!): Trip!
    carArrivedAtStartingPoint(tripId: ID!): Trip!
    startTrip(tripId: ID!): Trip!
    carArrivedAtDestination(tripId: ID!, destinationOrder: Int!): Trip!
    # endTrip(tripId: ID!): Trip!
    addNewDestination(data: AddNewDestinationInput): Trip!
    changeDropOffLocation(data: ChangeDropOffLocationInput): Trip!
    returnTo(data: ReturnToInput): Trip!
    forceEndTripTest(tripId: ID!): Trip!
    tripSendMessage(tripId: ID!, receiverId: ID!, message: String!): String!
    cancelTripByDriver(data: cancelTripByDriverInput): Trip!
    cancelTripReservationByPassenger(tripId: ID!, reasonId: ID, reason: String): Trip!
    cancelTripReservationByDriver(tripId: ID!, reasonId: ID!): Trip!
    userRequest: String
    endTripByAdmin(tripId: ID!): Trip!
    changeStateOfTripByAdmin(_id: ID!, state: StateInput!): Trip!
  }
  ########## INPUTS & ENUMS ##########

  input TripInput {
    reqCarType: ID
    origin: LocationInput!
    destinations: [LocationInput!]!
    radiusCoefficient: Float = 1
    waitTimesInMinutes: WaitTimesInMinutesInput
    staticWaitTime: Int
    orderingForSomeoneElse: OrderingForSomeoneElseInput
    hasAnimal: Boolean
    tipValue: Float!
    priceFromClient: Float
    promotion: String
    isLookingForLongerDistance: Boolean
    tripType: TripType!
    receiverInfo: ReceiverInput
    inHurry: InHurryInput
    bagsWithMe: BagsWithMeInput
    withInfant: Boolean
    pet: PetInput
    welcomeSign: Boolean
    airConditioner: Boolean
    reserved: ReservedInput
    doorToDoorInBuilding: Boolean
    signatureNeeded: Boolean
    idNeeded: Boolean
    driverAssistant: Boolean
    accompanyParcel: Boolean
    parcelDestinations: [ParcelDestinationInput!]
    parcelWeight: ID
    parcelVolume: ID
    parcelPacked: Boolean
    baseFare: Float
    cost: Float
    passedDestinationOrder: Int
    returnToDestinationOrder: Int
    other: String
    trackId: String
    isForShopDelivery: Boolean
  }
  input ParcelDestinationInput {
    order: Int
    receiverInfo: ReceiverInfoInput!
    parcelsInfo: ReceiverInfoParcelsInfoInput!
    orderingForSomeoneElse: OrderingForSomeoneElseInput
  }
  input ReceiverInfoInput {
    fullName: String
    phoneNumber: String
    address: String
  }

  input ReceiverInfoParcelsInfoInput {
    numberOfParcels: Int
    parcelsWeight: ID!
    parcelsVolume: ID!
    parcelsValue: String
    ParcelsDescription: String!
  }

  input AddHoldTimeInput {
    tripId: ID!
    waitTimes: AddHoldTimeInputWaitTimesInput!
  }
  input AddHoldTimeInputWaitTimesInput {
    title: WaitTimesInMinutesInput!
    start: Date!
    end: Date!
  }
  enum StateInput {
    SEARCHING
    ACCEPTED
    RESERVED
    DRIVER_CANCELED
    PASSENGER_CANCELED
    COMING
    ARRIVED
    WAITING
    PICKED_UP
    DESTINATION
    FINISHED_DUE_TO_NOT_PAYING
    PASSENGER_CANCELED_DURING_TRIP
    PENDING
  }
  input ReservedInput {
    type: Boolean
    date: Date
  }
  input OrderingForSomeoneElseInput {
    is: Boolean
    info: OrderingForSomeoneElseInfoInput
  }
  input OrderingForSomeoneElseInfoInput {
    fullName: String
    address: String
    phoneNumber: String
  }
  input PetInput {
    hasPet: Boolean
    hasCarrier: Boolean
  }
  input BagsWithMeInput {
    has: Boolean
    value: String
    weight: Float
    volume: Float
  }
  input ReceiverInput {
    fullName: String!
    phoneNumber: String!
    address: String!
  }

  input CargoInput {
    has: Boolean!
    value: String
    weight: Float!
    volume: Float!
  }
  input cancelTripByPassengerInput {
    tripId: ID!
    reasonId: ID
    reason: String
    carCoordinate: LocationInput
  }
  input cancelTripByDriverInput {
    tripId: ID!
    reasonId: ID!
  }
  enum CarTypeInput {
    TRUCK
    TRAILER
    BIKE
    MOTORCYCLE
    FULL_SIZE
    INTERMEDIATE
    COMPACT
    PREMIUM
  }
  enum ReqCarTypeEnum {
    COMPACT
    INTERMEDIATE
    FULL_SIZE
    PREMIUM
    BIKE_MOTORCYCLE
    CARS
    TRUCK_TRAILER
  }
  enum TripType {
    RIDE
    DELIVERY
  }
  enum DriverWorkStatusInput {
    ACTIVE
    INACTIVE
  }
  enum WaitTimesInMinutesInput {
    AT_THE_ORIGIN_UNTIL_PICK_UP_THE_PASSENGER
    DURING_RIDE_HOLD_TIME
    DELIVERY_PICK_UP_PACKAGE_HOLD_TIME
    DELIVERY_DROP_PACKAGE_HOLD_TIME
  }
  input InHurryInput {
    is: Boolean = false
    givingMoney: Float
    costPercentage: Float
  }
  input AddNewDestinationInput {
    tripId: ID!
    newDestination: LocationInput!
  }
  input ReturnToInput {
    tripId: ID!
    order: Int!
  }
  input GetTripsQueryInput {
    tripType: TripType
    ended: Boolean
    state: StateInput
    car: ID
    driver: ID
    cost: Float
    createdAt: Date
    updatedAt: Date
  }
  input GetTripsByAdminQueryInput {
    driverName: String
    passengerName: String
    driverPhoneNumber: String
    passengerPhoneNumber: String
    _id: ID
    promotion: ID
    tripType: TripType
    ended: Boolean
    state: StateInput
    car: ID
    driver: ID
    passenger: ID
    costFrom: Float
    cost: Float
    endDateFrom: Date
    startDateFrom: Date
    endDate: Date
    startDate: Date
    createdAt: Date
    updatedAt: Date
    staticWaitTime: Float
    orderingForSomeoneElse: Boolean
    inHurry: Boolean
    bagsWithMe: Boolean
    reserved: Boolean
    withInfant: Boolean
    pet: PetInput
    driverAssistant: Boolean
    welcomeSign: Boolean
    airConditioner: Boolean
    doorToDoorInBuilding: Boolean
    signatureNeeded: Boolean
    idNeeded: Boolean
    accompanyParcel: Boolean
    parcelPacked: Boolean
    driverTotalPrice: Float
    baseFare: Float
    bookingFee: Float
    distancePrice: Float
  }
  input GetTripsByAdminSortInput {
    createdAt: Int
    updatedAt: Int
    ended: Int
    radiusCoefficient: Int
    staticWaitTime: Int
    bookingFee: Int
    baseFare: Int
    cost: Int
    endDate: Int
    startDate: Int
    distancePrice: Int
    reqCarTypePrice: Int
    requestFromFarPrice: Int
    waitTimePrice: Int
    optionsPrice: Int
    tipValue: Int
    driverTotalPrice: Int
  }
  input GetTripsSortInput {
    createdAt: Int
    updatedAt: Int
    endDate: Int
  }

  input ChangeDropOffLocationInput {
    tripId: ID
    order: Int
    receiverInfo: ReceiverInfoInput
    newDestination: LocationInput
    orderingForSomeoneElse: OrderingForSomeoneElseInput
  }
`

export default typeDef
