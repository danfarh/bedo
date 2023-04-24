import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type Constant {
    _id: ID
    attribute: String
    value: String
    description: String
    typeOfAttribute: ConstantTypeOfAttribute
    createdAt: Date
    updatedAt: Date
  }

  type paymentMethodsStatus {
    isCashMethodActive: Boolean
    isCreditMethodActive: Boolean
  }

  ########## OPERATIONS ##########
  extend type Query {
    getConstants(pagination: Pagination, filters: ConstantFilter): [Constant]!
    getConstant(_id: ID!): Constant!
    getConstantsCount(filters: ConstantFilter): Int
    getConstantsByAdmin(
      filters: GetConstantByAdminFilterInput
      pagination: Pagination
      sort: GetConstantByAdminSortInput
    ): [Constant]
    getConstantsByAdminCount(filters: GetConstantByAdminFilterInput): Int
    getPaymentMethodsStatus: paymentMethodsStatus!
  }
  extend type Mutation {
    updateConstantByAdmin(filters: ConstantWhere, data: CreateOrUpdateConstantInput): Constant
  }
  ########## INPUTS & ENUMS ##########
  input CreateOrUpdateConstantInput {
    value: String!
    typeOfAttribute: ConstantTypeOfAttribute!
    description: String!
  }
  input ConstantWhere {
    _id: ID
    attribute: String
  }
  input ConstantFilter {
    _id: ID
    attribute: String
    value: String
    typeOfAttribute: String
  }
  input constantInput {
    attribute: String
    value: String
    typeOfAttribute: String
  }
  input GetConstantByAdminFilterInput {
    _id: ID
    attribute: String
    value: String
    typeOfAttribute: ConstantTypeOfAttribute
    description: String
  }
  input GetConstantByAdminSortInput {
    createdAt: Int
    updatedAt: Int
    attribute: Int
    typeOfAttribute: Int
    description: Int
  }

  enum ConstantTypeOfAttribute {
    PERCENTAGE
    STRING
    NUMBER
    BOOLEAN
  }
`

export default typeDef
