import * as rules from '../rules'

const permissions = {
  Query: {
    getCommentsOnPassengerByAdmin: rules.isAdmin,
    getCommentsOnPassengerByAdminCount: rules.isAdmin,
    getCommentOnPassengerByAdmin: rules.isAdmin,
    getCommentsOnPassenger: rules.isDriver,
    getCommentOnPassenger: rules.isDriver,
    getTotalCommentsOnPassenger: rules.isDriver
  },
  Mutation: {
    removeCommentOnPassengerByAdmin: rules.isAdmin,
    createCommentOnPassenger: rules.isDriver
  }
}

export default permissions
