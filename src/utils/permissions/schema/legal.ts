import * as rules from '../rules'

const permissions = {
  Query: {
    getLegalByAdmin: rules.isAdmin,
    getLegalsByAdmin: rules.isAdmin,
    getLegalsCountByAdmin: rules.isAdmin
  },
  Mutation: {
    createLegalByAdmin: rules.isAdmin,
    updateLegalByAdmin: rules.isAdmin,
    removeLegalByAdmin: rules.isAdmin
  }
}

export default permissions
