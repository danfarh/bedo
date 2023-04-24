import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type AttributeGroup {
    _id: ID!
    rootCategory: Category
    name: String
    attributes: [Attribute]
    createdAt: Date
    updatedAt: Date
    isDeleted: Boolean
  }
  ########## OPERATIONS ##########
  extend type Query {
    getAttributeGroups(pagination: Pagination, filters: GetAttributesQueryInput): [AttributeGroup]!
    getAttributeGroup(_id: ID!): AttributeGroup!
    getAttributeGroupsCount(filters: GetAttributesQueryInput): Int
    getAttributeGroupsByAdmin(
      filters: getAttributeGroupsByAdminQuery
      pagination: Pagination
      sort: getAttributeGroupsByAdminSort
    ): [AttributeGroup]
    getAttributeGroupByAdmin(_id: ID!): AttributeGroup
    getAttributeGroupsByAdminCount(filters: getAttributeGroupsByAdminQuery): Int
  }
  extend type Mutation {
    createAttributeGroupByAdmin(
      input: CreateAttributeGroupByAdminInput!
      attributes: [ID]
    ): AttributeGroup
    updateAttributeGroupByAdmin(_id: ID!, input: CreateAttributeGroupByAdminInput!): AttributeGroup
    addAttributesToAttributeGroupByAdmin(_id: ID!, attributes: [ID]): AttributeGroup
    removeAttributesFromAttributeGroupByAdmin(_id: ID!, attributes: [ID]): AttributeGroup
    deleteAttributeGroupByAdmin(idSet: [ID!]!): [AttributeGroup!]!
  }
  ########## INPUTS & ENUMS ##########
  input CreateAttributeGroupByAdminInput {
    rootCategory: ID!
    name: String!
  }
  input getAttributeGroupsByAdminQuery {
    name: String
    rootCategory: ID
    _id: ID
  }

  input GetAttributesQueryInput {
    name: String
    rootCategory: ID
    _id: ID
  }
  input getAttributeGroupsByAdminSort {
    createdAt: Int
    updatedAt: Int
  }
`

export default typeDef
