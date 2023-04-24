import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type Product {
    _id: ID!
    title: String
    attributes: [AttributeItem]
    shop: Shop
    promotion: ProductPromotion
    description: String
    photoUrl: [String]
    productDetails: [ProductDetails]
    shopMenuName: String
    preparationTime: Int
    subMenuId: ID
    reqCarTypes: [ReqCarType]
    createdAt: Date
    updatedAt: Date
    isDeleted: Boolean
  }

  type MultiLanguageProduct {
    _id: ID!
    title: [MultiLanguageField]
    attributes: [AttributeItem]
    shop: Shop
    productDetails: [ProductDetails]
    afterDiscountPrice: Float
    promotion: ProductPromotion
    description: [MultiLanguageField]
    photoUrl: [String]
    shopMenuName: [MultiLanguageField]
    subMenuId: ID
    preparationTime: Int
    reqCarTypes: [ReqCarType]
    createdAt: Date
    updatedAt: Date
    isDeleted: Boolean
  }

  type ProductPromotion {
    percent: Float
    discountTo: Date
    discountFrom: Date
  }
  type AttributeItem {
    attributeGroup: AttributeGroup
    att: [Attribute]
  }
  type ProductDetails {
    _id: String
    size: ProductSize
    price: Float
    stock: Int
    afterDiscountPrice: Float
  }
  ########## OPERATIONS ##########
  extend type Query {
    getProducts(pagination: Pagination, filters: GetProductsFiltersInput): [Product]!
    getProduct(_id: ID!): Product!
    getProductsCount(filters: GlobalFilters): Int
    getProductsByAdmin(
      filters: GetProductsByAdminQueryInput
      pagination: Pagination
      sort: GetProductsByAdminSortInput
    ): [MultiLanguageProduct]
    getProductByAdmin(_id: ID!): MultiLanguageProduct
    getProductsByAdminCount(filters: GetProductsByAdminQueryInput): Int
    getProductsByShopAdmin(
      filters: GetProductsByShopAdminQueryInput
      pagination: Pagination
      sort: GetProductsByAdminSortInput
    ): [MultiLanguageProduct]
    getProductByShopAdmin(_id: ID!): MultiLanguageProduct
    getProductsByShopAdminCount(filters: GetProductsByShopAdminQueryInput): Int
    getSearchProducts(pagination: Pagination, filters: GetSearchProductsFiltersInput): [Product]
    getSearchProductsCount(filters: GetSearchProductsFiltersInput): Int
  }
  extend type Mutation {
    addProductViaExcel(input: ImportExcelInput!): addProductViaExcelResponse!
    createProductByAdmin(input: ProductByAminInput!): MultiLanguageProduct
    updateProductByAdmin(id: ID!, input: ProductByAminInput!): MultiLanguageProduct
    createProductByShopAdmin(input: ProductByShopAminInput!): MultiLanguageProduct
    updateProductByShopAdmin(id: ID!, input: ProductByShopAminInput!): MultiLanguageProduct
    removeProductByAdmin(idSet: [ID!]!): [Product!]!
    removeProductByShopAdmin(idSet: [ID!]!): [Product!]!
  }
  ########## INPUTS & ENUMS ##########
  input GetProductsFiltersInput {
    shop: ID
    category: ID
    attributes: AttributeInput
  }
  input AttributeInput {
    group: ID
    atts: [ID]
  }
  input GetSearchProductsFiltersInput {
    title: String
  }
  type addProductViaExcelResponse {
    message: String!
  }

  input ProductByAminInput {
    title: [MultiLanguageInput!]!
    subMenu: ID
    attributes: [AttributeItemInput]
    shop: ID!
    preparationTime: Int!
    reqCarTypes: [ID!]!
    promotion: ProductPromotionInput
    description: [MultiLanguageInput]
    photoUrl: [String]
    productDetails: [ProductDetailsInput]
  }

  input ProductByShopAminInput {
    title: [MultiLanguageInput!]!
    subMenu: ID
    attributes: [AttributeItemInput]
    reqCarTypes: [ID!]!
    preparationTime: Int
    promotion: ProductPromotionInput
    description: [MultiLanguageInput]
    photoUrl: [String]
    productDetails: [ProductDetailsInput]
  }
  input ProductDetailsInput {
    size: ProductSize
    price: Float
    stock: Int
  }
  enum ProductSize {
    SMALL
    MEDIUM
    LARGE
  }
  input ProductPromotionInput {
    percent: Float!
    discountTo: Date
    discountFrom: Date
  }
  input AttributeItemInput {
    attributeGroup: ID
    att: [ID]
  }
  input GetProductsByAdminQueryInput {
    _id: ID
    attributes: [AttributeItemInput]
    title: String
    shop: ID
    stockFrom: Int
    stock: Int
    priceFrom: Float
    price: Float
    size: ProductSize
    shopMenu: String
    promotion: Float
    afterDiscountPrice: Float
    description: String
    discountFrom: Date
    discountTo: Date
    createdAtFrom: Date
    createdAt: Date
    updatedAt: Date
  }
  input GetProductsByAdminSortInput {
    createdAt: Int
    updatedAt: Int
    price: Int
    stock: Int
    afterDiscountPrice: Int
  }
  input GetProductsByShopAdminQueryInput {
    _id: ID
    attributes: [AttributeItemInput]
    title: String
    priceFrom: Float
    price: Float
    stockFrom: Int
    stock: Int
    size: ProductSize
    promotion: Float
    shopMenu: String
    afterDiscountPrice: Float
    description: String
    discountFrom: Date
    discountTo: Date
    createdAtFrom: Date
    createdAt: Date
    updatedAt: Date
  }
  input ImportExcelInput {
    zipFile: Upload!
  }
`

export default typeDef
