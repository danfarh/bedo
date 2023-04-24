import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type PassengerReadyComments {
    _id: ID
    type: String
    createdAt: Date
    updatedAt: Date
    isDeleted: Boolean
  }
  type MultiLanguagePassengerReadyComments {
    _id: ID
    type: [MultiLanguageField]
    createdAt: Date
    updatedAt: Date
    isDeleted: Boolean
  }
  ########## OPERATIONS ##########
  extend type Query {
    getPassengerReadyComments(
      pagination: Pagination
      filters: GetPassengerReadyCommentsByAdminQueryInput
    ): [PassengerReadyComments]
    getPassengerReadyComment(id: ID!): PassengerReadyComments
    getPassengerReadyCommentsCount(filters: GetPassengerReadyCommentsByAdminQueryInput): Int
    getPassengerReadyCommentByAdmin(id: ID!): MultiLanguageLegal
    getPassengerReadyCommentsByAdmin(
      pagination: Pagination
      filters: GetPassengerReadyCommentsByAdminQueryInput
      sort: GetPassengerReadyCommentsByAdminSortInput
    ): [MultiLanguagePassengerReadyComments]
    getPassengerReadyCommentsByAdminCount(filters: GetPassengerReadyCommentsByAdminQueryInput): Int
  }
  extend type Mutation {
    createPassengerReadyCommentByAdmin(
      input: CreatePassengerReadyCommentInput!
    ): MultiLanguagePassengerReadyComments
    updatePassengerReadyCommentByAdmin(
      id: ID!
      input: CreatePassengerReadyCommentInput!
    ): MultiLanguagePassengerReadyComments
    removePassengerReadyCommentByAdmin(idSet: [ID!]!): [MultiLanguagePassengerReadyComments!]!
  }
  ########## INPUTS & ENUMS ##########
  input CreatePassengerReadyCommentInput {
    type: [MultiLanguageInput!]
  }
  input GetPassengerReadyCommentsByAdminQueryInput {
    _id: ID
    type: String
  }

  input GetPassengerReadyCommentsByAdminSortInput {
    type: Int
    createdAt: Int
    updatedAt: Int
  }
`

export default typeDef
