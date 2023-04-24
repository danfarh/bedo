import { gql } from 'apollo-server-express'
// TODO token should be returned as auth typeno Token
const typeDef = gql`
  ########## TYPES ##########
  type CreditCard {
    _id: ID!
    email: String
    type: String!
    cardHolderName: String
    creditCardNumber: String
    cvv2: String
    expirationMonth: String
    expirationYear: String
  }

  type getUserChangePhoneNumberCodeResponse {
    changePhoneNumberCode: String!
    phoneNumber: String!
    newPhoneNumber: String!
  }

  type CreditCards {
    value: [CreditCard]
    defaultCreditCard: ID
  }

  type User {
    _id: ID
    fullName: String
    email: String
    phoneNumber: String
    shopUser: Boolean
    profileImageUrl: Upload
    birthDate: Date
    gender: String
    state: String
    isVerified: Boolean
    emailVerified: Boolean
    phoneNumberVerified: Boolean
    hasNotification: Boolean
    addresses: [Address]
    defaultAddress: Address
    token: Token
    averageRate: Float
    sumRate: Float
    numberOfRates: Int
    createdAt: Date
    updatedAt: Date
    stripeCustomerId: String
  }
  type Token {
    refreshToken: String
    accessToken: String
  }
  type Address {
    full: String
    zipCode: String
  }

  ########## OPERATIONS ##########
  extend type Query {
    getUserPaymentStatus: UserPaymentMethodStatus!
    userCheckEmailVerification(email: String!): MessageResponse
    singleCreditCard(id: ID!): CreditCard
    creditCards: CreditCards
    getDefaultCreditCard: CreditCard
    getUserInformation: User
    getUsersByAdmin(
      filters: GetUsersQueryInput
      pagination: Pagination
      sort: GetUsersSortInput
    ): [User]
    getUsersByAdminCount(filters: GetUsersQueryInput): Int
    getAllUsers: [User]
    getAllAdmins: [Admin]
    getUserByAdmin(id: ID!): User
  }
  extend type Mutation {
    addCreditCard(CreditCardInput: CreditCardInput!): CreditCard
    updateCreditCard(id: ID!, CreditCardInput: CreditCardInput!): CreditCard
    removeCreditCard(id: ID!): MessageResponse
    setDefaultCreditCard(id: ID!): CreditCard
    saveLocation(location: LocationInput): MessageResponse
    updateUser(updateUserInput: updateUserInput!): User
    getUserChangePhoneNumberCode(
      getUserChangePhoneNumberCodeInput: getUserChangePhoneNumberCodeInput!
    ): getUserChangePhoneNumberCodeResponse
    checkUserChangePhoneNumberCode(
      checkUserChangePhoneNumberCodeInput: checkUserChangePhoneNumberCodeInput!
    ): User
    suspendUserByAdmin(idSet: [ID!]!): [User!]!
    updateUserByAdmin(input: UpdateUserByAdminInput!, userId: ID!): User
  }
  ########## INPUTS & ENUMS ##########
  input CreditCardInput {
    cardHolderName: String
    type: CreditCardTypeInput!
    creditCardNumber: String
    cvv2: String
    email: String
    expirationMonth: String
    expirationYear: String
  }
  input updateUserInput {
    fullName: String
    email: String
    passwordHash: String
    profileImageUrl: String
    birthDate: Date
    gender: UserGender
    addresses: [UserAddress]
    defaultAddress: UserAddress
  }
  input UserAddress {
    full: String!
    zipCode: String!
  }

  input getUserChangePhoneNumberCodeInput {
    phoneNumber: String!
    newPhoneNumber: String!
  }

  input checkUserChangePhoneNumberCodeInput {
    changePhoneNumberCode: String!
    phoneNumber: String!
    newPhoneNumber: String!
  }
  enum CreditCardTypeInput {
    AMERICAN_EXPRESS
    Master_Card
    Debit_Card
    VISA
    Paypal
  }

  enum UserGender {
    MALE
    FEMALE
  }

  enum UserStateInput {
    ACTIVE
    SUSPENDED
  }

  input GetUsersQueryInput {
    _id: ID
    fullName: String
    email: String
    phoneNumber: String
    birthDate: Date
    hasNotification: Boolean
    profileImageUrl: String
    state: UserStateInput
    gender: UserGender
    isVerified: Boolean
    emailVerified: Boolean
    phoneNumberVerified: Boolean
    lockTillDate: Date
    creditCardData: ID
    defaultCreditCard: ID
    paypal: ID
    addresses: UserAddress
    defaultAddress: UserAddress
    phoneNumberVerification: UserPhoneNumberVerificationQueryInput
    averageRate: Float
    sumRate: Float
    numberOfRates: Int
    fromDate: Date
    toDate: Date
    dateField: DateField
    shopUser: Boolean
    createdAtFrom: Date
    createdAt: Date
    updatedAt: Date
  }
  input GetUsersSortInput {
    createdAt: Int
    updatedAt: Int
    birthDate: Int
    averageRate: Int
    gender: Int
    sumRate: Int
    fullName: Int
    email: Int
    numberOfRates: Int
    lockTillDate: Int
    tries: Int
    isVerified: Int
    phoneNumber: Int
    hasNotification: Int
    emailVerified: Int
    phoneNumberVerified: Int
    sentTime: Int
  }

  input UserPhoneNumberVerificationQueryInput {
    tries: Int
    sentTime: Date
  }

  enum DateField {
    createdAt
    updatedAt
    birthDate
    lockTillDate
    sentTime
  }

  input UpdateUserByAdminInput {
    fullName: String
    email: String!
    passwordHash: String
    phoneNumber: String!
    birthDate: Date
    hasNotification: Boolean
    profileImageUrl: String
    state: UserStateInput
    gender: UserGender
    isVerified: Boolean
    emailVerified: Boolean
    phoneNumberVerified: Boolean
    lockTillDate: Date
    addresses: [UserAddress]
    defaultAddress: UserAddress
    phoneNumberVerification: UserPhoneNumberVerificationQueryInput
  }
`

export default typeDef
