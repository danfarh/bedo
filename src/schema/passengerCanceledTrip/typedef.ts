import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type PassengerCanceledTrip {
    _id: ID!
    passenger: User
    trips: [PassengerCanceledTripTrips]
  }
  type PassengerCanceledTripTrips {
    trip: Trip
    reasonId: CanceledTripReason
    reason: String
  }
  ########## OPERATIONS ##########
  extend type Query {
    getPassengerCanceledTrips(
      pagination: Pagination
      filters: GlobalFilters
    ): [PassengerCanceledTrip]!
    getPassengerCanceledTrip(_id: ID!): PassengerCanceledTrip!
    getPassengerCanceledTripsCount(filters: GlobalFilters): Int
  }
  ########## INPUTS & ENUMS ##########
`

export default typeDef
