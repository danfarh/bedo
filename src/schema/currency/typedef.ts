import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type Currency {
    _id: ID!
    type: String
  }
  ########## OPERATIONS ##########
  extend type Query {
    getCurrencies(pagination: Pagination, filters: GlobalFilters): [Currency]!
    getCurrency(_id: ID!): Currency!
    getCurrenciesCount(filters: GlobalFilters): Int
  }
  ########## INPUTS & ENUMS ##########
`

export default typeDef
