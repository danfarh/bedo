import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type FavoritePlaces {
    _id: ID!
    user: User
    favorites: [FavoritePlacesFavorites]!
  }
  type FavoritePlacesFavorites {
    _id: ID!
    title: String
    type: LocationType!
    address: String
    coordinates: [Float]!
  }
  type GuessedAddress {
    address: String
    id: String
  }
  type AddressDetails {
    id: String
    address: String
    location: Location
  }
  extend type Query {
    favoritePlaces: FavoritePlaces!
    guessAddress(query: String!): [GuessedAddress]
    getAddressDetails(addressId: String!): AddressDetails
  }
  ########## OPERATIONS ##########
  extend type Mutation {
    addFavoritePlace(favoritePlaceInput: FavoritePlaceInput!): FavoritePlaces!

    updateFavoritePlace(_id: ID!, favoritePlaceInput: FavoritePlaceInput!): FavoritePlaces!

    removeFavoritePlace(_id: ID!): FavoritePlaces!
  }
  ########## INPUTS ##########
  input FavoritePlaceInput {
    title: String!
    address: String!
    location: LocationInput!
  }
`

export default typeDef
