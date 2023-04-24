import * as rules from '../rules'

const permissions = {
  Query: {
    getComments: rules.isAuthenticated,
    getComment: rules.isAuthenticated,
    getCommentsCount: rules.isAuthenticated
  },
  Mutation: {
    createComment: rules.isAuthenticated,
    updateComment: rules.isAuthenticated,
    deleteComment: rules.isAuthenticated
  }
}

export default permissions
