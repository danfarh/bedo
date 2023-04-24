import * as rules from '../rules'

export default {
  Query: {
    getTransactions: rules.isUser,
    getDriverTransactions: rules.isDriver,
    getShopTransactions: rules.isShopAdmin,
    getShopTransactionsCount: rules.isShopAdmin,
    getTransactionsByAdmin: rules.isAdmin,
    getTransactionsByAdminCount: rules.isAdmin,
    getTransactionsByShopAdmin: rules.isShopAdmin,
    getTotalTransactionsAmountByShopAdmin: rules.isShopAdmin
  },
  Mutation: {
    createTransactionByDriver: rules.isDriver,
    createTransactionByShop: rules.isShopAdmin,
    createTransactionByAdmin: rules.isAdmin,
    refundTransactionByAdmin: rules.isAdmin,
    createTransactionFromDriverToBedo: rules.isDriver,
    createTransactionFromShopToBedo: rules.isShopAdmin
  }
}
