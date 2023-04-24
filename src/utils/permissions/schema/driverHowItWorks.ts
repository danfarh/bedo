import * as rules from '../rules'

const permissions = {
  Query: {
    // getSingleDriverHowItWorks: rules.isAuthenticated,
    // getDriverHowItWorks: rules.isAuthenticated,
    // getDriverHowItWorksCount: rules.isAuthenticated,
    getSingleDriverHowItWorksByAdmin: rules.isAdmin,
    getDriverHowItWorksByAdminF: rules.isAdmin,
    getDriverHowItWorksCountByAdminF: rules.isAdmin
  },
  Mutation: {
    createDriverHowItWorksByAdmin: rules.isAdmin,
    updateDriverHowItWorksByAdmin: rules.isAdmin,
    removeDriverHowItWorksByAdmin: rules.isAdmin
  }
}

export default permissions
