import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type Log {
    log: String
    when: String
  }
  ########## OPERATIONS ##########
  extend type Query {
    getLogs(): [Log]
  }

`

export default typeDef
