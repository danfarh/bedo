import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type Car {
    _id: ID
    plate: String
    color: CarColor
    carType: CarType
    pictures: Pictures
    insurance: Insurance
    isInTrip: Boolean
    description: String
    registrationDocumentUrl: String
    ride: Boolean
    owner: Driver
    status: CarStatus
    delivery: Boolean
    isDeleted: Boolean
    carOptions: CarOptions
    brand: CarBrand
    model: CarModel
    manufacturingYear: Int
  }
  type MultiLanguageCar {
    _id: ID
    plate: String
    color: MultiLanguageCarColor
    carType: CarType
    pictures: Pictures
    insurance: Insurance
    isInTrip: Boolean
    description: String
    registrationDocumentUrl: String
    ride: Boolean
    owner: Driver
    status: CarStatus
    delivery: Boolean
    isDeleted: Boolean
    carOptions: CarOptions
    brand: CarBrand
    model: CarModel
    manufacturingYear: Int
  }
  type Pictures {
    inner: [Picture]
    outer: [Picture]
  }

  type Insurance {
    insuranceImageUrl: String
    expireDate: Date
  }
  type DriverCars {
    driverCars: [Car]
    defaultCar: Car
  }
  type MultiLanguageDriverCars {
    driverCars: [MultiLanguageCar]
    defaultCar: MultiLanguageCar
  }

  type CarOptions {
    inHurry: Boolean
    orderingForSomeoneElse: Boolean
    pet: Boolean
    bagsWithMe: Boolean
    reserved: Boolean
    airConditioner: Boolean
    welcomeSign: Boolean
    driverAssistant: Boolean
    withInfant: Boolean
    waitTimesInMinutes: Boolean
    tipValue: Boolean
  }

  type Picture {
    url: String
  }

  ########## OPERATIONS ##########
  extend type Query {
    getSingleCar(id: ID!): Car
    getDriversCars(Pagination: Pagination): DriverCars
    getDriversCarsByAdmin(driver: ID!, Pagination: Pagination): MultiLanguageDriverCars
    getCarsByAdmin(
      filters: carFilters
      pagination: Pagination
      sort: carSortInput
    ): [MultiLanguageCar]
    getCarsCountByAdmin(filters: carFilters): Int
    getSortDrivers(filters: sortCarFilters): [Car]!
  }
  extend type Mutation {
    addCar(CarInput: CarInput!): Car
    updateCar(id: ID!, CarInput: CarInput!): Car
    removeCar(id: ID!): MessageResponse
    addCarByAdmin(input: AddCarByAdminInput!, driverId: ID!): MultiLanguageCar
    updateCarByAdmin(input: AddCarByAdminInput!, carId: ID!): MultiLanguageCar
    deleteCarByAdmin(idSet: [ID!]!): [MultiLanguageCar!]!
  }
  ########## INPUTS & ENUMS ##########
  input CarInput {
    color: ID!
    pictures: pictures
    insurance: InsuranceInput
    brand: ID!
    plate: String!
    carType: ID!
    description: String
    registrationDocumentUrl: String!
    ride: Boolean!
    delivery: Boolean!
    carOptions: CarOptionsInput!
    model: ID!
    manufacturingYear: Int!
  }
  input carFilters {
    _id: ID
    driverFullName: String
    driverPhoneNumber: String
    carStatus: CarStatus
    plate: String
    color: ID
    carType: ID
    isInTrip: Boolean
    description: String
    ride: Boolean
    delivery: Boolean
    carOptions: CarOptionsInput
    brand: ID
    model: ID
    manufacturingYear: Int
    createdAt: Date
    updatedAt: Date
  }
  input sortCarFilters {
    _id: ID
    shop: ID
    driverFullName: String
    driverPhoneNumber: String
    carStatus: CarStatus
    plate: String
    color: ID
    carType: ID
    isInTrip: Boolean
    description: String
    ride: Boolean
    delivery: Boolean
    carOptions: CarOptionsInput
    brand: ID
    model: ID
    manufacturingYear: Int
    createdAt: Date
    updatedAt: Date
  }

  enum CarStatus {
    ONLINE
    OFFLINE
    INTRIP
  }

  input carSortInput {
    _id: Int
    plate: Int
    color: Int
    carType: Int
    isInTrip: Int
    ride: Int
    delivery: Int
    brand: Int
    model: Int
    createdAt: Int
    manufacturingYear: Int
  }

  input pictures {
    inner: [url]
    outer: [url]
  }
  input url {
    url: String!
  }

  input InsuranceInput {
    insuranceImageUrl: String
    expireDate: Date
  }

  input CarOptionsInput {
    inHurry: Boolean!
    orderingForSomeoneElse: Boolean!
    pet: Boolean!
    bagsWithMe: Boolean!
    reserved: Boolean!
    airConditioner: Boolean!
    welcomeSign: Boolean!
    driverAssistant: Boolean!
    withInfant: Boolean!
    waitTimesInMinutes: Boolean!
    tipValue: Boolean!
  }

  input AddCarByAdminInput {
    color: ID!
    pictures: pictures
    insurance: InsuranceInput
    brand: ID!
    plate: String
    carType: ID!
    description: String
    registrationDocumentUrl: String
    ride: Boolean!
    delivery: Boolean!
    carOptions: CarOptionsInput
    model: ID!
    manufacturingYear: Int
  }
`

export default typeDef
