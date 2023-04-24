import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type Comment {
    _id: ID!
    text: String
    sender: User
    shop: Shop
  }
  ########## OPERATIONS ##########
  extend type Query {
    getComments(pagination: Pagination, filters: commentFilters): [Comment]!
    getComment(_id: ID!): Comment!
    getCommentsCount(filters: commentFilters): Int
  }
  extend type Mutation {
    createComment(inputs: createCommentInput!): Comment!
    updateComment(_id: ID!, inputs: updateCommentInput!): Comment!
    deleteComment(_id: ID!): Comment!
  }
  ########## INPUTS & ENUMS ##########
  input commentFilters {
    createdAt: Date
    updatedAt: Date
    shop: String
    sender: String
    text: String
  }
  input createCommentInput {
    text: String!
    shop: String!
  }
  input updateCommentInput {
    text: String
  }
`

export default typeDef
