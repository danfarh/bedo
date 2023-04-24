import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type Category {
    _id: ID!
    parent: Category
    title: String
    photoUrl: String
    isDeleted: Boolean
  }
  type MultiLanguageCategory {
    _id: ID!
    parent: MultiLanguageCategory
    title: [MultiLanguageField!]!
    photoUrl: String
    isDeleted: Boolean
  }
  ########## OPERATIONS ##########s
  extend type Query {
    getCategories(pagination: Pagination, filters: getCategoriesFilters): [Category]!
    getCategory(_id: ID!): Category!
    getCategoriesCount(filters: getCategoriesFilters): Int
    getCategoriesByAdmin(
      pagination: Pagination
      filters: getCategoriesFilters
      sort: CategoriesSort
    ): [MultiLanguageCategory]!
    getCategoryByAdmin(_id: ID!): MultiLanguageCategory!
    getCategoriesCountByAdmin(filters: getCategoriesFilters): Int
  }
  extend type Mutation {
    createCategoryByAdmin(data: CreateCategoryByAdminInput): MultiLanguageCategory
    updateCategoryByAdmin(_id: ID!, data: UpdateCategoryByAdminInput): MultiLanguageCategory
    deleteCategoryByAdmin(idSet: [ID!]!): [MultiLanguageCategory!]!
  }
  ########## INPUTS & ENUMS ##########
  input getCategoriesFilters {
    parent: ID
    title: String
  }

  input CategoriesSort {
    title: Int
    createdAt: Int
  }

  input CreateCategoryByAdminInput {
    parent: ID
    title: [MultiLanguageInput!]!
    photoUrl: String
  }
  input UpdateCategoryByAdminInput {
    parent: ID
    title: [MultiLanguageInput!]!
    photoUrl: String
  }
`

export default typeDef
