import * as rules from '../rules'

export default {
  Query: {
    getConstantsByAdmin: rules.isAdmin,
    getConstantsByAdminCount: rules.isAdmin,
    getConstants: rules.isAuthenticated,
    getConstant: rules.isAuthenticated,
    getConstantsCount: rules.isAuthenticated,
    getPaymentMethodsStatus: rules.isUser
  },
  Mutation: {
    updateConstantByAdmin: rules.isAdmin
  }
}
