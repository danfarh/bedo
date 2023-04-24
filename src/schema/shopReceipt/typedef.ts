import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type ShopReceipt {
    HST: Float
    cart: Float
    discount: Float
    delivery: Float
    subTotal: Float
    options: Float
    total: Float
    user: User
    order: Order
    createdAt: Date
    updatedAt: Date
  }

  ########## OPERATIONS ##########
  extend type Query {
    getShopReceipt(id: ID!): ShopReceipt
    getShopReceiptByOrderId(orderId: ID!): ShopReceipt
  }

  ########## INPUTS & ENUMS ##########
`

export default typeDef
