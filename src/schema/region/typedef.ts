import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type Region {
    _id: ID
    name: String
  }
  ########## OPERATIONS ##########
  extend type Query {
    getRegions(pagination: Pagination, sort: RegionSort): [Region]
    getRegionsCount: Int
  }
  extend type Mutation {
    addRegion(RegionInput: [String]): Boolean
    updateRegion(id: ID, name: String): Region
    removeRegion(id: ID): Region
  }
  ########## INPUTS & ENUMS ##########
  input RegionSort {
    name: Int
  }
`

export default typeDef
