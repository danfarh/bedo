import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type Advertisement {
    _id: ID
    title: String
    description: String
    photoUrl: Upload
    redirectTo: String
    startAt: Date
    endAt: Date
    updatedAt: Date
    createdAt: Date
    isDeleted: Boolean
  }

  type MultiLanguageAdvertisement {
    _id: ID
    title: [MultiLanguageField!]!
    description: [MultiLanguageField!]!
    photoUrl: Upload
    redirectTo: String
    startAt: Date
    endAt: Date
    updatedAt: Date
    createdAt: Date
    isDeleted: Boolean
  }

  ########## OPERATIONS ##########
  extend type Query {
    getSingleAdvertisement(id: ID!): Advertisement
    getAdvertisements(pagination: Pagination, filters: GetAdvertisementsQueryInput): [Advertisement]
    getSingleAdvertisementByAdmin(id: ID!): MultiLanguageAdvertisement
    getAdvertisementsByAdmin(
      pagination: Pagination
      filters: GetAdvertisementsQueryInput
    ): [MultiLanguageAdvertisement]
  }
  extend type Mutation {
    createAdvertisementByAdmin(input: AdvertisementInput!): MultiLanguageAdvertisement
    updateAdvertisementByAdmin(id: ID!, input: AdvertisementInput!): MultiLanguageAdvertisement
    removeAdvertisementByAdmin(idSet: [ID!]!): [MultiLanguageAdvertisement!]!
  }
  ########## INPUTS & ENUMS ##########
  input AdvertisementInput {
    description: [MultiLanguageInput!]
    title: [MultiLanguageInput!]!
    redirectTo: String!
    photoUrl: String!
    startAt: Date
    endAt: Date
  }

  input GetAdvertisementsQueryInput {
    title: String
    description: String
    redirectTo: String
    startAt: Date
    endAt: Date
    onlyActiveAds: Boolean
  }
`

export default typeDef
