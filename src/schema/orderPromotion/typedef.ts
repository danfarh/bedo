import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type OrderPromotion {
    _id: ID!
    condition: OrderPromotionCondition
    type: promotionTypeEnum
    from: Date
    to: Date
    percent: Float
    maximumPromotion: Float
    promotionCode: String
    shop: Shop
    useLimitCount: Int
    createdAt: Date
    updatedAt: Date
    isDeleted: Boolean
  }
  type CheckPromotionIsValidResponse {
    isValid: Boolean
    priceAfterPromotion: Float
    promotionDiscount: Float
    promotion: OrderPromotion
  }
  ########## OPERATIONS ##########
  extend type Query {
    getOrderPromotionsByAdmin(
      filters: GetOrderPromotionsByAdminQueryInput
      pagination: Pagination
      sort: GetOrderPromotionsByAdminSortInput
    ): [OrderPromotion]
    getOrderPromotionsByAdminCount(filters: GetOrderPromotionsByAdminQueryInput): Int
    checkPromotionIsValid(
      code: String!
      shop: ID!
      order: ID
      totalPrice: Float
    ): CheckPromotionIsValidResponse
    getOrderPromotions(
      filters: GetOrderPromotionsQueryInput
      pagination: Pagination
      sort: GetOrderPromotionsSortInput
    ): [OrderPromotion]
    getMyOrderPromotions(
      pagination: Pagination
      sort: GetOrderPromotionsSortInput
    ): [OrderPromotion]
    getOrderPromotion(_id: ID!): OrderPromotion
    getOrderPromotionsCount(filter: GetOrderPromotionsQueryInput): Int
    getOrderPromotionsByShopAdmin(
      filters: GetOrderPromotionsByShopAdminQueryInput
      pagination: Pagination
      sort: GetOrderPromotionsByAdminSortInput
    ): [OrderPromotion]
    getOrderPromotionsByShopAdminCount(filters: GetOrderPromotionsByShopAdminQueryInput): Int
  }
  extend type Mutation {
    createOrderPromotionByShopAdmin(data: CreateOrderPromotionByShopAdminInput!): OrderPromotion
    updateOrderPromotionByShopAdmin(
      data: CreateOrderPromotionByShopAdminInput!
      promotionId: ID!
    ): OrderPromotion
    expireOrderPromotionByShopAdmin(orderPromotionId: ID!): OrderPromotion
    deleteOrderPromotionByShopAdmin(idSet: [ID!]!): [OrderPromotion!]!
    deleteOrderPromotionByAdmin(idSet: [ID!]!): OrderPromotion
  }
  ########## INPUTS & ENUMS ##########
  input GetOrderPromotionsQueryInput {
    _id: ID
    condition: OrderPromotionCondition
    type: promotionTypeEnum
    from: Date
    to: Date
    percent: Float
    maximumPromotion: Float
    promotionCode: String
    useLimitCount: Int
  }
  input GetOrderPromotionsSortInput {
    percent: Float
    maximumPromotion: Float
    createdAt: Int
    updatedAt: Int
    useLimitCount: Int
  }
  input GetOrderPromotionsByAdminQueryInput {
    _id: ID
    shop: ID
    type: promotionTypeEnum
    fromFrom: Date
    from: Date
    toFrom: Date
    to: Date
    percentFrom: Float
    percent: Float
    useLimitCount: Int
    condition: OrderPromotionCondition
    maximumPromotionFrom: Float
    maximumPromotion: Float
    promotionCode: String
    createdAt: Date
    updatedAt: Date
    shopName: String
    shopPhoneNumber: String
  }
  input GetOrderPromotionsByShopAdminQueryInput {
    _id: ID
    condition: OrderPromotionCondition
    type: promotionTypeEnum
    from: Date
    to: Date
    percentFrom: Float
    percent: Float
    useLimitCount: Int
    maximumPromotionFrom: Float
    maximumPromotion: Float
    promotionCode: String
    createdAt: Date
    updatedAt: Date
  }
  input GetOrderPromotionsByAdminSortInput {
    createdAt: Int
    updatedAt: Int
    percent: Float
    type: Int
    maximumPromotion: Float
    useLimitCount: Int
    from: Int
    to: Int
  }
  input CreateOrderPromotionByShopAdminInput {
    condition: OrderPromotionCondition!
    type: promotionTypeEnum!
    from: Date
    to: Date
    percent: Float
    useLimitCount: Int
    maximumPromotion: Float
    promotionCode: String!
  }

  enum OrderPromotionCondition {
    TIMELY
    FIRST_ORDER
    PERCENTAGE
  }
`

export default typeDef
