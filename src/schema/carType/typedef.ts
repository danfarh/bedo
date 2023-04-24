import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type CarType {
    _id: ID!
    type: String
    alias: String
    maximumPassengersCount: Int
    maximumWeight: Int
    increasePricePercent: Int
    logoUrl: String
    description: String
  }
  type MultiLanguageCarType {
    _id: ID!
    type: String
    alias: String
    maximumPassengersCount: Int
    maximumWeight: Int
    increasePricePercent: Int
    logoUrl: String
    description: [MultiLanguageField!]!
  }
  ########## OPERATIONS ##########
  extend type Query {
    getCarTypes(pagination: Pagination, filters: CarTypesFilters): [CarType]!
    getCarType(_id: ID!): CarType!
    getCarTypesCount(filters: CarTypesFilters): Int
    getCarTypesByAdmin(pagination: Pagination, filters: CarTypesFilters): [MultiLanguageCarType]!
    getCarTypeByAdmin(_id: ID!): MultiLanguageCarType!
    getCarTypesCountByAdmin(filters: CarTypesFilters): Int
  }
  ########## INPUTS & ENUMS ##########
  input CarTypesFilters {
    createdAt: Date
    updatedAt: Date
    type: String
    alias: String
  }
`

export default typeDef
