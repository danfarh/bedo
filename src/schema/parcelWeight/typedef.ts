import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type ParcelWeight {
    _id: ID!
    name: String!
    value: Float
    order: Int
    typeOfAttribute: ParcelWeightTypeOfAttribute
    createdAt: Date
    updatedAt: Date
    isDeleted: Boolean
  }
  ########## OPERATIONS ##########
  extend type Query {
    getParcelWeights(pagination: Pagination, filters: ParcelWeightFilters): [ParcelWeight]!
    getParcelWeight(_id: ID!): ParcelWeight!
    getParcelWeightsCount(filters: GlobalFilters): Int
    getParcelWeightsByAdmin(
      pagination: Pagination
      filters: ParcelWeightFilters
      sort: ParcelWeightSorts
    ): [ParcelWeight]
    getParcelWeightsByAdminCount(filters: ParcelWeightFilters): Int
  }
  extend type Mutation {
    createParcelWeightByAdmin(input: ParcelWeightInput!): ParcelWeight
    updateParcelWeightByAdmin(id: ID!, input: ParcelWeightInput!): ParcelWeight
    removeParcelWeightByAdmin(idSet: [ID!]!): [ParcelWeight!]!
  }
  ########## INPUTS & ENUMS ##########
  input ParcelWeightFilters {
    _id: ID
    createdAt: Date
    updatedAt: Date
    name: String
    value: Float
    typeOfAttribute: ParcelWeightTypeOfAttribute
  }

  input ParcelWeightSorts {
    createdAt: Int
    updatedAt: Int
    typeOfAttribute: Int
    value: Int
    name: String
  }

  input ParcelWeightInput {
    name: String!
    value: Float!
    order: Int
    typeOfAttribute: ParcelWeightTypeOfAttribute!
  }

  enum ParcelWeightTypeOfAttribute {
    PERCENTAGE
    NUMBER
  }
`

export default typeDef
