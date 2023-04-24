import { ApolloError } from 'apollo-server-express'

export default function checkIfUserExists(user) {
  if (!user || !user.userId) throw new ApolloError('user does not exists', '401')
}
