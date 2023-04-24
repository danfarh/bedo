import * as rules from '../rules'

const permissions = {
  Query: {
    getCarColor: rules.isAuthenticated,
    getCarColors: rules.isAuthenticated,
    getCarColorsCount: rules.isAuthenticated
  },
  Mutation: {
    addCarColorViaExcel: rules.isAdmin,
    createCarColorByAdmin: rules.isAdmin,
    updateCarColorByAdmin: rules.isAdmin,
    deleteCarColorByAdmin: rules.isAdmin
  }
}

export default permissions
