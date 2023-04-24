import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type DriverReadyComments {
    _id: ID!
    type: String
    createdAt: Date
    updatedAt: Date
    isDeleted: Boolean
  }
  type MultiLanguageDriverReadyComments {
    _id: ID!
    type: [MultiLanguageField]!
    createdAt: Date
    updatedAt: Date
    isDeleted: Boolean
  }
  ########## OPERATIONS ##########
  extend type Query {
    getDriverReadyComments(pagination: Pagination, filters: GlobalFilters): [DriverReadyComments]!
    getDriverReadyComment(id: ID!): DriverReadyComments!
    getDriverReadyCommentsCount(filters: GlobalFilters): Int
    getDriverReadyCommentsByAdmin(
      filters: getDriverReadyCommentsByAdminFiltersInput
      pagination: Pagination
      sort: getDriverReadyCommentsByAdminSortInput
    ): [MultiLanguageDriverReadyComments]!
    getDriverReadyCommentByAdmin(id: ID!): MultiLanguageDriverReadyComments
    getDriverReadyCommentsByAdminCount(filters: getDriverReadyCommentsByAdminFiltersInput): Int
  }

  extend type Mutation {
    createDriverReadyCommentByAdmin(
      input: MultiLanguageDriverReadyCommentInput!
    ): MultiLanguageDriverReadyComments!
    updateDriverReadyCommentByAdmin(
      id: ID!
      input: MultiLanguageDriverReadyCommentInput!
    ): MultiLanguageDriverReadyComments
    removeDriverReadyCommentByAdmin(idSet: [ID!]!): [MultiLanguageDriverReadyComments!]!
  }
  ########## INPUTS & ENUMS ##########
  input MultiLanguageDriverReadyCommentInput {
    type: [MultiLanguageInput!]!
    isDeleted: Boolean
  }

  input getDriverReadyCommentsByAdminFiltersInput {
    _id: ID
    type: MultiLanguageInput
  }

  input getDriverReadyCommentsByAdminSortInput {
    createdAt: Int
    updatedAt: Int
    type: Int
  }
`

export default typeDef
