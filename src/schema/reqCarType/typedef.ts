import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type ReqCarType {
    _id: ID!
    name: ReqCarTypeName
    logoUrl: [String]
    tripType: ReqCarTypeTripType
    increasePricePercent: Int
    DistanceBasePricePerKM: Float
    PerMinute: Float
    BookingFee: Float
    BaseFare: Float
    maximumPassengersCount: Int
    maximumWeight: Int
    carTypes: [CarType]
    description: String
  }
  ########## OPERATIONS ##########
  extend type Query {
    getReqCarTypes(pagination: Pagination, filters: ReqCarTypesFilters): [ReqCarType]!
    getReqCarType(_id: ID!): ReqCarType!
    getReqCarTypesCount(filters: ReqCarTypesFilters): Int
    getReqCarTypesByAdmin(
      filters: GetReqCarTypesByAdminFilterInput
      pagination: Pagination
      sort: GetReqCarTypesByAdminSortInput
    ): [ReqCarType]
    getReqCarTypesByAdminCount(filters: GetReqCarTypesByAdminFilterInput): Int
  }
  extend type Mutation {
    updateReqCarTypeByAdmin(filters: ReqCarTypeWhere!, input: UpdateReqCarTypeByAdmin!): ReqCarType
  }
  ########## INPUTS & ENUMS ##########
  input ReqCarTypesFilters {
    createdAt: Date
    updatedAt: Date
    name: String
    tripType: ReqCarTypeTripType
  }
  input ReqCarTypeWhere {
    _id: ID
    name: ReqCarTypeName
  }
  input UpdateReqCarTypeByAdmin {
    increasePricePercent: Int!
    DistanceBasePricePerKM: Float!
    PerMinute: Float!
    BookingFee: Float!
    BaseFare: Float!
    maximumPassengersCount: Int!
    maximumWeight: Int!
    description: String!
  }
  enum ReqCarTypeTripType {
    DELIVERY
    RIDE
    DELIVERY_AND_RIDE
  }
  enum ReqCarTypeName {
    COMPACT
    INTERMEDIATE
    FULL_SIZE
    PREMIUM
    BIKE_MOTORCYCLE
    CARS
    TRUCK_TRAILER
  }
  input GetReqCarTypesByAdminFilterInput {
    name: ReqCarTypeName
    description: String
    tripType: ReqCarTypeTripType
    increasePricePercent: Int
    DistanceBasePricePerKM: Float
    PerMinute: Float
    BookingFee: Float
    BaseFare: Float
    maximumPassengersCount: Int
    maximumWeight: Int
    carTypes: [ID]
  }

  input GetReqCarTypesByAdminSortInput {
    name: Int
    createdAt: Int
    updatedAt: Int
    description: Int
    tripType: Int
    increasePricePercent: Int
    DistanceBasePricePerKM: Int
    maximumWeight: Int
    PerMinute: Int
    BookingFee: Int
    BaseFare: Int
    maximumPassengersCount: Int
  }
`

export default typeDef
