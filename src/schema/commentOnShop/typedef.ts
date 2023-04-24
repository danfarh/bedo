import { gql } from 'apollo-server-express'

const typeDef = gql`
  type CommentOnShop {
    _id: ID!
    readyComments: [readyCommentsOnShop]
    userComment: String
    shopAdminReply: ShopAdminReply
    shop: Shop
    user: User
    order: Order
    status: commentStatus
    isDeleted: Boolean
    createdAt: Date
    updatedAt: Date
  }
  type readyCommentsOnShop {
    rate: Int
    readyComment: ShopReadyComments
  }
  type ShopAdminReply {
    comment: CommentOnShop
    admin: Admin
  }

  extend type Query {
    getShopAdminCommentsOnShop(
      pagination: Pagination
      filters: ShopAdminCommentsOnShopFiltersInput
      sort: GetShopAdminCommentsOnShopSort
    ): [CommentOnShop]!
    commentsOnShop(pagination: Pagination, filters: CommentsOnShopFiltersInput): [CommentOnShop]!
    commentOnShop(_id: String!): CommentOnShop!
    totalCommentsOnShop(filters: CommentsOnShopFiltersInput): Int!
    getCommentsOnShopByAdmin(
      filters: GetCommentsOnShopByAdminFilterInput
      pagination: Pagination
      sort: GetCommentOnShopByAdminSortInput
    ): [CommentOnShop]
    getCommentOnShopByAdmin(id: ID!): CommentOnShop
    getCommentsOnShopByAdminCount(filters: GetCommentsOnShopByAdminFilterInput): Int
    getCommentsOnShopByShopAdminCount(filters: ShopAdminCommentsOnShopFiltersInput): Int
  }
  ########## OPERATIONS ##########
  extend type Mutation {
    createCommentOnShop(createCommentOnShopInput: CreateCommentOnShopInput!): CommentOnShop
    setShopAdminReplyOnComment(input: SetShopAdminReplyInput!): CommentOnShop
    rejectCommentOnShopByShopAdmin(id: ID!): MessageResponse
    removeCommentOnShopByShopAdmin(id: ID!): MessageResponse
    skipCommentOnShop(orderId: ID!): Boolean
    # TODO remove below mutation
    changeCommentStatus(_id: ID, status: commentStatus): CommentOnShop
  }
  ########## INPUTS ##########
  input CommentsOnShopFiltersInput {
    shop: ID
    hasUserComment: Boolean
    user: ID
  }
  input CreateCommentOnShopInput {
    order: ID!
    readyComments: [ReadyCommentsOnShopInput]
    userComment: String
  }
  input ReadyCommentsOnShopInput {
    rate: Int
    readyComment: ID!
  }
  input SetShopAdminReplyInput {
    comment: ID!
    text: String!
  }
  input ShopAdminCommentsOnShopFiltersInput {
    _id: ID
    readyComments: ReadyCommentsQueryInput
    userComment: String
    order: ID
    user: ID
    passengerName: String
    passengerPhoneNumber: String
    shopAdminReply: ShopAdminReplyQueryInput
    status: commentStatus
    fromDate: Date
    toDate: Date
    updatedAt: Date
    createdAtFrom: Date
    createdAt: Date
  }
  enum commentStatus {
    PENDING
    CONFIRMED
    REJECTED
  }

  input ReadyCommentsQueryInput {
    rate: Int
    readyComment: ID
  }

  input ShopAdminReplyQueryInput {
    comment: ID
    admin: ID
  }
  input GetShopAdminCommentsOnShopSort {
    createdAt: Int
    updatedAt: Int
    userComment: Int
  }

  input GetCommentOnShopByAdminSortInput {
    createdAt: Int
    updatedAt: Int
    shopAverageRate: Int
    userComment: Int
  }

  input GetCommentsOnShopByAdminFilterInput {
    _id: ID
    readyComments: ReadyCommentsQueryInput
    userComment: String
    shop: ID
    order: ID
    user: ID
    passengerName: String
    shopName: String
    passengerPhoneNumber: String
    shopPhoneNumber: String
    shopAdminReply: ShopAdminReplyQueryInput
    rootCategory: ID
    createdAt: Date
    updatedAt: Date
  }
`

export default typeDef
