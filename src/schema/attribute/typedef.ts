import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type Attribute {
    _id: ID!
    attributeGroup: AttributeGroup
    name: String
    isDeleted: Boolean
  }
  ########## OPERATIONS ##########
  extend type Query {
    getAttributes(pagination: Pagination, filters: GlobalFilters): [Attribute]!
    getAttribute(_id: ID!): Attribute!
    getAttributesCount(filters: GlobalFilters): Int!
  }
  extend type Mutation {
    createAttributeByAdmin(inputs: CreateAttributeInput!): Attribute
    updateAttributeByAdmin(id: ID!, inputs: CreateAttributeInput!): Attribute
    deleteAttributeByAdmin(idSet: [ID!]!): [Attribute!]!
  }
  ########## INPUTS & ENUMS ##########

  input CreateAttributeInput {
    attributeGroup: ID!
    name: String!
  }
`

export default typeDef
