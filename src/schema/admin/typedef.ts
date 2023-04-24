import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type Admin {
    _id: ID
    fullName: String
    phoneNumber: String
    phoneNumberVerified: Boolean
    email: String
    type: String
    state: String
    verificationState: String
    shop: Shop
    token: Token
    roles: [Role]
    createdAt: Date
    updatedAt: Date
    isDeleted: Boolean
  }
  ########## OPERATIONS ##########
  extend type Query {
    adminCheckEmail(email: String!): emailExists!
    checkShopAdminPhoneVerificationCode(
      input: checkVerificationCodeInput!
    ): checkVerificationCodeResponse
    getWaitingVerificationStateShopAdminsByAdmin(
      filters: GetWaitingVerificationStateShopAdminsByAdminQueryInput
      pagination: Pagination
      sort: GetWaitingVerificationStateShopAdminsByAdminSortInput
    ): [Admin]
    getWaitingVerificationStateShopAdminsByAdminCount(
      filters: GetWaitingVerificationStateShopAdminsByAdminQueryInput
    ): Int
    getAdminsByAdmin(
      filters: GetAdminsByAdminQueryInput
      pagination: Pagination
      sort: GetAdminsByAdminSortInput
    ): [Admin]
    getAdminsByAdminCount(filters: GetAdminsByAdminQueryInput): Int
    getNewAccessTokenByAdmin(refreshToken: String!): Admin
    getAdminByAdmin(id: ID!): Admin
    getAdminInformation: Admin
  }

  extend type Mutation {
    adminLogin(input: AdminLoginInput!): Admin
    getShopAdminPhoneVerificationCode(phoneNumber: String!): phoneVerificationResponse!
    shopAdminSignUp(input: ShopAdminSignUpInput!): Admin
    updateShopAdminVerificationStateByAdmin(
      adminId: ID!
      verificationState: VerificationState!
    ): Admin
    updateAdminRoles(input: UpdateAdminRolesInput): Admin!
    createAdminByAdmin(input: CreateAdminByAdminInput): Admin
    suspendAdminByAdmin(idSet: [ID!]!): [Admin!]!
    suspendShopByAdmin(idSet: [ID!]!): [Shop!]!
    updateAdminByAdmin(input: UpdateAdminByAdminInput!, adminId: ID!): Admin
    changeShopAdminPassword(input: ChangeShopAdminPassword): Admin
    deleteAdminBySystemAdmin(idSet: [ID!]!): [Admin!]!
  }
  ########## INPUTS & ENUMS ##########
  input GetAdminsByAdminQueryInput {
    _id: ID
    fullName: String
    email: String
    phoneNumber: String
    phoneNumberVerified: Boolean
    state: AdminState
    type: String
    verificationState: VerificationState
    shop: ID
    shopName: String
    shopPhoneNumber: String
    createdAt: Date
    updatedAt: Date
  }
  input GetAdminsByAdminSortInput {
    createdAt: Int
    updatedAt: Int
  }
  input CreateAdminByAdminInput {
    fullName: String!
    email: String!
    phoneNumber: String!
    password: String!
    state: AdminState
    type: String
    shop: ID
    roles: [ID!]!
  }
  input UpdateAdminByAdminInput {
    fullName: String
    email: String
    phoneNumber: String
    passwordHash: String
    verificationState: VerificationState
    phoneNumberVerified: Boolean
    state: AdminState
    type: String
    shop: ID
    roles: [ID!]!
  }
  input UpdateAdminRolesInput {
    adminId: ID!
    roles: [ID!]!
  }

  input AdminLoginInput {
    emailOrPhoneNumber: String!
    password: String!
    fcm: String
  }
  input ShopAdminSignUpInput {
    fullName: String!
    email: String!
    phoneNumber: String!
    password: String!
    phoneSignUpCode: String!
  }

  enum VerificationState {
    WAITING
    VERIFIED
  }

  enum AdminState {
    SUSPENDED
    ACTIVE
  }
  input GetWaitingVerificationStateShopAdminsByAdminQueryInput {
    _id: ID
    state: AdminState
    phoneNumber: String
    email: String
    fullName: String
    phoneNumberVerified: Boolean
  }

  input GetWaitingVerificationStateShopAdminsByAdminSortInput {
    createdAt: Int
    updatedAt: Int
  }
  input ChangeShopAdminPassword {
    newPassword: String!
    currentPassword: String!
  }
`

export default typeDef
