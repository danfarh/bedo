import * as rules from '../rules'

const permissions = {
  Query: {
    // getHelp: rules.isAuthenticated,
    // getHelps: rules.isAuthenticated,
    // getHelpsCount: rules.isAuthenticated,
    getHelpByAdmin: rules.isAdmin,
    getHelpsByAdmin: rules.isAdmin,
    getHelpsCountByAdmin: rules.isAdmin
  },
  Mutation: {
    createHelpByAdmin: rules.isAdmin,
    updateHelpByAdmin: rules.isAdmin,
    removeHelpByAdmin: rules.isAdmin
  }
}

export default permissions
