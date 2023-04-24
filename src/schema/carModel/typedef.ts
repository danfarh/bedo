import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type CarModel {
    _id: ID
    name: String
    brand: CarBrand
    admin: Admin
    createdAt: Date
    updatedAt: Date
    isDeleted: Boolean
  }

  ########## OPERATIONS ##########
  extend type Query {
    getCarModel(id: ID!): CarModel
    getCarModels(pagination: Pagination, filters: GetCarModelsQueryInput): [CarModel]
    getCarModelsCount(filters: GetCarModelsQueryInput): Int
  }
  extend type Mutation {
    addCarModelViaExcel(excelFile: Upload!): String
    createCarModelByAdmin(input: CarModelInput!): CarModel
    updateCarModelByAdmin(id: ID!, input: CarModelInput!): CarModel
    deleteCarModelByAdmin(idSet: [ID!]!): [CarModel!]!
  }
  ########## INPUTS & ENUMS ##########
  input CarModelInput {
    name: String!
    brand: ID!
  }

  input GetCarModelsQueryInput {
    name: String
    brand: ID
    _id: ID
  }
`

export default typeDef
