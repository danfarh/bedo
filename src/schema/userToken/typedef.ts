import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type UserToken {
    _id: ID
    expireDate: Date
    user: User
    driver: Driver
    FCM: [String]
    tokenHash: String
    refreshTokenHash: [String]
    securityStamp: String
  }
  type NotificationsStatus {
    isOrderNotificationActive: Boolean
    isOrderStatusNotificationActive: Boolean
    isPaymentNotificationActive: Boolean
    isDeliveryNotificationActive: Boolean
    isMessageNotificationActive: Boolean
  }
  ########## OPERATIONS ##########
  extend type Query {
    user50(id: ID): String
    getNotificationsStatus: NotificationsStatus
  }
  extend type Mutation {
    updateNotificationsStatus(inputs: UpdateNotificationsStatusInput!): NotificationsStatus
    example50(id: ID): String
  }
  ########## INPUTS & ENUMS ##########
  input UpdateNotificationsStatusInput {
    isOrderNotificationActive: Boolean
    isOrderStatusNotificationActive: Boolean
    isPaymentNotificationActive: Boolean
    isDeliveryNotificationActive: Boolean
    isMessageNotificationActive: Boolean
  }
`

export default typeDef
