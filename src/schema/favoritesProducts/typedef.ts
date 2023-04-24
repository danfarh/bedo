import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type FavoritesProducts {
    _id: ID!
    user: User
    favorites: [FavoritesProductsFavorites]
  }
  type FavoritesProductsFavorites {
    rootCategory: Category
    favorites: [Product]
  }
  ########## OPERATIONS ##########
  extend type Query {
    getFavoritesProducts(pagination: Pagination, filters: GlobalFilters): [FavoritesProducts]!
    getFavoritesProduct(_id: ID!): FavoritesProducts!
    getFavoritesProductsCount(filters: GlobalFilters): Int
  }
  ########## INPUTS & ENUMS ##########
`

export default typeDef
