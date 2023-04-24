import * as rules from '../rules'
import { rule } from 'graphql-shield'

const permissions = {
  Query: {
    getParcelWeightsByAdmin: rules.isAdmin,
    getParcelWeights: rules.isAuthenticated,
    getParcelWeight: rules.isAuthenticated,
    getParcelWeightsCount: rules.isAuthenticated,
    getParcelWeightsByAdminCount: rules.isAdmin
  },
  Mutation: {
    createParcelWeightByAdmin: rules.isAdmin,
    updateParcelWeightByAdmin: rules.isAdmin,
    removeParcelWeightByAdmin: rules.isAdmin
  }
}

export default permissions
