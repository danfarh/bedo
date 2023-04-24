import * as rules from '../rules'

const permissions = {
  Query: {
    getCarModel: rules.isAuthenticated,
    getCarModels: rules.isAuthenticated,
    getCarModelsCount: rules.isAuthenticated
  },
  Mutation: {
    addCarModelViaExcel: rules.isAdmin,
    createCarModelByAdmin: rules.isAdmin,
    updateCarModelByAdmin: rules.isAdmin,
    deleteCarModelByAdmin: rules.isAdmin
  }
}

export default permissions
