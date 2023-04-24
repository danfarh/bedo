import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## OPERATIONS ##########

  extend type Mutation {
    createCall(data: CallInput!): String
    createEmergencyCall(tripId: ID!): Boolean
  }

  ########## INPUTS & ENUMS ##########
  input CallInput {
    from: Participants
    to: Participants
    tripId: ID!
    destinationOrder: Int
  }

  enum Participants {
    PASSENGER
    DRIVER
    SENDER
    RECEIVER
  }
`
export default typeDef
