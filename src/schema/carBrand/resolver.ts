import { AuthenticationError } from 'apollo-server-express'
import controller from './controller'
import adminService from '../admin/service'

const resolver: any = {
  Query: {
    getCarBrand: async (_, { id }, { user }): Promise<Object> => {
      return controller.getCarBrand(id)
    },
    getCarBrands: async (_, { pagination, filters, sort }, { user }): Promise<Object> => {
      return controller.getCarBrands(pagination, filters, sort)
    },
    getCarBrandsCount: async (): Promise<Object> => {
      return controller.getCarBrandsCount()
    }
  },
  Mutation: {
    addCarBrandViaExcel: async (_, { excelFile }, { user }): Promise<Object> => {
      return controller.addCarBrandViaExcel(excelFile, user)
    },
    createCarBrandByAdmin: async (_, { input }, { user }): Promise<Object> => {
      return controller.createCarBrandByAdmin(input, user.sub)
    },
    updateCarBrandByAdmin: async (_, { id, input }, { user }): Promise<Object> => {
      return controller.updateCarBrandByAdmin(id, input)
    },
    deleteCarBrandByAdmin: async (_, { idSet, input }, { user }): Promise<Object> => {
      return controller.deleteCarBrandByAdmin(idSet)
    }
  },
  CarBrand: {
    async admin(parent, args, { user }) {
      if (user && user.roles === 'SUPER_ADMIN') {
        return adminService.findById(parent.admin)
      }
      return null
    }
  }
}

export default resolver
