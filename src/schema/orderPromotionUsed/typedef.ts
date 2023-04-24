import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type OrderPromotionUsed {
    _id: ID!
    promotion: OrderPromotion
    user: User
    usedFor: Order
  }
  ########## OPERATIONS ##########
  extend type Query {
    user19(id: ID): String
  }
  extend type Mutation {
    example19(id: ID): String
  }
  ########## INPUTS & ENUMS ##########
`

export default typeDef
