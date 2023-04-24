import * as rules from '../rules'

export default {
  Query: {
    getAllpermissionsByAdmin: rules.isAdmin,
    getAllpermissionsByAdminCount: rules.isAdmin,
    permissions: rules.isAdmin,
    permission: rules.isAdmin
  },
  Mutation: {
    createPermissionByAdmin: rules.isAdmin,
    updatePermissionByAdmin: rules.isAdmin
  }
}
