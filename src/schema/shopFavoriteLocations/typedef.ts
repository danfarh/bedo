import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type ShopFavoriteLocations {
    _id: ID!
    user: User
    favorites: [ShopFavoriteLocationsFavorites]!
  }
  type ShopFavoriteLocationsFavorites {
    _id: ID!
    title: String
    type: LocationType!
    address: String
    coordinates: [Float]!
  }

  extend type Query {
    getShopFavoriteLocations: ShopFavoriteLocations!
    shopFavoriteLocationsGuessAddress(query: String!): [GuessedAddress]
    shopFavoriteLocationsGetAddressDetails(addressId: String!): AddressDetails
  }
  ########## OPERATIONS ##########
  extend type Mutation {
    addShopFavoriteLocation(
      favoriteLocationInput: ShopFavoriteLocationInput!
    ): ShopFavoriteLocations!

    updateShopFavoriteLocation(
      _id: ID!
      favoriteLocationInput: ShopFavoriteLocationInput!
    ): ShopFavoriteLocations!

    removeShopFavoriteLocation(_id: ID!): ShopFavoriteLocations!
  }
  ########## INPUTS ##########
  input ShopFavoriteLocationInput {
    title: String!
    address: String!
    location: LocationInput!
  }
`

export default typeDef
