import { AuthenticationError } from 'apollo-server-express'
import controller from './controller'
import adminService from '../admin/service'

// async (parent, { paramas }, { contex })
// contex from server.ts line 68

const resolver: any = {
  Query: {
    getSingleDriverHowItWorks: async (_, { id }, { language }): Promise<Object> => {
      return controller.getSingleDriverHowItWorks(id, language)
    },
    getDriverHowItWorks: async (_, { pagination, filters }, { language }): Promise<Object> => {
      return controller.getDriverHowItWorks(pagination, { ...filters, isDeleted: false }, language)
    },
    getDriverHowItWorksCount: async (parent, { filters }, { language }) => {
      return controller.getDriverHowItWorksCount({ ...filters, isDeleted: false }, language)
    },
    getSingleDriverHowItWorksByAdmin: async (_, { id }, { user }): Promise<Object> => {
      return controller.getSingleDriverHowItWorksByAdmin(id)
    },
    getDriverHowItWorksByAdmin: async (_, { pagination, filters }, { user }): Promise<Object> => {
      return controller.getDriverHowItWorksByAdmin(pagination, { ...filters, isDeleted: false })
    },
    getDriverHowItWorksCountByAdmin: async (parent, { filters }) => {
      return controller.getDriverHowItWorksCountByAdmin({ ...filters, isDeleted: false })
    }
  },
  Mutation: {
    createDriverHowItWorksByAdmin: async (_, { input }, { user }): Promise<Object> => {
      return controller.createDriverHowItWorksByAdmin(input)
    },
    updateDriverHowItWorksByAdmin: async (_, { id, input }, { user }): Promise<Object> => {
      return controller.updateDriverHowItWorksByAdmin(id, input)
    },
    removeDriverHowItWorksByAdmin: async (_, { idSet }, { user }): Promise<Object> => {
      return controller.removeDriverHowItWorksByAdmin(idSet)
    }
  }
}
export default resolver
