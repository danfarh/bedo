import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type DriverHowItWorks {
    _id: ID
    title: String
    description: String
    createdAt: Date
    updatedAt: Date
  }
  type MultiLanguageDriverHowItWorks {
    _id: ID
    title: [MultiLanguageField]
    description: [MultiLanguageField]
    createdAt: Date
    updatedAt: Date
  }
  ########## OPERATIONS ##########
  extend type Query {
    getSingleDriverHowItWorks(id: ID!): DriverHowItWorks
    getDriverHowItWorks(
      pagination: Pagination
      filters: GetDriverHowItWorksQuery
    ): [DriverHowItWorks]
    getDriverHowItWorksCount(filters: GetDriverHowItWorksQuery): Int
    getSingleDriverHowItWorksByAdmin(id: ID!): MultiLanguageDriverHowItWorks
    getDriverHowItWorksByAdmin(
      pagination: Pagination
      filters: GetDriverHowItWorksQuery
    ): [MultiLanguageDriverHowItWorks]
    getDriverHowItWorksCountByAdmin(filters: GetDriverHowItWorksQuery): Int
  }
  extend type Mutation {
    createDriverHowItWorksByAdmin(input: DriverHowItWorksInput!): MultiLanguageDriverHowItWorks
    updateDriverHowItWorksByAdmin(
      id: ID!
      input: DriverHowItWorksInput!
    ): MultiLanguageDriverHowItWorks
    removeDriverHowItWorksByAdmin(idSet: [ID!]!): [MultiLanguageDriverHowItWorks!]!
  }
  ########## INPUTS & ENUMS ##########
  input DriverHowItWorksInput {
    title: [MultiLanguageInput!]!
    description: [MultiLanguageInput!]!
  }

  input GetDriverHowItWorksQuery {
    title: String
    description: String
  }
`

export default typeDef
