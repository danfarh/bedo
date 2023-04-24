import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type TripOrder {
    _id: ID!
    user: User
    trip: Trip
    payment: Payment
    commission: Float
    createdAt: Date
    paidAt: Date
    finished: Boolean
    commented: TripOrderCommented
  }
  type GetLastTripOrderRes {
    tripOrder: TripOrder
    redirectToCommentSection: Boolean
  }
  type TripOrderDetail {
    tripOrders: [TripOrder]
    numberOfTrips: Float
    commissionForSpark: Float
    userTakings: Float
    driversIncome: Float
  }

  ########## OPERATIONS ##########
  extend type Query {
    getTripOrders(pagination: Pagination, filters: GlobalFilters): [TripOrder]!
    getLastTripOrder: GetLastTripOrderRes
    getTripOrder(_id: ID!): TripOrder!
    getTripOrdersCount(filters: GlobalFilters): Int
    getTripOrdersHistory(pagination: Pagination): [TripOrder]!
    getTripOrdersDetailByAdmin(
      filters: getTripOrdersQuery
      sort: GetTripOrderSortInput
    ): TripOrderDetail
  }
  extend type Mutation {
    createTripOrder(inputs: createTripOrderInput!): TripOrder!
    skipCommentOnTrip(tripId: ID!): TripOrder
  }
  ########## INPUTS & ENUMS ##########

  input createTripOrderInput {
    id: String
  }
  input getTripOrdersQuery {
    from: Date!
    to: Date!
    _id: ID
    user: ID
    paidAt: Date
    ended: Boolean
    commented: String
    state: String
    car: ID
    driver: ID
    tripType: TripType
  }

  input GetTripOrderSortInput {
    createdAt: Int
  }

  input tripOrderSort {
    createdAt: Int
    updatedAt: Int
    paidAt: Int
    finished: Int
  }
  enum TripOrderCommented {
    NOT_COMMENTED
    COMMENTED
    SKIPPED
  }
`

export default typeDef
