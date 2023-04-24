import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########

  type Permission {
    _id: ID!
    name: String!
    description: String
  }
  ########## OPERATIONS ##########
  extend type Query {
    permission(_id: ID!): Permission!
    permissions(where: PermissionWhereInput, skip: Int, limit: Int): [Permission]!
    getAllpermissionsByAdmin(
      filters: getPermissionsByAdminQuery
      pagination: Pagination
    ): [Permission]
    getAllpermissionsByAdminCount(filters: getPermissionsByAdminQuery): Int
  }
  extend type Mutation {
    createPermissionByAdmin(data: PermissionUpsertInput!): Permission!
    updatePermissionByAdmin(data: PermissionUpsertInput!, whereId: ID!): Permission!
  }
  ########## INPUTS & ENUMS ##########
  input PermissionUpsertInput {
    name: String!
    description: String
  }
  input getPermissionsByAdminQuery {
    _id: ID
    name: String
    description: String
  }
  input PermissionWhereInput {
    _id: ID
    name: String
    name_contains: String
    description: String
    description_contains: String
  }
`

export default typeDef
