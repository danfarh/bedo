import * as rules from '../rules'

const permissions = {
  Query: {
    commentOnDriver: rules.isUser,
    commentsOnDriver: rules.isUser,
    totalCommentsOnDriver: rules.isUser,
    getCommentsOnDriverByAdmin: rules.isAdmin,
    getCommentOnDriverByAdmin: rules.isAdmin,
    getCommentsOnDriverByAdminCount: rules.isAdmin
  },
  Mutation: {
    removeCommentOnDriverByAdmin: rules.isAdmin,
    skipCommentOnDriver: rules.isUser,
    createCommentOnDriver: rules.isUser
  }
}

export default permissions
