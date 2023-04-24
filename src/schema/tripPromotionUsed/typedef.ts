import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type TripPromotionUsed {
    _id: ID!
    Promotion: TripPromotion
    user: User
    usedFor: Trip
  }
  type NewPrice {
    newPrice: Float
  }
  ########## OPERATIONS ##########
  extend type Query {
    test: TripPromotion
  }
  extend type Mutation {
    # after complete cost usePromotion must return price type
    usePromotion(data: usePromotionInput): Price
    checkTripPromotion(
      promotionCode: String!
      tripType: tripTypeEnum!
      totalPrice: Float
    ): returnTripPromotion
  }
  type returnTripPromotion {
    _id: ID
    condition: promotionConditionEnum
    type: promotionTypeEnum
    percent: Float
    for: forEnum
    maximumPromotion: Float
    promotionCode: String
    promotionDiscount: Float
    priceAfterDiscount: Float
  }

  ########## INPUTS & ENUMS ##########
  input usePromotionInput {
    promotionCode: String
    usedFor: ID
  }

  enum tripTypeEnum {
    RIDE
    DELIVERY
  }
`

export default typeDef
