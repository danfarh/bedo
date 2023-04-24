import { AuthenticationError } from 'apollo-server-express'
import controller from './controller'
import adminService from '../admin/service'

const resolver: any = {
  Query: {
    getCarColor: async (_, { id }, { language }): Promise<Object> => {
      return controller.getCarColor(id, language)
    },
    getCarColors: async (_, { pagination, filters }, { language }): Promise<Object> => {
      return controller.getCarColors(pagination, filters, language)
    },
    getCarColorsCount: async (parent, { filters }, { language }) => {
      return controller.getCarColorsCount(filters, language)
    },
    getCarColorByAdmin: async (_, { id }, { user }): Promise<Object> => {
      return controller.getCarColorByAdmin(id)
    },
    getCarColorsByAdmin: async (_, { pagination, filters }, { user }): Promise<Object> => {
      return controller.getCarColorsByAdmin(pagination, filters)
    },
    getCarColorsCountByAdmin: async (parent, { filters }) => {
      return controller.getCarColorsCountByAdmin(filters)
    }
  },
  Mutation: {
    addCarColorViaExcel: async (_, { excelFile }, { user }): Promise<Object> => {
      return controller.addCarColorViaExcel(excelFile, user)
    },
    createCarColorByAdmin: async (_, { input }, { user }): Promise<Object> => {
      return controller.createCarColorByAdmin(input, user.sub)
    },
    updateCarColorByAdmin: async (_, { id, input }, { user }): Promise<Object> => {
      return controller.updateCarColorByAdmin(id, input)
    },
    deleteCarColorByAdmin: async (_, { idSet }, { user }): Promise<Object> => {
      return controller.deleteCarColorByAdmin(idSet)
    }
  },
  CarColor: {
    async admin(parent, args, { user }) {
      if (user && user.roles === 'SUPER_ADMIN') {
        return adminService.findById(parent.admin)
      }
      return null
    }
  }
}

export default resolver
