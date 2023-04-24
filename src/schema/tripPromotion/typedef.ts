import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type TripPromotion {
    _id: ID
    condition: promotionConditionEnum
    type: promotionTypeEnum
    for: forEnum
    canUse: [ID]
    canNotUse: [ID]
    from: Date
    to: Date
    useLimitCount: Int
    percent: Float
    maximumPromotion: Float
    promotionCode: String
    createdAt: Date
    isDeleted: Boolean
    updatedAt: Date
  }
  ########## OPERATIONS ##########
  extend type Query {
    getTripPromotions(pagination: Pagination): [TripPromotion]!
    getTripPromotion(promotionId: ID!): TripPromotion!
    getMyTripPromotions(pagination: Pagination, sort: GetTripPromotionSortInput): [TripPromotion]!
    getTripPromotionsByAdmin(
      filters: getTripPromotionsByAdminQueryInput
      pagination: Pagination
      sort: getTripPromotionByAdminSort
    ): [TripPromotion]
    getTripPromotionsByAdminCount(filters: getTripPromotionsByAdminQueryInput): Int
  }
  extend type Mutation {
    createTripPromotionByAdmin(data: createTripPromotionInput): TripPromotion
    updateTripPromotionByAdmin(data: createTripPromotionInput, promotionId: ID!): TripPromotion
    deleteTripPromotionByAdmin(idSet: [ID!]!): [TripPromotion!]!
  }

  ########## INPUTS & ENUMS ##########
  input createTripPromotionInput {
    condition: promotionConditionEnum
    type: promotionTypeEnum
    for: forEnum
    canUse: [ID]
    canNotUse: [ID]
    from: Date
    useLimitCount: Int
    to: Date
    percent: Float
    maximumPromotion: Float
    promotionCode: String!
  }
  input getTripPromotionsByAdminQueryInput {
    condition: promotionConditionEnum
    type: promotionTypeEnum
    fromFrom: Date
    from: Date
    toFrom: Date
    to: Date
    percentFrom: Float
    percent: Float
    maximumPromotionFrom: Float
    maximumPromotion: Float
    promotionCode: String
    useLimitCount: Int
    for: forEnum
    createdAt: Date
    updatedAt: Date
  }
  input getTripPromotionByAdminSort {
    createdAt: Int
    updatedAt: Int
    percent: Float
    useLimitCount: Int
    maximumPromotion: Float
  }
  input GetTripPromotionSortInput {
    createdAt: Int
    updatedAt: Int
    percent: Float
    maximumPromotion: Float
    useLimitCount: Int
  }

  enum promotionTypeEnum {
    FIXED
    PERCENT
  }
  enum forEnum {
    DELIVERY
    RIDE
    ALL
  }
  enum promotionConditionEnum {
    TIMELY
    FIRST_TRIP
  }
`

export default typeDef
