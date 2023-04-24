import { AuthenticationError } from 'apollo-server-express'
import controller from './controller'
import checkIfUserExists from '../../utils/checkIfUserExists'
import checkIfUserIsAdmin from '../../utils/checkIfUserIsAdmin'

// async (parent, { paramas }, { contex })
// contex from server.ts line 68

const resolver: any = {
  Query: {
    getSingleAdvertisement: async (_, { id }, { language }): Promise<Object> => {
      return controller.getSingleAdvertisement(id, language)
    },
    getAdvertisements: async (_, { pagination, filters }, { language }): Promise<Object> => {
      return controller.getAdvertisements(pagination, { ...filters, isDeleted: false }, language)
    },
    getSingleAdvertisementByAdmin: async (_, { id }): Promise<Object> => {
      return controller.getSingleAdvertisementByAdmin(id)
    },
    getAdvertisementsByAdmin: async (_, { pagination, filters }): Promise<Object> => {
      return controller.getAdvertisementsByAdmin(pagination, { ...filters, isDeleted: false })
    }
  },
  Mutation: {
    createAdvertisementByAdmin: async (_, { input }, { user }): Promise<Object> => {
      return controller.createAdvertisementByAdmin(input, user.userId)
    },
    updateAdvertisementByAdmin: async (_, { id, input }, { user }): Promise<Object> => {
      return controller.updateAdvertisementByAdmin(id, input)
    },
    removeAdvertisementByAdmin: async (_, { idSet }, { user }): Promise<Object> => {
      return controller.removeAdvertisementByAdmin(idSet)
    }
  }
}

export default resolver
