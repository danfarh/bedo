import * as rules from '../rules'

const permissions = {
  Query: {
    // getSingleshopHowItWorks: rules.isAuthenticated,
    // getshopHowItWorks: rules.isAuthenticated,
    // getshopHowItWorksCount: rules.isAuthenticated,
    getSingleShopHowItWorksByAdmin: rules.isAdmin,
    getShopHowItWorksByAdmin: rules.isAdmin,
    getShopHowItWorksCountByAdmin: rules.isAdmin
  },
  Mutation: {
    createShopHowItWorksByAdmin: rules.isAdmin,
    updateShopHowItWorksByAdmin: rules.isAdmin,
    removeShopHowItWorksByAdmin: rules.isAdmin
  }
}

export default permissions
