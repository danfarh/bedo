import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type CommentOnPassenger {
    _id: ID!
    readyComments: [readyCommentsOnPassenger]
    driverComment: String
    trip: Trip
    passenger: User
    driver: Driver
    createdAt: Date
    updatedAt: Date
  }
  type readyCommentsOnPassenger {
    rate: Int
    readyComment: PassengerReadyComments
  }
  extend type Query {
    getCommentsOnPassenger(
      pagination: Pagination
      filters: CommentsOnPassengerFiltersInput
    ): [CommentOnPassenger]!
    getCommentOnPassenger(_id: ID!): CommentOnPassenger!
    getTotalCommentsOnPassenger(filters: CommentsOnPassengerFiltersInput): Int!
    getCommentsOnPassengerByAdmin(
      filters: GetCommentsOnPassengerByAdminFilterInput
      pagination: Pagination
      sort: GetCommentsOnPassengerByAdminSortInput
    ): [CommentOnPassenger]
    getCommentOnPassengerByAdmin(id: ID!): CommentOnPassenger
    getCommentsOnPassengerByAdminCount(filters: GetCommentsOnPassengerByAdminFilterInput): Int
  }
  ########## OPERATIONS ##########
  extend type Mutation {
    createCommentOnPassenger(input: CreateCommentOnPassengerInput!): CommentOnPassenger
    removeCommentOnPassengerByAdmin(id: ID!): MessageResponse
  }
  ########## INPUTS ##########
  input CommentsOnPassengerFiltersInput {
    driver: ID
    trip: ID
    passenger: ID
  }
  input CreateCommentOnPassengerInput {
    trip: ID!
    readyComments: [readyCommentsOnPassengerInput]
    driverComment: String
  }
  input readyCommentsOnPassengerInput {
    rate: Int!
    readyComment: ID!
  }
  input GetCommentsOnPassengerByAdminFilterInput {
    _id: ID
    readyComments: ReadyCommentsQueryInput
    driverComment: String
    passenger: ID
    driver: ID
    driverName: String
    passengerName: String
    driverPhoneNumber: String
    passengerPhoneNumber: String
    trip: ID
    car: ID
    createdAtFrom: Date
    createdAt: Date
    updatedAt: Date
  }

  input GetCommentsOnPassengerByAdminSortInput {
    createdAt: Int
    updatedAt: Int
    driverComment: Int
  }
`

export default typeDef
