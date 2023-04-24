import * as rules from '../rules'

const permissions = {
  Query: {
    getCarBrand: rules.isAuthenticated,
    getCarBrands: rules.isAuthenticated
  },
  Mutation: {
    addCarBrandViaExcel: rules.isAdmin,
    createCarBrandByAdmin: rules.isAdmin,
    updateCarBrandByAdmin: rules.isAdmin,
    deleteCarBrandByAdmin: rules.isAdmin
  }
}

export default permissions
