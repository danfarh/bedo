import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type DriverCanceledTrip {
    _id: ID!
    driver: Driver
    trip: Trip
    reason: CanceledTripReason
  }
  ########## OPERATIONS ##########
  extend type Query {
    getDriverCanceledTrips(
      pagination: Pagination
      filters: DriverCanceledTripFilter
    ): [DriverCanceledTrip]!
    getDriverCanceledTrip(_id: ID!): DriverCanceledTrip!
    getDriverCanceledTripsCount(filters: GlobalFilters): Int
  }
  ########## INPUTS & ENUMS ##########
  input DriverCanceledTripFilter {
    createdAt: Date
    updatedAt: Date
    trip: String
    reason: String
  }
`

export default typeDef
