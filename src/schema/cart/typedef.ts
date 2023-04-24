import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type Cart {
    _id: ID
    user: User
    currency: String
    productsPrice: Float
    shipmentCost: Float
    finalPrice: Float
    discount: Float
    afterDiscountPrice: Float
    rootCategory: Category
    shop: Shop
    products: [CartProduct]
  }
  type CartProduct {
    product: Product
    quantity: SizeQuantity
  }
  type SizeQuantity {
    quantity_small: Int
    quantity_medium: Int
    quantity_large: Int
  }
  ########## OPERATIONS ##########
  extend type Query {
    getCart(_id: ID!): Cart!
    getUserCart(category: String!): Cart!
  }
  extend type Mutation {
    updateCart(
      shop: ID!
      product: CartProductInput!
      category: String!
      userLocation: LocationInput!
    ): Cart!
    resetCart(shop: ID!, category: String!): Cart!
    cartVerification(category: String): Order!
    cartRejection(category: String): MessageResponse
  }
  ########## INPUTS & ENUMS ##########

  input CartProductInput {
    id: ID!
    # TODO detailId is redundant and should be removed. because of frontend
    # problems, we still get detailId but we don't use it at all
    detailId: ID
    quantity: SizeQuantityInput
  }
  input SizeQuantityInput {
    quantity_small: Int!
    quantity_medium: Int!
    quantity_large: Int!
  }
`

export default typeDef
