import * as rules from '../rules'

const permissions = {
  Query: {
    getReqCarTypesByAdmin: rules.isAdmin,
    getReqCarTypesByAdminCount: rules.isAdmin,
    getReqCarTypes: rules.isAuthenticated,
    getReqCarType: rules.isAuthenticated,
    getReqCarTypesCount: rules.isAuthenticated
  },
  Mutation: {
    updateReqCarTypeByAdmin: rules.isAdmin
  }
}

export default permissions
