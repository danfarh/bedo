import { AuthenticationError } from 'apollo-server-express'
import controller from './controller'
import checkIfUserExists from '../../utils/checkIfUserExists'
import carTypeService from '../carType/service'
import carBrandService from '../carBrand/service'
import carModelService from '../carModel/service'
import carColorService from '../carColor/service'
import { checkIfRelatedToAdmin } from '../../utils/checkIfUserIsAdmin'

// async (parent, { paramas }, { contex })
// contex from server.ts line 68

const resolver: any = {
  Query: {
    getSingleCar: async (_, { id }, { user }): Promise<Object> => {
      checkIfUserExists(user)
      const result = await controller.getSingleCar(id)
      return result
    },
    getDriversCars: async (_, { Pagination }, { user, language }): Promise<Object> => {
      checkIfUserExists(user)
      const result = await controller.getDriversCars(user.sub, Pagination, language)
      return result
    },
    getDriversCarsByAdmin: async (
      _,
      { driver, Pagination },
      { user, language }
    ): Promise<Object> => {
      const result = await controller.getDriversCars(driver, Pagination, language)
      return result
    },
    getCarsByAdmin: async (parent, { filters, sort, pagination }) => {
      return controller.getCarsByAdmin(filters, pagination, sort, 'FETCH')
    },
    getSortDrivers: async (parent, { filters }) => {
      return controller.getSortDrivers(filters)
    },
    getCarsCountByAdmin: async (parent, { filters }) => {
      const records = await controller.getCarsByAdmin(filters, undefined, undefined, 'COUNT')
      return records.length
    }
  },
  Mutation: {
    addCar: async (_, { CarInput }, { user, language }): Promise<Object> => {
      checkIfUserExists(user)
      const result = await controller.addCar(CarInput, user.sub, language)
      return result
    },
    updateCar: async (_, { id, CarInput }, { user, language }): Promise<Object> => {
      checkIfUserExists(user)
      const result = await controller.updateCar(id, CarInput, user.sub, language)
      return result
    },
    removeCar: async (_, { id }, { user, language }): Promise<Object> => {
      checkIfUserExists(user)
      const result = await controller.removeCar(id, user.sub, language)
      return result
    },
    addCarByAdmin: async (_, { input, driverId }, { user }): Promise<Object> => {
      return controller.addCarByAdmin(input, driverId)
    },
    updateCarByAdmin: async (_, { input, carId }, { user }): Promise<Object> => {
      return controller.updateCarByAdmin(input, carId)
    },
    deleteCarByAdmin: async (_, { idSet }, { user }): Promise<Object> => {
      return controller.deleteCarByAdmin(idSet)
    }
  },
  Car: {
    carType: (parent, args, { language }, info) => {
      console.log()
      return checkIfRelatedToAdmin(info.path)
        ? carTypeService.findById(parent.carType)
        : carTypeService.findOneFromView({ _id: parent.carType }, language)
    },
    color: (parent, args, { language }, info) => {
      return checkIfRelatedToAdmin(info.path)
        ? carColorService.findById(parent.color)
        : carColorService.findOneFromView({ _id: parent.color }, language)
    },
    brand: parent => {
      return carBrandService.findById(parent.brand)
    },
    model: parent => {
      return carModelService.findById(parent.model)
    },
    owner: parent => {
      return controller.findCarOwner(parent._id)
    }
  },
  MultiLanguageCar: {
    carType: (parent, args, info) => {
      return carTypeService.findById(parent.carType)
    },
    color: (parent, args, info) => {
      return carColorService.findById(parent.color)
    },
    brand: parent => {
      return carBrandService.findById(parent.brand)
    },
    model: parent => {
      return carModelService.findById(parent.model)
    },
    owner: parent => {
      return controller.findCarOwner(parent._id)
    }
  }
}

export default resolver
