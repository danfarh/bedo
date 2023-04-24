import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type ShopMenu {
    _id: ID!
    subMenus: [SubMenu]
  }

  type MultiLanguageShopMenu {
    _id: ID!
    subMenus: [MultiLanguageSubMenu]
  }

  type SubMenu {
    _id: ID
    name: String
    products(
      filters: GetProductsByAdminQueryInput
      pagination: Pagination
      sort: GetProductsByAdminSortInput
    ): [Product]
  }
  type MultiLanguageSubMenu {
    _id: ID
    name: [MultiLanguageField]
    products(
      filters: GetProductsByAdminQueryInput
      pagination: Pagination
      sort: GetProductsByAdminSortInput
    ): [MultiLanguageProduct]
  }
  ########## OPERATIONS ##########
  extend type Query {
    getShopMenu(id: ID!): MultiLanguageShopMenu!
    getShopMenuByShopAdmin(pagination: Pagination): MultiLanguageShopMenu!
    getSubMenuProductsByAdmin(shopId: ID!, subMenuId: ID!): MultiLanguageSubMenu
    getSubMenuProductsByShopAdmin(subMenuId: ID!): MultiLanguageSubMenu
  }

  extend type Mutation {
    createShopMenuByAdmin(inputs: CreateShopMenuByAdminInput!): MultiLanguageShopMenu!
    createSubMenuByAdmin(shopId: ID, inputs: CreateSubMenuByAdminInput): MultiLanguageShopMenu!
    updateShopMenuByAdmin(_id: ID!, inputs: UpdateShopMenuInput!): MultiLanguageShopMenu!
    updateSubMenuByAdmin(
      shopId: ID!
      subMenuId: ID!
      inputs: UpdateSubMenuByShopAdminInput!
    ): MultiLanguageShopMenu!
    removeShopMenuProductByAdmin(inputs: removeShopMenuProductByAdminInput!): MultiLanguageShopMenu!
    removeShopMenuItemsByAdmin(inputs: removeShopMenuItemsByAdminInput!): MultiLanguageShopMenu!
    createShopMenuByShopAdmin(inputs: CreateShopMenuInput!): MultiLanguageShopMenu!
    createSubMenuByShopAdmin(inputs: SubMenuInput): MultiLanguageShopMenu!
    updateSubMenuByShopAdmin(
      subMenuId: ID!
      inputs: UpdateSubMenuByShopAdminInput!
    ): MultiLanguageShopMenu!
    updateShopMenuByShopAdmin(inputs: UpdateShopMenuInput!): MultiLanguageShopMenu!
    removeShopMenuProductByShopAdmin(
      inputs: removeShopMenuProductByShopAdminInput!
    ): MultiLanguageShopMenu!
    removeShopMenuItemsByShopAdmin(menuId: ID!): MultiLanguageShopMenu!
  }
  ########## INPUTS & ENUMS ##########

  input CreateShopMenuInput {
    subMenus: [SubMenuInput]
  }
  input CreateShopMenuByAdminInput {
    subMenus: [SubMenuInput]!
    shopId: ID!
  }
  input CreateSubMenuByAdminInput {
    subMenus: [SubMenuInput]!
  }
  input removeShopMenuProductByAdminInput {
    shopId: ID!
    menuId: ID!
    productId: ID!
  }
  input removeShopMenuItemsByAdminInput {
    shopId: ID!
    menuId: ID!
  }
  input removeShopMenuProductByShopAdminInput {
    menuId: ID!
    productId: ID!
  }
  input SubMenuInput {
    name: [MultiLanguageInput]
    products: [ID]
  }
  input UpdateShopMenuInput {
    subMenus: [SubMenuInput]
  }
  input UpdateSubMenuByShopAdminInput {
    subMenus: [SubMenuInput]
  }
`

export default typeDef
