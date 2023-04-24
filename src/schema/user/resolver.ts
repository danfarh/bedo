import controller from './controller'
import checkIfUserExists from '../../utils/checkIfUserExists'
import service from './service'
import adminService from '../admin/service'

const resolver = {
  Query: {
    getUserPaymentStatus: async (_, args, { user }): Promise<Object> => {
      checkIfUserExists(user)
      return controller.getUserPaymentStatus(user.sub)
    },
    userCheckEmailVerification(_, { email }, __): Promise<Object> {
      const result = controller.checkEmailVerification(email)
      return result
    },
    singleCreditCard(_, { id }, { user }): Promise<Object> {
      checkIfUserExists(user)
      const result = controller.singleCreditCard(id, user.sub)
      return result
    },
    creditCards(_, ___, { user }): Promise<Object> {
      checkIfUserExists(user)
      const result = controller.creditCards(user.sub)
      return result
    },
    getDefaultCreditCard(_, ___, { user }): Promise<Object> {
      checkIfUserExists(user)
      const result = controller.getDefaultCreditCard(user.sub)
      return result
    },
    getUserInformation(_, args, { user }): Promise<Object> {
      checkIfUserExists(user)
      const result = controller.getUserInformation(user.sub)
      return result
    },
    getUsersByAdmin: async (_, { filters, pagination, sort }, { user }) => {
      return controller.getUsersByAdmin(filters, pagination, sort)
    },
    getUsersByAdminCount: async (parent, { filters }) => {
      return controller.getUsersByAdminCount(filters)
    },
    // TODO remove in future
    async getAllUsers() {
      return service.find({})
    },
    // TODO remove in future
    getAllAdmins: async () => {
      return adminService.find({})
    },
    getUserByAdmin: async (_, { id }, { user }) => {
      return controller.getUserByAdmin(id)
    }
  },
  Mutation: {
    addCreditCard: async (_, { CreditCardInput }, { user }) => {
      checkIfUserExists(user)
      const { type } = CreditCardInput
      const result = await controller.addCreditCard(CreditCardInput, type, user.sub)
      return result
    },
    updateCreditCard: async (_, { id, CreditCardInput }, { user }) => {
      checkIfUserExists(user)
      const { type } = CreditCardInput
      const result = await controller.updateCreditCard(id, CreditCardInput, type, user.sub)
      return result
    },
    removeCreditCard: async (_, { id }, { user }) => {
      checkIfUserExists(user)
      const result = await controller.removeCreditCard(id, user.sub)
      return result
    },
    setDefaultCreditCard: async (_, { id }, { user }) => {
      checkIfUserExists(user)
      const result = await controller.setDefaultCreditCard(id, user.sub)
      return result
    },
    saveLocation(_, { location }, { user }) {
      checkIfUserExists(user)
      return controller.saveLocation(user, location)
    },
    updateUser(_, { updateUserInput }, { user }): Promise<Object> {
      checkIfUserExists(user)
      return controller.updateUserInformation(user.sub, updateUserInput)
    },
    suspendUserByAdmin: async (_, { idSet }, { user }) => {
      return controller.suspendUserSetByAdmin(idSet)
    },
    getUserChangePhoneNumberCode: async (
      _,
      { getUserChangePhoneNumberCodeInput },
      { user }
    ): Promise<Object> => {
      checkIfUserExists(user)
      const { phoneNumber, newPhoneNumber } = getUserChangePhoneNumberCodeInput
      const result = await controller.getUserChangePhoneNumberCode(
        phoneNumber,
        newPhoneNumber,
        user.sub
      )
      return result
    },
    checkUserChangePhoneNumberCode: async (
      _,
      { checkUserChangePhoneNumberCodeInput },
      { user }
    ): Promise<Object> => {
      checkIfUserExists(user)
      const {
        phoneNumber,
        newPhoneNumber,
        changePhoneNumberCode
      } = checkUserChangePhoneNumberCodeInput
      return controller.checkUserChangePhoneNumberCode(
        phoneNumber,
        newPhoneNumber,
        changePhoneNumberCode,
        user.sub
      )
    },
    updateUserByAdmin(_, { input, userId }, { user }): Promise<Object> {
      return controller.updateUserByAdmin(input, userId)
    }
  }
}

export default resolver
