import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type CanceledTripReason {
    _id: ID!
    by: CanceledTripReasonBy
    when: CanceledTripReasonWhen
    title: String
    type: CanceledTripReasonType
    createdAt: Date
    updatedAt: Date
    isDeleted: Boolean
  }

  type MultiLanguageCanceledTripReason {
    _id: ID!
    by: CanceledTripReasonBy
    when: CanceledTripReasonWhen
    title: [MultiLanguageField!]!
    type: CanceledTripReasonType
    createdAt: Date
    updatedAt: Date
    isDeleted: Boolean
  }

  ########## OPERATIONS ##########
  extend type Query {
    getCanceledTripReasons(
      pagination: Pagination
      filters: CanceledTripReasonFilter
    ): [CanceledTripReason]!
    getCanceledTripReason(_id: ID!): CanceledTripReason!
    getCanceledTripReasonsCount(filters: CanceledTripReasonFilter): Int
    getCanceledTripReasonsByAdmin(
      filters: CanceledTripReasonFilter
      pagination: Pagination
      sort: CanceledTripReasonSortInput
    ): [MultiLanguageCanceledTripReason]
    getCanceledTripReasonsByAdminCount(filters: CanceledTripReasonFilter): Int
  }
  extend type Mutation {
    createCanceledTripReasonByAdmin(
      input: CanceledTripReasonInput!
    ): MultiLanguageCanceledTripReason
    updateCanceledTripReasonByAdmin(
      id: ID!
      input: CanceledTripReasonInput!
    ): MultiLanguageCanceledTripReason
    removeCanceledTripReasonByAdmin(idSet: [ID!]!): [MultiLanguageCanceledTripReason!]!
  }
  ########## INPUTS & ENUMS ##########
  input CanceledTripReasonInput {
    title: [MultiLanguageInput!]!
    when: CanceledTripReasonWhen!
    by: CanceledTripReasonBy!
    type: CanceledTripReasonType!
  }
  input CanceledTripReasonFilter {
    _id: ID
    type: CanceledTripReasonType
    title: String
    when: CanceledTripReasonWhen
    by: CanceledTripReasonBy
    createdAt: Date
    updatedAt: Date
  }

  input CanceledTripReasonSortInput {
    title: Int
    type: Int
    when: Int
    by: Int
    createdAt: Int
    updatedAt: Int
  }
  enum CanceledTripReasonBy {
    DRIVER
    PASSENGER
    ADMIN
  }
  enum CanceledTripReasonWhen {
    BEFORE_PICK_UP
    DURING_TRIP
  }
  enum CanceledTripReasonType {
    RIDE
    DELIVERY
  }
`

export default typeDef
