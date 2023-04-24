import * as rules from '../rules'

const permissions = {
  Query: {
    getShopAdminCommentsOnShop: rules.isShopAdmin,
    getCommentsOnShopByAdmin: rules.isAdmin,
    getCommentOnShopByAdmin: rules.isAdmin,
    getCommentsOnShopByAdminCount: rules.isAdmin,
    commentsOnShop: rules.isUser,
    commentOnShop: rules.isUser,
    totalCommentsOnShop: rules.isUser,
    getCommentsOnShopByShopAdminCount: rules.isShopAdmin
  },
  Mutation: {
    createCommentOnShop: rules.isUser,
    setShopAdminReplyOnComment: rules.isShopAdmin,
    rejectCommentOnShopByShopAdmin: rules.isShopAdmin,
    removeCommentOnShopByShopAdmin: rules.isShopAdmin,
    skipCommentOnShop: rules.isUser
  }
}

export default permissions
