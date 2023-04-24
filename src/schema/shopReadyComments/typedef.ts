import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type ShopReadyComments {
    _id: ID
    type: String
    createdAt: Date
    updatedAt: Date
    isDeleted: Boolean
  }
  type MultiLanguageShopReadyComments {
    _id: ID
    type: [MultiLanguageField]
    createdAt: Date
    updatedAt: Date
    isDeleted: Boolean
  }
  ########## OPERATIONS ##########
  extend type Query {
    getShopReadyComments(
      pagination: Pagination
      filters: GetShopReadyCommentsByAdminQueryInput
    ): [ShopReadyComments]
    getShopReadyComment(id: ID!): ShopReadyComments
    getShopReadyCommentsCount(filters: GetShopReadyCommentsByAdminQueryInput): Int
    getShopReadyCommentByAdmin(id: ID!): MultiLanguageLegal
    getShopReadyCommentsByAdmin(
      pagination: Pagination
      filters: GetShopReadyCommentsByAdminQueryInput
      sort: GetShopReadyCommentsByAdminSortInput
    ): [MultiLanguageShopReadyComments]
    getShopReadyCommentsByAdminCount(filters: GetShopReadyCommentsByAdminQueryInput): Int
  }
  extend type Mutation {
    createShopReadyCommentByAdmin(
      input: CreateShopReadyCommentInput!
    ): MultiLanguageShopReadyComments
    updateShopReadyCommentByAdmin(
      id: ID!
      input: CreateShopReadyCommentInput!
    ): MultiLanguageShopReadyComments
    removeShopReadyCommentByAdmin(idSet: [ID!]!): [MultiLanguageShopReadyComments!]!
  }
  ########## INPUTS & ENUMS ##########
  input CreateShopReadyCommentInput {
    type: [MultiLanguageInput!]
  }
  input GetShopReadyCommentsByAdminQueryInput {
    _id: ID
    type: String
  }

  input GetShopReadyCommentsByAdminSortInput {
    type: Int
    createdAt: Int
    updatedAt: Int
  }
`

export default typeDef
