import { ApolloError } from 'apollo-server-express'
import checkIfUserExists from './checkIfUserExists'

export default function checkIfUserIsAdmin(user) {
  checkIfUserExists(user)
  if (!user.roles || user.roles !== 'SUPER_ADMIN')
    throw new ApolloError('you do not have permission for this action')
}

export function checkIfRelatedToAdmin(path) {
  if (String(path.key).includes('ByAdmin')) return true
  while (path.prev !== undefined) {
    path = path.prev
    if (String(path.key).includes('ByAdmin')) return true
  }
  return false
}
