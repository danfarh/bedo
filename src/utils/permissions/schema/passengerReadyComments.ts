import * as rules from '../rules'

const permissions = {
  Query: {
    getPassengerReadyCommentsByAdmin: rules.isAdmin,
    getPassengerReadyCommentByAdmin: rules.isAdmin,
    getPassengerReadyComments: rules.isAuthenticated,
    getPassengerReadyComment: rules.isAuthenticated,
    getPassengerReadyCommentsCount: rules.isAuthenticated,
    getPassengerReadyCommentsByAdminCount: rules.isAdmin
  },
  Mutation: {
    createPassengerReadyCommentByAdmin: rules.isAdmin,
    updatePassengerReadyCommentByAdmin: rules.isAdmin,
    removePassengerReadyCommentByAdmin: rules.isAdmin
  }
}

export default permissions
