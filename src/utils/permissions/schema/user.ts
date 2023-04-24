import * as rules from '../rules'

const permissions = {
  Query: {
    singleCreditCard: rules.isUser,
    creditCards: rules.isUser,
    getDefaultCreditCard: rules.isUser,
    getUserInformation: rules.isUserAuthorized,
    getUsersByAdmin: rules.isAdmin,
    getUsersByAdminCount: rules.isAdmin,
    getUserByAdmin: rules.isAdmin,
    userCheckEmailVerification: rules.isUser
  },
  Mutation: {
    addCreditCard: rules.isUser,
    updateCreditCard: rules.isUser,
    removeCreditCard: rules.isUser,
    setDefaultCreditCard: rules.isUser,
    saveLocation: rules.isUser,
    updateUser: rules.isUser,
    suspendUserByAdmin: rules.isAdmin,
    getUserChangePhoneNumberCode: rules.isUser,
    checkUserChangePhoneNumberCode: rules.isUser,
    updateUserByAdmin: rules.isAdmin
  }
}

export default permissions
