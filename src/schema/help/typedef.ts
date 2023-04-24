import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type Help {
    _id: ID
    title: String
    name: String
    description: String
    type: String
    admin: Admin
    order: Int
    createdAt: Date
    updatedAt: Date
  }

  type MultiLanguageHelp {
    _id: ID
    title: [MultiLanguageField!]!
    name: String
    description: [MultiLanguageField!]!
    type: String
    admin: Admin
    order: Int
    createdAt: Date
    updatedAt: Date
  }

  ########## OPERATIONS ##########
  extend type Query {
    getHelp(id: ID!): Help
    getHelps(pagination: Pagination, filters: GetHelpsQuery, sort: GetHelpsSortInput): [Help]
    getHelpsCount(filters: GetHelpsQuery): Int
    getHelpByAdmin(id: ID!): MultiLanguageHelp
    getHelpsByAdmin(
      pagination: Pagination
      filters: GetHelpsQuery
      sort: GetHelpsSortInput
    ): [MultiLanguageHelp]
    getHelpsCountByAdmin(filters: GetHelpsQuery): Int
  }
  extend type Mutation {
    createHelpByAdmin(input: HelpInput!): MultiLanguageHelp
    updateHelpByAdmin(id: ID!, input: HelpInput!): MultiLanguageHelp
    removeHelpByAdmin(idSet: [ID!]!): [MultiLanguageHelp!]!
  }
  ########## INPUTS & ENUMS ##########
  input HelpInput {
    name: HelpName!
    title: [MultiLanguageInput!]!
    description: [MultiLanguageInput!]!
    type: HelpType!
    order: Int
  }

  input GetHelpsSortInput {
    order: Int
  }

  enum HelpType {
    TAXI
    DELIVERY
    FOOD
    DRIVER_RIDE
    DRIVER_DELIVERY
    GROCERY
  }

  input GetHelpsQuery {
    type: HelpType
    title: String
    name: HelpName
  }

  enum HelpName {
    I_WANT_TO_REPORT_A_SERVICE_ANIMAL_ISSUE
    I_LOST_AN_ITEM
    I_WAS_INVOLVED_IN_AN_ACCIDENT
    LEARN_ABOUT_SPARK
    ACCOUNT_AND_PAYMENT
    RIDE_GUIDE
    FOOD_GUIDE
    GROCERY_SHOPPING_GUIDE
    DELIVERY_GUIDE
    MY_PARCEL_WAS_NOT_DELIVERED
    MY_PARCEL_IS_MISSING_AN_ITEM
    MY_DELIVERY_HAS_BEEN_DELAYED
    DELIVERY_COSTED_MORE_THAN_ESTIMATED
    MY_PACKAGE_WAS_OPENED
    OTHER_ISSUES
    I_LOST_AN_ITEM_DELIVERY
    FOOD_MY_ORDER_COSTED_MORE_THAN_ESTIMATED
    FOOD_MY_ORDER_HAS_BEEN_DELAYED
    FOOD_MY_ORDER_WAS_DIFFERENT
    FOOD_OTHER_ISSUES
    GROCERY_MY_ORDER_COSTED_MORE_THAN_ESTIMATED
    GROCERY_MY_ORDER_HAS_BEEN_DELAYED
    GROCERY_MY_ORDER_WAS_DIFFERENT
    GROCERY_OTHER_ISSUES
    DRIVER_RIDE_HELP
    DRIVER_DELIVERY_HELP
  }
`

export default typeDef
