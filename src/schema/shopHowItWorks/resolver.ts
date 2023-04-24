import { AuthenticationError } from 'apollo-server-express'
import controller from './controller'
import adminService from '../admin/service'

// async (parent, { paramas }, { contex })
// contex from server.ts line 68

const resolver: any = {
  Query: {
    getSingleShopHowItWorks: async (_, { id }, { language }): Promise<Object> => {
      return controller.getSingleShopHowItWorks(id, language)
    },
    getShopHowItWorks: async (_, { pagination, filters }, { language }): Promise<Object> => {
      return controller.getShopHowItWorks(pagination, { ...filters, isDeleted: false }, language)
    },
    getShopHowItWorksCount: async (parent, { filters }, { language }) => {
      return controller.getShopHowItWorksCount({ ...filters, isDeleted: false }, language)
    },
    getSingleShopHowItWorksByAdmin: async (_, { id }, { user }): Promise<Object> => {
      return controller.getSingleShopHowItWorksByAdmin(id)
    },
    getShopHowItWorksByAdmin: async (_, { pagination, filters }, { user }): Promise<Object> => {
      return controller.getShopHowItWorksByAdmin(pagination, { ...filters, isDeleted: false })
    },
    getShopHowItWorksCountByAdmin: async (parent, { filters }) => {
      return controller.getShopHowItWorksCountByAdmin({ ...filters, isDeleted: false })
    }
  },
  Mutation: {
    createShopHowItWorksByAdmin: async (_, { input }, { user }): Promise<Object> => {
      return controller.createShopHowItWorksByAdmin(input)
    },
    updateShopHowItWorksByAdmin: async (_, { id, input }, { user }): Promise<Object> => {
      return controller.updateShopHowItWorksByAdmin(id, input)
    },
    removeShopHowItWorksByAdmin: async (_, { idSet }, { user }): Promise<Object> => {
      return controller.removeShopHowItWorksByAdmin(idSet)
    }
  }
}
export default resolver
