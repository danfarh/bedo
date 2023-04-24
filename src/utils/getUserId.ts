import jwt from 'jsonwebtoken'
import { ApolloError } from 'apollo-server-express'

import { JWT_SECRET } from '../config'

export default function authenticate(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded
  } catch (err) {
    return new ApolloError(err)
  }
}
