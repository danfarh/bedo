import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type CarBrand {
    _id: ID
    name: String
    admin: Admin
    createdAt: Date
    updatedAt: Date
  }

  ########## OPERATIONS ##########
  extend type Query {
    getCarBrand(id: ID!): CarBrand
    getCarBrands(
      pagination: Pagination
      filters: GetCarBrandsQueryInput
      sort: GetCarBrandsSort
    ): [CarBrand]
    getCarBrandsCount: Int
  }
  extend type Mutation {
    addCarBrandViaExcel(excelFile: Upload!): String
    createCarBrandByAdmin(input: CarBrandInput!): CarBrand
    updateCarBrandByAdmin(id: ID!, input: CarBrandInput!): CarBrand
    deleteCarBrandByAdmin(idSet: [ID!]!): [CarBrand!]!
  }
  ########## INPUTS & ENUMS ##########
  input CarBrandInput {
    name: String!
  }

  input GetCarBrandsSort {
    name: Int
  }

  input GetCarBrandsQueryInput {
    name: String
  }
`

export default typeDef
