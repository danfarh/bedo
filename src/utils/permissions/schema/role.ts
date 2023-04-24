import * as rules from '../rules'

const permissions = {
  Query: {
    roles: rules.isAdmin,
    role: rules.isAdmin
  },
  Mutation: {
    createRoleByAdmin: rules.isAdmin,
    updateRoleByAdmin: rules.isAdmin
  }
}

export default permissions
