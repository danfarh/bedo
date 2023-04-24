import * as rules from '../rules'

const permissions = {
  Query: {
    getShopMenu: rules.isAuthenticated,
    getShopMenuByShopAdmin: rules.isShopAdmin,
    getSubMenuProductsByAdmin: rules.isAdmin,
    getSubMenuProductsByShopAdmin: rules.isShopAdmin
  },
  Mutation: {
    createShopMenuByAdmin: rules.isAdmin,
    createSubMenuByAdmin: rules.isAdmin,
    updateShopMenuByAdmin: rules.isAdmin,
    updateSubMenuByAdmin: rules.isAdmin,
    removeShopMenuProductByAdmin: rules.isAdmin,
    removeShopMenuItemsByAdmin: rules.isAdmin,
    createShopMenuByShopAdmin: rules.isShopAdmin,
    createSubMenuByShopAdmin: rules.isShopAdmin,
    updateSubMenuByShopAdmin: rules.isShopAdmin,
    updateShopMenuByShopAdmin: rules.isShopAdmin,
    removeShopMenuProductByShopAdmin: rules.isShopAdmin,
    removeShopMenuItemsByShopAdmin: rules.isShopAdmin
  }
}

export default permissions
