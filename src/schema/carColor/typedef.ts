import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type CarColor {
    _id: ID
    code: String
    name: String
    admin: Admin
    createdAt: Date
    updatedAt: Date
    isDeleted: Boolean
  }

  type MultiLanguageCarColor {
    _id: ID
    code: String
    name: [MultiLanguageField!]
    admin: Admin
    createdAt: Date
    updatedAt: Date
    isDeleted: Boolean
  }

  ########## OPERATIONS ##########
  extend type Query {
    getCarColor(id: ID!): CarColor
    getCarColors(pagination: Pagination, filters: GetCarColorsQueryInput): [CarColor]
    getCarColorsCount(filters: GetCarColorsQueryInput): Int
    getCarColorByAdmin(id: ID!): MultiLanguageCarColor
    getCarColorsByAdmin(
      pagination: Pagination
      filters: GetCarColorsQueryInput
    ): [MultiLanguageCarColor]
    getCarColorsCountByAdmin(filters: GetCarColorsQueryInput): Int
  }
  extend type Mutation {
    addCarColorViaExcel(excelFile: Upload!): String
    createCarColorByAdmin(input: CarColorInput!): MultiLanguageCarColor
    updateCarColorByAdmin(id: ID!, input: CarColorInput!): MultiLanguageCarColor
    deleteCarColorByAdmin(idSet: [ID!]!): [MultiLanguageCarColor!]!
  }
  ########## INPUTS & ENUMS ##########
  input CarColorInput {
    name: [MultiLanguageInput!]!
    code: String!
  }

  input GetCarColorsQueryInput {
    name: String
    code: String
  }
`

export default typeDef
