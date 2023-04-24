import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type shopHowItWorks {
    _id: ID
    title: String
    description: String
    createdAt: Date
    updatedAt: Date
  }
  type MultiLanguageShopHowItWorks {
    _id: ID
    title: [MultiLanguageField]
    description: [MultiLanguageField]
    createdAt: Date
    updatedAt: Date
  }
  ########## OPERATIONS ##########
  extend type Query {
    getSingleShopHowItWorks(id: ID!): shopHowItWorks
    getShopHowItWorks(pagination: Pagination, filters: getShopHowItWorksQuery): [shopHowItWorks]
    getShopHowItWorksCount(filters: getShopHowItWorksQuery): Int
    getSingleShopHowItWorksByAdmin(id: ID!): MultiLanguageShopHowItWorks
    getShopHowItWorksByAdmin(
      pagination: Pagination
      filters: getShopHowItWorksQuery
    ): [MultiLanguageShopHowItWorks]
    getShopHowItWorksCountByAdmin(filters: getShopHowItWorksQuery): Int
  }
  extend type Mutation {
    createShopHowItWorksByAdmin(input: shopHowItWorksInput!): MultiLanguageShopHowItWorks
    updateShopHowItWorksByAdmin(id: ID!, input: shopHowItWorksInput!): MultiLanguageShopHowItWorks
    removeShopHowItWorksByAdmin(idSet: [ID!]!): [MultiLanguageShopHowItWorks]!
  }
  ########## INPUTS & ENUMS ##########
  input shopHowItWorksInput {
    title: [MultiLanguageInput!]!
    description: [MultiLanguageInput!]!
  }

  input getShopHowItWorksQuery {
    title: String
    description: String
  }
`

export default typeDef
