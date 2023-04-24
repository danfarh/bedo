import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type File {
    url: String!
  }

  ########## OPERATIONS ##########
  extend type Query {
    _: Boolean
  }

  extend type Mutation {
    uploadFile(data: uploadInput): File!
  }

  ########## INPUTS & ENUMS ##########
  input uploadInput {
    file: Upload!
    folderName: String!
  }
`

export default typeDef
