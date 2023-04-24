import * as rules from '../rules'

const permissions = {
  Query: {
    getCanceledTripReasonsByAdmin: rules.isAdmin,
    getCanceledTripReasonsByAdminCount: rules.isAdmin,
    getCanceledTripReasons: rules.isAuthenticated,
    getCanceledTripReason: rules.isAuthenticated,
    getCanceledTripReasonsCount: rules.isAuthenticated
  },
  Mutation: {
    createCanceledTripReasonByAdmin: rules.isAdmin,
    updateCanceledTripReasonByAdmin: rules.isAdmin,
    removeCanceledTripReasonByAdmin: rules.isAdmin
  }
}

export default permissions
