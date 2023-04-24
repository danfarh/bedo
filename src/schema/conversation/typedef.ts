import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type Conversation {
    _id: ID!
    title: String
    closed: Boolean
    repliedByAdmin: Boolean
    user: User
    driver: Driver
    shop: Shop
    conversationCategory: ConversationCategory
    conversationType: ConversationType
    userUnreadCount: Int
    driverUnreadCount: Int
    adminUnreadCount: Int
    lastMessage: Message
    messages: [Message]
    trip: Trip
    order: Order
    updatedAt: Date
    createdAt: Date
  }

  ########## OPERATIONS ##########
  extend type Query {
    getConversation(id: ID!): Conversation
    getConversations(
      filters: conversationFilterInput
      Pagination: Pagination
      sort: GetConversationsSortInput
    ): [Conversation]
    getConversationsCount(filters: conversationFilterInput): Int
  }
  extend type Mutation {
    createConversationAndSendMessage(
      inputs: createConversationInput!
      recipient: MessageRecipient!
    ): Conversation!
    closeConversation(id: ID!): Conversation
    makeUnreadMessagesZero(id: ID!): Conversation
    updateConversation(id: ID!, inputs: UpdateConversationInputs): Conversation
  }

  ########## INPUTS & ENUMS ##########
  input createConversationInput {
    conversationTitle: String!
    messageType: MessageType!
    messageText: String
    # messageUpload: ID
    conversationType: ConversationType!
    conversationCategory: ConversationCategory!
    trip: ID
    order: ID
  }
  input MessageRecipient {
    _id: ID
    role: MessageRecipientRole!
  }
  input conversationFilterInput {
    conversationCategory: ConversationCategory
    conversationType: ConversationType
    _id: ID
    user: ID
    shop: ID
    driver: ID
    driverName: String
    passengerName: String
    driverPhoneNumber: String
    passengerPhoneNumber: String
    shopName: String
    shopPhoneNumber: String
    driverUnreadCount: Int
    adminUnreadCount: Int
    userUnreadCount: Int
    trip: ID
    order: ID
    repliedByAdmin: Boolean
    closed: Boolean
    title: String
    createdAtFrom: Date
    createdAt: Date
    updatedAt: Date
  }
  input UpdateConversationInputs {
    title: String
    closed: Boolean
    userUnreadCount: Int
    driverUnreadCount: Int
    adminUnreadCount: Int
  }
  enum ConversationCategory {
    MESSAGE
    SUPPORT_TICKET
  }
  enum MessageRecipientRole {
    DRIVER
    USER
    ADMIN
    FOOD
    GROCERY
  }
  enum ConversationType {
    RIDE
    DELIVERY
    FOOD
    GROCERY
    SUPPORT
    SHOP_SUPPORT
  }

  input GetConversationsSortInput {
    createdAt: Int
    updatedAt: Int
    title: Int
    userUnreadCount: Int
    driverUnreadCount: Int
    adminUnreadCount: Int
  }
`

export default typeDef
