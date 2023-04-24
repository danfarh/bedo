import { AuthenticationError } from 'apollo-server-express'
import controller from './controller'

const resolver: any = {
  Query: {
    getErrorByAdmin: async (_, { id }, { user }): Promise<Object> => {
      return controller.getErrorByAdmin(id)
    },
    getErrorsByAdmin: async (_, { pagination, filters }, { user }): Promise<Object> => {
      return controller.getErrorsByAdmin(pagination, { ...filters, isDeleted: false })
    }
  },
  Mutation: {
    createErrorByAdmin: async (_, { input }, { user }): Promise<Object> => {
      return controller.createErrorByAdmin(input)
    },
    updateErrorByAdmin: async (_, { id, input }, { user }): Promise<Object> => {
      return controller.updateErrorByAdmin(id, input)
    },
    removeErrorByAdmin: async (_, { idSet }, { user }): Promise<Object> => {
      return controller.removeErrorByAdmin(idSet)
    }
  }
}

export default resolver
