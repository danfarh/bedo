import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type ReadyMessage {
    _id: ID!
    message: String!
    order: Int!
    type: String!
    createdAt: Date
    updatedAt: Date
    isDeleted: Boolean
  }
  type MultiLanguageReadyMessage {
    _id: ID!
    message: [MultiLanguageField!]!
    order: Int!
    type: String!
    createdAt: Date
    updatedAt: Date
    isDeleted: Boolean
  }

  ########## OPERATIONS ##########
  extend type Query {
    getReadyMessage(id: ID!): ReadyMessage!
    getReadyMessages(pagination: Pagination, filters: GetReadyMessagesQueryInput): [ReadyMessage]
    getReadyMessagesByAdmin(
      pagination: Pagination
      filters: GetReadyMessagesQueryInput
      sort: GetReadyMessagesSortInput
    ): [MultiLanguageReadyMessage]
    getReadyMessagesByAdminCount(filters: GetReadyMessagesQueryInput): Int
  }
  extend type Mutation {
    createReadyMessageByAdmin(input: ReadyMessageInput!): MultiLanguageReadyMessage
    updateReadyMessageByAdmin(id: ID!, input: ReadyMessageInput!): MultiLanguageReadyMessage
    removeReadyMessageByAdmin(idSet: [ID!]!): [MultiLanguageReadyMessage!]!
  }

  ########## INPUTS & ENUMS ##########
  input ReadyMessageInput {
    message: [MultiLanguageInput!]!
    order: Int!
    type: ReadyMessageType!
  }

  input GetReadyMessagesQueryInput {
    type: ReadyMessageType
    order: Int
    message: String
  }

  input GetReadyMessagesSortInput {
    createdAt: Int
    updatedAt: Int
    order: Int
    type: Int
    message: Int
  }

  enum ReadyMessageType {
    TAXI
    DELIVERY
  }
`

export default typeDef
