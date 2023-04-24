import { AuthenticationError } from 'apollo-server-express'
import controller from './controller'
import adminService from '../admin/service'

const resolver: any = {
  Query: {
    getHelp: async (_, { id }, { language }): Promise<Object> => {
      return controller.getHelp(id, language)
    },
    getHelps: async (_, { pagination, filters, sort }, { language }): Promise<Object> => {
      return controller.getHelps(pagination, { ...filters, isDeleted: false }, sort, language)
    },
    getHelpsCount: async (parent, { filters }, { language }) => {
      return controller.getHelpsCount(filters, language)
    },
    getHelpByAdmin: async (_, { id }, { user }): Promise<Object> => {
      return controller.getHelpByAdmin(id)
    },
    getHelpsByAdmin: async (_, { pagination, filters, sort }, { user }): Promise<Object> => {
      return controller.getHelpsByAdmin(pagination, { ...filters, isDeleted: false }, sort)
    },
    getHelpsCountByAdmin: async (parent, { filters }) => {
      return controller.getHelpsCountByAdmin(filters)
    }
  },
  Mutation: {
    createHelpByAdmin: async (_, { input }, { user }): Promise<Object> => {
      return controller.createHelpByAdmin(input, user.sub)
    },
    updateHelpByAdmin: async (_, { id, input }, { user }): Promise<Object> => {
      return controller.updateHelpByAdmin(id, input)
    },
    removeHelpByAdmin: async (_, { idSet }, { user }): Promise<Object> => {
      return controller.removeHelpByAdmin(idSet)
    }
  },
  Help: {
    async admin(parent, args, { user }) {
      if (user && user.roles === 'SUPER_ADMIN') {
        return adminService.findById(parent.admin)
      }
      return null
    }
  }
}

export default resolver
