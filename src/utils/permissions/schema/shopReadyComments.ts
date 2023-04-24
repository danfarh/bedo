import * as rules from '../rules'

const permissions = {
  Query: {
    getShopReadyCommentsByAdmin: rules.isAdmin,
    getShopReadyCommentsByAdminCount: rules.isAdmin,
    getShopReadyComments: rules.isAuthenticated,
    getShopReadyComment: rules.isAuthenticated,
    getShopReadyCommentsCount: rules.isAuthenticated
  },
  Mutation: {
    createShopReadyCommentByAdmin: rules.isAdmin,
    updateShopReadyCommentByAdmin: rules.isAdmin,
    removeShopReadyCommentByAdmin: rules.isAdmin
  }
}

export default permissions
