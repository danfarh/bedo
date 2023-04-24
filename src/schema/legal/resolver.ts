import { AuthenticationError } from 'apollo-server-express'
import controller from './controller'
import adminService from '../admin/service'

// async (parent, { paramas }, { contex })
// contex from server.ts line 68

const resolver: any = {
  Query: {
    getLegal: async (_, { id }, { language }): Promise<Object> => {
      return controller.getLegal(id, language)
    },
    getLegals: async (_, { pagination, filters, sort }, { language }): Promise<Object> => {
      return controller.getLegals(pagination, { ...filters, isDeleted: false }, sort, language)
    },
    getLegalsCount: async (parent, { filters }, { language }) => {
      return controller.getLegalsCount(filters, language)
    },
    getLegalByAdmin: async (_, { id }): Promise<Object> => {
      return controller.getLegalByAdmin(id)
    },
    getLegalsByAdmin: async (_, { pagination, filters, sort }): Promise<Object> => {
      return controller.getLegalsByAdmin(pagination, { ...filters, isDeleted: false }, sort)
    },
    getLegalsCountByAdmin: async (parent, { filters }) => {
      return controller.getLegalsCountByAdmin(filters)
    }
  },
  Mutation: {
    createLegalByAdmin: async (_, { input }, { user }): Promise<Object> => {
      console.log(input)
      return controller.createLegalByAdmin(input, user.sub)
    },
    updateLegalByAdmin: async (_, { id, input }): Promise<Object> => {
      return controller.updateLegalByAdmin(id, input)
    },
    removeLegalByAdmin: async (_, { idSet }, { user }): Promise<Object> => {
      return controller.removeLegalByAdmin(idSet)
    }
  },
  Legal: {
    async admin(parent, args, { user }) {
      if (user && user.roles === 'SUPER_ADMIN') {
        return adminService.findById(parent.admin)
      }
      return null
    }
  }
}
export default resolver
