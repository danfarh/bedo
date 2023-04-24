import * as rules from '../rules'

const permissions = {
  Query: {
    getShopsByAdmin: rules.isAdmin,
    getShopsByAdminCount: rules.isAdmin,
    getShopByAdmin: rules.isAdmin,
    getShops: rules.isUser,
    getShop: rules.isUser,
    getShopsCount: rules.isUser,
    getSalaryByShopAdmin: rules.isShopAdmin,
    getShopByShopAdmin: rules.isShopAdmin,
    checkIfUserIsInShopZone: rules.isUser,
    getLocationByAddress: rules.isAuthenticated,
    getSearchShops: rules.isUser,
    getSearchShopsCount: rules.isUser,
    getShopDeliveryByShopAdmin: rules.isShopAdmin
  },
  Mutation: {
    createShopByShopAdmin: rules.isShopAdmin,
    updateShopByShopAdmin: rules.isShopAdmin,
    verifyShop: rules.isAdmin,
    rejectShopByAdmin: rules.isAdmin,
    createShopByAdmin: rules.isAdmin,
    deleteShopByAdmin: rules.isAdmin
  }
}

export default permissions
