import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type Shop {
    _id: ID!
    stripeAccountId: String
    shopAdmin: Admin
    shopMenu: ShopMenu
    budget: String
    acceptCash: Boolean
    active: Boolean
    verified: Boolean
    state: String
    name: String
    address: String
    isRejected: Boolean
    phoneNumbers: [String]
    origin: String
    rejectionMessage: String
    location: ShopLocation
    description: String
    workingHoursInMinutes: [WorkingHoursInMinute]
    notWorkingDays: [notWorkingDays]
    averageRate: Float
    numberOfRates: Int
    sumOfRates: Float
    bannerUrl: String
    logoUrl: String
    taxCode: String
    cardNumber: String
    rootCategory: Category
    categories: [Category]
    attributes: [Attribute]
    preparingTime: Int
    attributesCount: [ShopAttributesCount]
    createdAt: Date
    updatedAt: Date
    isDeleted: Boolean
  }

  type MultiLanguageShop {
    _id: ID!
    stripeAccountId: String
    shopAdmin: Admin
    shopMenu: MultiLanguageShopMenu
    budget: String
    acceptCash: Boolean
    active: Boolean
    verified: Boolean
    state: String
    name: String
    address: String
    isRejected: Boolean
    phoneNumbers: [String]
    origin: String
    rejectionMessage: String
    location: ShopLocation
    description: String
    workingHoursInMinutes: [WorkingHoursInMinute]
    notWorkingDays: [notWorkingDays]
    averageRate: Float
    numberOfRates: Int
    sumOfRates: Float
    bannerUrl: String
    logoUrl: String
    taxCode: String
    cardNumber: String
    rootCategory: Category
    categories: [MultiLanguageCategory]
    attributes: [Attribute]
    preparingTime: Int
    attributesCount: [ShopAttributesCount]
    createdAt: Date
    updatedAt: Date
    isDeleted: Boolean
  }

  type ShopAttributesCount {
    count: Int
    attribute: Attribute
  }
  type WorkingHoursInMinute {
    type: weekDays
    from: Int
    to: Int
  }
  type ShopLocation {
    type: String
    coordinates: [Float]
  }
  type notWorkingDays {
    type: weekDays
  }
  type Salary {
    _id: ID
    numberOfOrders: Int
    currency: String
    paidAt: Date
    income: Float
    userTakings: Float
    commissionForSpark: Float
  }
  type inZone {
    is: Boolean
    time: Date
  }

  type couriers {
    _id: ID
    fullName: String
    state: String
    profileImageUrl: Upload
    phoneNumber: String
    createdAt: Date
    averageRate: Float
    gender: String
  }

  ########## OPERATIONS ##########
  extend type Query {
    getShopPaymentStatus: PaymentMethodStatus!
    getShops(
      filters: GetShopsFiltersInput
      pagination: Pagination
      sort: GetShopsSortInput
    ): [MultiLanguageShop]!
    getShopsByAdmin(
      filters: GetShopsByAdminFiltersInput
      pagination: Pagination
      sort: GetShopsByAdminSortInput
    ): [MultiLanguageShop]!
    getShop(id: ID!): MultiLanguageShop!
    getShopsCount(filters: GlobalFilters): Int
    getShopByShopAdmin: MultiLanguageShop!
    getSalaryByShopAdmin(filters: SalaryFilter, sort: SalarySort, pagination: Pagination): [Salary]
    getShopsByAdminCount(filters: GetShopsByAdminFiltersInput): Int
    getShopByAdmin(id: ID!): Shop
    checkIfUserIsInShopZone(input: CheckIfUserIsInShopZoneInput!): inZone
    getLocationByAddress(address: String!): Location
    getSearchShops(pagination: Pagination, filters: GetSearchShopsFiltersInput): [Shop]
    getShopDeliveryByShopAdmin: [couriers]
    getSearchShopsCount(filters: GetSearchShopsFiltersInput): Int
  }
  extend type Mutation {
    createShopByShopAdmin(shopData: createShopInput!): Shop
    verifyShop(id: ID!): Shop
    rejectShopByAdmin(id: ID!, rejectionMessage: String!): Shop
    updateShopByShopAdmin(data: updateShopByAdminInput!): Shop
    updateShopAfterRejectedByShopAdmin(data: updateShopByAdminInput!): Shop
    createShopByAdmin(input: createShopInput!, shopAdminId: ID!): Shop
    deleteShopByAdmin(idSet: [ID!]!): [Shop!]!
  }
  ########## INPUTS & ENUMS ##########
  input GetShopsFiltersInput {
    rootCategory: ID!
    preparingTime: Int
    categories: [ID]
    attributes: [ID]
    discount: Boolean
    isRejected: Boolean
    budget: String
    openNow: Boolean
    location: LocationInput
    search: String
  }
  input GetShopsByAdminFiltersInput {
    _id: ID
    preparingTime: Int
    phoneNumbers: String
    rootCategory: ID
    categories: [ID]
    attributes: [ID]
    discount: Boolean
    budget: String
    openNow: Boolean
    location: LocationInput
    acceptCash: Boolean
    active: Boolean
    verified: Boolean
    isRejected: Boolean
    state: ShopStateInput
    origin: String
    name: String
    shopAdminName: String
    shopAdminPhoneNumber: String
    address: String
    description: String
    workingHoursInMinutes: workingHoursInMinutesInput
    notWorkingDays: notWorkingDaysInput
    shopAdmin: ID
    shopMenu: ID
    createdAt: Date
    updatedAt: Date
    averageRateFrom: Float
    averageRate: Float
    numberOfRates: Int
    sumOfRates: Float
  }
  input createShopInput {
    budget: Budget
    acceptCash: Boolean
    preparingTime: Int!
    active: Boolean
    name: String
    address: String
    phoneNumbers: [String!]!
    location: ShopLocationInput!
    origin: String
    description: String
    workingHoursInMinutes: [workingHoursInMinutesInput]
    notWorkingDays: [notWorkingDaysInput]
    bannerUrl: String
    logoUrl: String
    taxCode: String
    cardNumber: String
    rootCategory: ID
    categories: [ID]
  }
  input updateShopByAdminInput {
    budget: Budget
    preparingTime: Int!
    acceptCash: Boolean
    active: Boolean
    state: String
    name: String
    address: String
    phoneNumbers: [String!]!
    location: ShopLocationInput!
    origin: String
    description: String
    workingHoursInMinutes: [workingHoursInMinutesInput]
    notWorkingDays: [notWorkingDaysInput]
    bannerUrl: String
    logoUrl: String
    taxCode: String
    cardNumber: String
    rootCategory: ID
    categories: [ID]
  }

  input workingHoursInMinutesInput {
    type: weekDays
    from: Int
    to: Int
  }
  input notWorkingDaysInput {
    type: weekDays
  }
  input SalaryFilter {
    type: String
    shipmentModel: String
    status: String
    shipmentAt: Date
    paidAt: Date
  }
  input SalarySort {
    paidAt: Int
    numberOfOrders: Int
    income: Int
    userTakings: Int
    commissionForSpark: Int
  }
  enum Budget {
    B
    BB
    BBB
  }
  enum weekDays {
    SAT
    SUN
    MON
    TUE
    WEN
    THU
    FRI
  }
  input GetShopsSortInput {
    createdAt: Int
    updatedAt: Int
    priceRange: Int
    rating: Int
    deliveryTime: Int
    preparingTime: Int
  }
  input GetShopsByAdminSortInput {
    createdAt: Int
    updatedAt: Int
    priceRange: Int
    averageRate: Int
    acceptCash: Int
    preparingTime: Int
    name: Int
    origin: Int
    address: Int
    description: Int
    numberOfRates: Int
    sumOfRates: Int
    verified: Int
    isRejected: Int
  }
  enum ShopStateInput {
    ACTIVE
    SUSPENDED
  }
  input ShopLocationInput {
    coordinates: [Float!]!
    type: ShopLocationType!
  }
  enum ShopLocationType {
    Point
  }
  input CheckIfUserIsInShopZoneInput {
    userLocation: LocationInput!
    shop: ID!
  }
  input GetSearchShopsFiltersInput {
    name: String
  }
`

export default typeDef
