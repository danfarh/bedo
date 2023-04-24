import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type CancelReservationConstant {
    _id: ID
    from: Int
    to: Int
    ratePunishment: Float
    costPunishment: Float
    forType: String
    createdAt: Date
    updatedAt: Date
  }

  ########## OPERATIONS ##########
  extend type Query {
    getCancelReservationConstants(
      pagination: Pagination
      filters: CancelReservationConstantFilter
    ): [CancelReservationConstant]!
    getCancelReservationConstant(_id: ID!): CancelReservationConstant!
    getCancelReservationConstantsCount(filters: CancelReservationConstantFilter): Int
    getCancelReservationConstantsByAdmin(
      filters: GetCancelReservationConstantByAdminFilterInput
      pagination: Pagination
      sort: GetCancelReservationConstantByAdminSortInput
    ): [CancelReservationConstant]
    getCancelReservationConstantsByAdminCount(
      filters: GetCancelReservationConstantByAdminFilterInput
    ): Int
  }
  extend type Mutation {
    updateCancelReservationConstantByAdmin(
      filters: CancelReservationConstantWhere
      data: CreateOrUpdateCancelReservationConstantInput
    ): CancelReservationConstant
    createCancelReservationConstantByAdmin(
      data: CreateOrUpdateCancelReservationConstantInput
    ): CancelReservationConstant
  }
  ########## INPUTS & ENUMS ##########
  input CreateOrUpdateCancelReservationConstantInput {
    from: Int
    to: Int
    forType: CancelReservationConstantForTypeEnum
    ratePunishment: Float
    costPunishment: Float
  }
  input CancelReservationConstantWhere {
    _id: ID
    from: Int
    to: Int
    forType: CancelReservationConstantForTypeEnum
    ratePunishment: Float
    costPunishment: Float
  }
  input CancelReservationConstantFilter {
    _id: ID
    from: Int
    to: Int
    forType: CancelReservationConstantForTypeEnum
    ratePunishment: Float
    costPunishment: Float
  }
  input CancelReservationConstantInput {
    from: Int
    to: Int
    forType: CancelReservationConstantForTypeEnum
    ratePunishment: Float
    costPunishment: Float
  }
  input GetCancelReservationConstantByAdminFilterInput {
    _id: ID
    from: Int
    to: Int
    forType: CancelReservationConstantForTypeEnum
    ratePunishment: Float
    costPunishment: Float
  }
  input GetCancelReservationConstantByAdminSortInput {
    createdAt: Int
    updatedAt: Int
    from: Int
    to: Int
    forType: Int
    ratePunishment: Int
    costPunishment: Int
  }

  enum CancelReservationConstantForTypeEnum {
    DRIVER
    PASSENGER
  }
`

export default typeDef
