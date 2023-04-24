import * as rules from '../rules'

const permissions = {
  Query: {
    getPaymentMethodStatus: rules.isAuthenticated,
    getPayments: rules.isAuthenticated,
    getPayment: rules.isAuthenticated,
    getPaymentsCount: rules.isAuthenticated,
    getDriverPayments: rules.isDriver,
    getDriverPayment: rules.isDriver,
    getShopPayments: rules.isShopAdmin,
    getShopPaymentsCount: rules.isShopAdmin,
    getShopPayment: rules.isShopAdmin,
    getPaymentsByAdmin: rules.isAdmin,
    getPaymentsByAdminCount: rules.isAdmin,
    getPaymentTakingsByAdmin: rules.isAdmin,
    getDriverPaymentDetailByAdmin: rules.isAdmin,
    getShopPaymentDetailByAdmin: rules.isAdmin,
    getPaymentInfoByAdmin: rules.isAdmin,
    getPaymentInfoByAdminCount: rules.isAdmin,
    getBedoTotalPaymentByAdmin: rules.isAdmin
  },
  Mutation: {
    createPayment: rules.isAdmin,
    updatePayment: rules.isAdmin,
    manualResolvePayment: rules.isAdmin,
    deletePayment: rules.isAdmin,
    updatePaymentTypeByAdmin: rules.isAdmin
  }
}

export default permissions
