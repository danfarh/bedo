import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type Legal {
    _id: ID
    title: String
    description: String
    admin: Admin
    order: Int
    createdAt: Date
    updatedAt: Date
    isDeleted: Boolean
  }
  type MultiLanguageLegal {
    _id: ID
    title: [MultiLanguageField]
    description: [MultiLanguageField]
    admin: Admin
    order: Int
    createdAt: Date
    updatedAt: Date
    isDeleted: Boolean
  }

  ########## OPERATIONS ##########
  extend type Query {
    getLegal(id: ID!): Legal
    getLegals(pagination: Pagination, filters: GetLegalsQuery, sort: GetLegalsSortInput): [Legal]
    getLegalByAdmin(id: ID!): MultiLanguageLegal
    getLegalsByAdmin(
      pagination: Pagination
      filters: GetLegalsQuery
      sort: GetLegalsSortInput
    ): [MultiLanguageLegal]
    getLegalsCount(filters: GetLegalsQuery): Int
    getLegalsCountByAdmin(filters: GetLegalsQuery): Int
  }
  extend type Mutation {
    createLegalByAdmin(input: LegalInput!): MultiLanguageLegal
    updateLegalByAdmin(id: ID!, input: LegalInput!): MultiLanguageLegal
    removeLegalByAdmin(idSet: [ID!]!): [MultiLanguageLegal!]!
  }
  ########## INPUTS & ENUMS ##########
  input LegalInput {
    title: [MultiLanguageInput!]
    description: [MultiLanguageInput!]
    order: Int
  }

  input GetLegalsSortInput {
    order: Int
  }

  input GetLegalsQuery {
    title: String
    description: String
  }
`

export default typeDef
