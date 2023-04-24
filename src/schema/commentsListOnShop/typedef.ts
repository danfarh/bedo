import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type CommentsListOnShop {
    _id: ID!
    shop: Shop
    comments: [Comment]
  }
  ########## OPERATIONS ##########
  extend type Query {
    user8(id: ID): String
  }
  extend type Mutation {
    example8(id: ID): String
  }
  ########## INPUTS & ENUMS ##########
`

export default typeDef
