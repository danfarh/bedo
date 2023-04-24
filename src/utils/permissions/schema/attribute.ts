import * as rules from '../rules'

const permissions = {
  Query: {
    getAttributes: rules.isAuthenticated,
    getAttribute: rules.isAuthenticated,
    getAttributesCount: rules.isAuthenticated
  },
  Mutation: {
    createAttributeByAdmin: rules.isAdmin,
    updateAttributeByAdmin: rules.isAdmin,
    deleteAttributeByAdmin: rules.isAdmin
  }
}

export default permissions
