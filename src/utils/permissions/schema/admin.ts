import * as rules from '../rules'

export default {
  Query: {
    getWaitingVerificationStateShopAdminsByAdmin: rules.isAdmin,
    getWaitingVerificationStateShopAdminsByAdminCount: rules.isAdmin,
    getAdminsByAdmin: rules.isAdmin,
    getAdminsByAdminCount: rules.isAdmin,
    getAdminByAdmin: rules.isAdmin,
    getAdminInformation: rules.isAdmin
  },
  Mutation: {
    updateShopAdminVerificationStateByAdmin: rules.isAdmin,
    updateAdminRoles: rules.isAdmin,
    createAdminByAdmin: rules.isAdmin,
    updateAdminByAdmin: rules.isAdmin,
    changeShopAdminPassword: rules.isShopAdmin,
    suspendAdminByAdmin: rules.isAdmin,
    deleteAdminBySystemAdmin: rules.isAdmin
  }
}
