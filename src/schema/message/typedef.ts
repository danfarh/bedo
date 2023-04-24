import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type Message {
    _id: ID!
    text: String
    senderType: MessageSenderType
    user: User
    driver: Driver
    conversation: Conversation
    messageType: String
    updatedAt: Date
    createdAt: Date
  }

  ########## OPERATIONS ##########
  extend type Query {
    getMessages(pagination: Pagination, filters: messageFilterInput!): [Message]!
    getMessage(_id: ID): Message!
    getMessagesCount(filters: messageFilterInput): Int
  }
  extend type Mutation {
    sendMessage(sendMessageInput: sendMessageInput!): Message!
    updateMessage(_id: ID!, inputs: updateMessageInput!): Message!
    deleteMessage(_id: ID!): Message!
  }

  ########## INPUTS & ENUMS ##########
  input sendMessageInput {
    conversation: ID!
    messageType: MessageType!
    text: String
    # upload: ID
  }

  input messageFilterInput {
    createdAt: Date
    updatedAt: Date
    messageType: MessageType
    senderType: MessageSenderType
    text: String
    conversation: ID!
  }

  input updateMessageInput {
    text: String
  }

  enum MessageSenderType {
    Driver
    User
    Admin
  }

  enum MessageType {
    Upload
    Text
    Object
  }
`

export default typeDef
