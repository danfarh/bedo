import * as rules from '../rules'

const permissions = {
  Query: {
    getAttributeGroupsByAdmin: rules.isAdmin,
    getAttributeGroupByAdmin: rules.isAdmin,
    getAttributeGroupsByAdminCount: rules.isAdmin,
    getAttributeGroups: rules.isAuthenticated,
    getAttributeGroup: rules.isAuthenticated,
    getAttributeGroupsCount: rules.isAuthenticated
  },
  Mutation: {
    createAttributeGroupByAdmin: rules.isAdmin,
    updateAttributeGroupByAdmin: rules.isAdmin,
    addAttributesToAttributeGroupByAdmin: rules.isAdmin,
    removeAttributesFromAttributeGroupByAdmin: rules.isAdmin,
    deleteAttributeGroupByAdmin: rules.isAdmin
  }
}

export default permissions
