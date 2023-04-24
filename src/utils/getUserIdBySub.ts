import { ApolloError } from 'apollo-server-express'
import jwt from 'jsonwebtoken'

import { JWT_SECRET } from '../config'

export default header => {
  try {
    if (header) {
      const token = header.replace('Bearer ', '')
      const decoded: any = jwt.verify(token, JWT_SECRET)
      return decoded
    }
    throw new ApolloError('token not found', '401')
  } catch (err) {
    return new ApolloError(err)
  }
}
