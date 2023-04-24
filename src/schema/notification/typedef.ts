import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type Notification {
    _id: ID
    user: User
    driver: Driver
    body: String
    for: String
    title: String
    type: String
    updatedAt: Date
    createdAt: Date
  }

  ########## OPERATIONS ##########
  extend type Query {
    getNotification(id: ID!): Notification
    getNotifications(
      pagination: Pagination
      filters: GetNotificationsQuery
      sort: GetNotificationSortInput
    ): [Notification]
  }
  extend type Mutation {
    createNotificationByAdmin(input: NotificationInput!): Notification
    sendNotificationsToAllDriversByAdmin(
      title: String!
      body: String!
      type: NotificationType!
    ): MessageResponse
    sendNotificationsToAllUsersByAdmin(
      title: String!
      body: String!
      type: NotificationType!
    ): MessageResponse
    sendNotificationsToMultiDriverOrUserByAdmin(
      input: sendNotificationsToMultiDriverOrUserByAdminInput
    ): MessageResponse
  }
  ########## INPUTS & ENUMS ##########
  input NotificationInput {
    user: ID
    driver: ID
    for: ForInput!
    title: String!
    body: String!
    type: NotificationType!
  }
  input GetNotificationsQuery {
    for: ForInput
    type: NotificationType
    title: String
    body: String
  }

  input GetNotificationSortInput {
    createdAt: Int
    updatedAt: Int
  }

  input sendNotificationsToMultiDriverOrUserByAdminInput {
    users: [ID!]
    drivers: [ID!]
    title: String!
    body: String!
    type: NotificationType!
  }

  enum ForInput {
    USER
    DRIVER
  }

  enum NotificationType {
    IMPORTANT
    GENERAL
    PRIVATE
  }
`

export default typeDef
