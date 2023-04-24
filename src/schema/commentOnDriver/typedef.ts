import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type CommentOnDriver {
    _id: ID!
    readyComments: [readyCommentsOnDriver]
    userComment: String
    trip: Trip
    passenger: User
    driver: Driver
    order: TripOrder
    createdAt: Date
    updatedAt: Date
  }
  type readyCommentsOnDriver {
    rate: Int
    readyComment: DriverReadyComments
  }
  extend type Query {
    commentsOnDriver(
      pagination: Pagination
      filters: CommentsOnDriverFiltersInput
    ): [CommentOnDriver]!
    commentOnDriver(_id: ID!): CommentOnDriver!
    totalCommentsOnDriver(filters: CommentsOnDriverFiltersInput): Int!
    getCommentsOnDriverByAdmin(
      filters: CommentsOnDriverByAdminQuery
      pagination: Pagination
      sort: CommentsOnDriverByAdminSort
    ): [CommentOnDriver]
    getCommentsOnDriverByAdminCount(filters: CommentsOnDriverByAdminQuery): Int
    getCommentOnDriverByAdmin(id: ID!): CommentOnDriver
  }
  ########## OPERATIONS ##########
  extend type Mutation {
    createCommentOnDriver(createCommentOnDriverInput: CreateCommentOnDriverInput!): CommentOnDriver
    skipCommentOnDriver(createCommentOnDriverInput: CreateCommentOnDriverInput!): Boolean
    removeCommentOnDriverByAdmin(id: ID!): MessageResponse
  }
  ########## INPUTS ##########
  input CommentsOnDriverFiltersInput {
    driver: ID
    trip: ID
    passenger: ID
  }
  input CreateCommentOnDriverInput {
    trip: ID!
    readyComments: [readyCommentsOnDriverInput]
    userComment: String
  }
  input readyCommentsOnDriverInput {
    rate: Int!
    readyComment: ID!
  }
  input CommentsOnDriverByAdminQuery {
    _id: ID
    car: ID
    driver: ID
    passenger: ID
    driverName: String
    passengerName: String
    driverPhoneNumber: String
    passengerPhoneNumber: String
    userComment: String
    trip: ID
    createdAtFrom: Date
    createdAt: Date
    updatedAt: Date
  }
  input CommentsOnDriverByAdminSort {
    createdAt: Int
    updatedAt: Int
    userComment: Int
  }
`

export default typeDef
