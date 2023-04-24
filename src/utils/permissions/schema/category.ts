import * as rules from '../rules'

export default {
  Query: {
    getCategories: rules.isAuthenticated,
    getCategory: rules.isAuthenticated,
    getCategoriesCount: rules.isAuthenticated
  },
  Mutation: {
    createCategoryByAdmin: rules.isAdmin,
    updateCategoryByAdmin: rules.isAdmin,
    deleteCategoryByAdmin: rules.isAdmin
  }
}
