import { AuthenticationError } from 'apollo-server-express'
import controller from './controller'
import adminService from '../admin/service'
import carBrandService from '../carBrand/service'

const resolver: any = {
  Query: {
    getCarModel: async (_, { id }, { user }): Promise<Object> => {
      return controller.getCarModel(id)
    },
    getCarModels: async (_, { pagination, filters }, { user }): Promise<Object> => {
      return controller.getCarModels(pagination, filters)
    },
    getCarModelsCount: async (parent, { filters }) => {
      return controller.getCarModelsCount(filters)
    }
  },
  Mutation: {
    addCarModelViaExcel: async (_, { excelFile }, { user }): Promise<Object> => {
      return controller.addCarModelViaExcel(excelFile, user)
    },
    createCarModelByAdmin: async (_, { input }, { user }): Promise<Object> => {
      return controller.createCarModelByAdmin(input, user.sub)
    },
    updateCarModelByAdmin: async (_, { id, input }, { user }): Promise<Object> => {
      return controller.updateCarModelByAdmin(id, input)
    },
    deleteCarModelByAdmin: async (_, { idSet }, { user }): Promise<Object> => {
      return controller.deleteCarModelByAdmin(idSet)
    }
  },
  CarModel: {
    async admin(parent, args, { user }) {
      if (user && user.roles === 'SUPER_ADMIN') {
        return adminService.findById(parent.admin)
      }
      return null
    },
    brand(parent) {
      return carBrandService.findById(parent.brand)
    }
  }
}

export default resolver
