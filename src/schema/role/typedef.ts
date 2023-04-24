import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type Role {
    id: ID!
    name: String!
    description: String!
    permissions: [Permission]
  }
  ########## OPERATIONS ##########
  extend type Query {
    role(id: ID!): Role!
    roles(where: RoleWhereInput, skip: Int, limit: Int): [Role]!
  }
  extend type Mutation {
    createRoleByAdmin(data: RoleUpsertInput!): Role!
    updateRoleByAdmin(data: RoleUpsertInput!, whereId: ID!): Role!
  }
  ########## INPUTS & ENUMS ##########
  input RoleUpsertInput {
    name: String!
    description: String
    permissions: [ID!]!
  }

  input RoleWhereInput {
    id: ID
    name: String
    name_contains: String
    description: String
    description_contains: String
    permissions_in: [ID]
  }
`

export default typeDef
