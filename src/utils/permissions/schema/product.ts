import * as rules from '../rules'

const permissions = {
  Query: {
    getProductsByAdmin: rules.isAdmin,
    getProductByAdmin: rules.isAdmin,
    getProductsByAdminCount: rules.isAdmin,
    getProductsByShopAdmin: rules.isShopAdmin,
    getProductByShopAdmin: rules.isShopAdmin,
    getProductsByShopAdminCount: rules.isShopAdmin,
    getProducts: rules.isAuthenticated,
    getProduct: rules.isAuthenticated,
    getProductsCount: rules.isAuthenticated,
    getSearchProducts: rules.isUser,
    getSearchProductsCount: rules.isUser
  },
  Mutation: {
    createProductByAdmin: rules.isAdmin,
    updateProductByAdmin: rules.isAdmin,
    removeProductByAdmin: rules.isAdmin,
    createProductByShopAdmin: rules.isShopAdmin,
    updateProductByShopAdmin: rules.isShopAdmin,
    removeProductByShopAdmin: rules.isShopAdmin,
    addProductViaExcel: rules.isShopAdmin
    // deleteProductByAdmin: rules.isAdmin
  }
}

export default permissions
