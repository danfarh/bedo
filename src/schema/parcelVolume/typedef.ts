import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type ParcelVolume {
    _id: ID!
    name: String!
    value: Float
    order: Int
    typeOfAttribute: ParcelVolumeTypeOfAttribute
    createdAt: Date
    updatedAt: Date
    isDeleted: Boolean
  }
  ########## OPERATIONS ##########
  extend type Query {
    getParcelVolumes(pagination: Pagination, filters: ParcelVolumeFilters): [ParcelVolume]!
    getParcelVolume(_id: ID!): ParcelVolume!
    getParcelVolumesCount(filters: GlobalFilters): Int
    getParcelVolumesByAdmin(
      pagination: Pagination
      filters: ParcelVolumeFilters
      sort: ParcelVolumeSorts
    ): [ParcelVolume]
    getParcelVolumesByAdminCount(filters: ParcelVolumeFilters): Int
  }
  extend type Mutation {
    createParcelVolumeByAdmin(input: ParcelVolumeInput!): ParcelVolume
    updateParcelVolumeByAdmin(id: ID!, input: ParcelVolumeInput!): ParcelVolume
    removeParcelVolumeByAdmin(idSet: [ID!]!): [ParcelVolume!]!
  }
  ########## INPUTS & ENUMS ##########
  input ParcelVolumeFilters {
    _id: ID
    createdAt: Date
    updatedAt: Date
    name: String
    value: String
    typeOfAttribute: ParcelVolumeTypeOfAttribute
  }
  input ParcelVolumeInput {
    name: String!
    value: Float!
    order: Int
    typeOfAttribute: ParcelVolumeTypeOfAttribute!
  }

  input ParcelVolumeSorts {
    createdAt: Int
    updatedAt: Int
    name: Int
    value: Int
    order: Int
    typeOfAttribute: Int
  }

  enum ParcelVolumeTypeOfAttribute {
    PERCENTAGE
    NUMBER
  }
`

export default typeDef
