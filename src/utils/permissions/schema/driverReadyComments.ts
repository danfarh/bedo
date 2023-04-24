import * as rules from '../rules'

const permissions = {
  Query: {
    getDriverReadyCommentsByAdmin: rules.isAdmin,
    getDriverReadyCommentsByAdminCount: rules.isAdmin,
    getDriverReadyComments: rules.isAuthenticated,
    getDriverReadyComment: rules.isAuthenticated,
    getDriverReadyCommentsCount: rules.isAuthenticated
  },
  Mutation: {
    createDriverReadyCommentByAdmin: rules.isAdmin,
    updateDriverReadyCommentByAdmin: rules.isAdmin,
    removeDriverReadyCommentByAdmin: rules.isAdmin
  }
}

export default permissions
