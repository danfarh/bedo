import controller from './controller'
import RoleService from '../role/service'
import shopService from '../shop/service'

const resolver: any = {
  Query: {
    checkShopAdminPhoneVerificationCode: async (_, { input }, __): Promise<Object> => {
      return controller.checkShopAdminPhoneVerificationCode(input)
    },
    adminCheckEmail: async (_, { email }, __): Promise<Object> => {
      return controller.adminCheckEmail(email)
    },
    getWaitingVerificationStateShopAdminsByAdmin: async (
      _,
      { filters, pagination, sort },
      __
    ): Promise<Object> => {
      return controller.getWaitingVerificationStateShopAdminsByAdmin(filters, pagination, sort)
    },
    getWaitingVerificationStateShopAdminsByAdminCount: async (parent, { filters }) => {
      return controller.getWaitingVerificationStateShopAdminsByAdminCount(filters)
    },
    getAdminsByAdmin: async (parent, { filters, sort, pagination }) => {
      return controller.getAdminsByAdmin(filters, pagination, sort)
    },
    getAdminsByAdminCount: async (parent, { filters }) => {
      return controller.getAdminsByAdminCount(filters)
    },
    getNewAccessTokenByAdmin: async (_, { refreshToken }, { user }) => {
      return controller.generateNewTokenByAdmin(refreshToken)
    },
    getAdminInformation: async (_, args, { user }): Promise<Object> => {
      return controller.getAdminInformation(user)
    },
    getAdminByAdmin: async (_, { id }, __): Promise<Object> => {
      return controller.getAdminByAdmin(id)
    }
  },
  Mutation: {
    adminLogin: async (_, { input }, { user }): Promise<Object> => {
      return controller.adminLogin(input)
    },
    getShopAdminPhoneVerificationCode: async (_, { phoneNumber }, { user }): Promise<Object> => {
      return controller.getShopAdminPhoneVerificationCode(phoneNumber)
    },
    shopAdminSignUp: async (_, { input }, { user }): Promise<Object> => {
      return controller.shopAdminSignUp(input)
    },
    updateShopAdminVerificationStateByAdmin: async (
      _,
      { adminId, verificationState },
      __
    ): Promise<Object> => {
      return controller.updateShopAdminVerificationStateByAdmin(adminId, verificationState)
    },
    updateAdminRoles: async (parent, { input }, { user }, info) => {
      const { adminId, roles } = input
      return controller.updateAdminRoles(adminId, roles)
    },
    createAdminByAdmin: async (parent, { input }) => {
      return controller.createAdminByAdmin(input)
    },
    changeShopAdminPassword: async (parent, { input }, { user }) => {
      return controller.changeShopAdminPassword(input, user)
    },
    suspendAdminByAdmin: async (parent, { idSet }, { user }) => {
      return controller.suspendAdminByAdmin(idSet)
    },
    suspendShopByAdmin: async (parent, { idSet }, { user }) => {
      return controller.suspendShopByAdmin(idSet)
    },
    updateAdminByAdmin: async (parent, { input, adminId }, { user }) => {
      return controller.updateAdminByAdmin(input, adminId)
    },
    deleteAdminBySystemAdmin: async (parent, { idSet }, { user }) => {
      return controller.deleteAdmin(idSet, user)
    }
  },
  Admin: {
    roles: async parent => {
      return parent.roles.map(item => RoleService.findById(item))
    },
    shop: async parent => {
      return parent.type === 'SHOP-ADMIN' ? shopService.findById(parent.shop) : null
    }
  }
}

export default resolver
