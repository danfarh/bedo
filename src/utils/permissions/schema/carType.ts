import * as rules from '../rules'

const permissions = {
  Query: {
    getCarTypes: rules.isAuthenticated,
    getCarType: rules.isAuthenticated,
    getCarTypesCount: rules.isAuthenticated,
    getCarTypesByAdmin: rules.isAdmin,
    getCarTypeByAdmin: rules.isAdmin,
    getCarTypesCountByAdmin: rules.isAdmin
  }
}

export default permissions
