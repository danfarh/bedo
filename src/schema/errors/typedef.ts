import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type Error {
    _id: ID
    title: String!
    text: String!
  }

  type MultiLanguageError {
    _id: ID
    title: String!
    text: [MultiLanguageField!]!
  }

  ########## OPERATIONS ##########
  extend type Query {
    getErrorByAdmin(id: ID!): MultiLanguageError
    getErrorsByAdmin(pagination: Pagination, filters: GetErrorsQuery): [MultiLanguageError]
  }
  extend type Mutation {
    createErrorByAdmin(input: ErrorInput!): MultiLanguageError
    updateErrorByAdmin(id: ID!, input: ErrorInput!): MultiLanguageError
    removeErrorByAdmin(idSet: [ID!]!): [MultiLanguageError!]!
  }
  ########## INPUTS & ENUMS ##########
  input ErrorInput {
    title: String!
    text: [MultiLanguageInput!]!
  }

  input GetErrorsQuery {
    title: String
  }
`

export default typeDef
