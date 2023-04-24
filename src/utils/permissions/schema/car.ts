import * as rules from '../rules'

const permissions = {
  Query: {
    getSingleCar: rules.isAuthenticated,
    getDriversCarsByAdmin: rules.isAdmin,
    getCarsByAdmin: rules.isAdmin,
    getDriversCars: rules.isDriver,
    getCarsCountByAdmin: rules.isAdmin,
    getSortDrivers: rules.isShopAdmin
  },
  Mutation: {
    addCar: rules.isDriver,
    updateCar: rules.isDriver,
    removeCar: rules.isDriver,
    addCarByAdmin: rules.isAdmin,
    updateCarByAdmin: rules.isAdmin,
    deleteCarByAdmin: rules.isAdmin
  }
}

export default permissions
