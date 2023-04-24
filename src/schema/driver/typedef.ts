import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type Driver {
    _id: ID
    fullName: String
    car: [Car]
    defaultCar: Car
    shop: Shop
    drivingLicence: Licence
    averageRate: Float
    sumRate: Float
    numberOfRates: Int
    hasNotification: Boolean
    email: String
    phoneNumber: String
    profileImageUrl: Upload
    birthDate: Date
    state: String
    gender: String
    isVerified: Boolean
    emailVerified: Boolean
    phoneNumberVerified: Boolean
    address: Address
    workStatus: String
    token: Token
    verificationRequests: [DriverVerificationRequests]
    createdAt: Date
    updatedAt: Date
    stripeAccountId: String
    isDeleted: Boolean
  }
  type MultiLanguageDriver {
    _id: ID
    fullName: String
    car: [MultiLanguageCar]
    defaultCar: MultiLanguageCar
    shop: Shop
    drivingLicence: Licence
    averageRate: Float
    sumRate: Float
    numberOfRates: Int
    hasNotification: Boolean
    email: String
    phoneNumber: String
    profileImageUrl: Upload
    birthDate: Date
    state: String
    gender: String
    isVerified: Boolean
    emailVerified: Boolean
    phoneNumberVerified: Boolean
    address: Address
    workStatus: String
    token: Token
    verificationRequests: [DriverVerificationRequests]
    createdAt: Date
    updatedAt: Date
    stripeAccountId: String
    isDeleted: Boolean
  }

  type DriverVerificationRequests {
    status: DriverVerificationRequestsStatus
    verificationDetails: DriverVerificationRequestVerificationDetails
    submitDate: Date
    responseDate: Date
    rejectionMessage: String
  }
  type DriverAboutMe {
    tripsWaiting: Int
    driverPayment: Float
    tripsNumber: Int
    mileage: Float
    totalAmount: Float
    todayScore: Float
  }
  type DriverVerificationRequestVerificationDetails {
    gender: DriverGender
    birthDate: Date
    taxCode: String
    creditCardNumber: String
    address: Address
    profileImageUrl: String
    drivingLicence: Licence
    drivingRecordPhotoUrl: String
    canadianVerificationPhotoUrl: String
    canadianVerificationExpireDate: Date
    backgroundCheckDocumentPhotoUrl: String
  }

  type Licence {
    licenceId: String
    photoUrl: String
    expireDate: Date
  }

  type InTripDriverSet {
    driver: Driver!
    trip: Trip!
  }

  type MenuUnreadFields {
    unreadMessageExists: Boolean
    unreadNotificationExists: Boolean
  }
  type CountDistance {
    successfulSubmissions: Int
    distance: Float
  }

  type DriverStatisticsList {
    driverTotalPrice: Float
    numAllTrips: Int
    successfulSubmissions: Int
    unSuccessfulSubmissions: Int
    companyCommission: Float
    cashDaySales: Float
    cardDaySales: Float
  }
  type DriverHistory {
    orderStatus: String
    orderTrackId: String
    orderDate: Date
    orderPayment: Float
    NumberOfSales: Int
    deliveryRate: Float
    distance: Float
    courierFee: Float
    deliveryCourierTime: Date
    deliveryCustomerTime: Date
  }

  type DriverStatisticsListCountTrip {
    num: Int
    date: Date
  }

  ########## OPERATIONS ##########
  extend type Query {
    getDriverDetails: Driver!
    drivers: [Driver]
    getDefaultCar: Car
    getDriverWorkStatus: MessageResponse
    getMenuUnreadFields: MenuUnreadFields
    getDriverByAdmin(id: ID!): MultiLanguageDriver
    getDriverAboutMe: DriverAboutMe
    getDriverHistoryByShopAdmin(
      driverId: ID!
      filters: DriverHistoryFilters
      pagination: Pagination
    ): [DriverHistory]
    getDriversByAdmin(
      filters: DriverFilters
      pagination: Pagination
      sort: DriversSortInput
    ): [MultiLanguageDriver]!
    getDriversCountByAdmin(filters: DriverFilters): Int
    getDriverDistanceAndSuccessfulTripByShopAdmin(driverId: ID!): CountDistance
    getDriversByShopAdmin(filters: DriverFilters, sort: DriversShopAdminSortInput): [Driver]!
    getDriversCountByShopAdmin(filters: DriverFilters): Int
    getAllDrivers: [Driver]
    getDriversVerificationRequestsByAdmin(
      filters: GetDriversVerificationRequestsByAdminQueryInput
      pagination: Pagination
      sort: GetDriversVerificationRequestsByAdminSortInput
    ): [Driver]
    getDriversVerificationRequestsCountByAdmin(
      filters: GetDriversVerificationRequestsByAdminQueryInput
    ): Int
    getOnlineDriverSetByAdmin: [Driver!]!
    getInTripDriverSetByAdmin: [InTripDriverSet!]!
    getDriverStatisticsList(filters: PeriodFilters): DriverStatisticsList
    getDriverStatisticsListCountTrips(filters: PeriodHourFilters): [DriverStatisticsListCountTrip]
    getDriverStatisticsListByAdmin(driverId: ID!, filters: PeriodFilters): DriverStatisticsList
    getDriverStatisticsListCountTripsByAdmin(
      driverId: ID!
      filters: PeriodHourFilters
    ): [DriverStatisticsListCountTrip]
  }

  extend type Mutation {
    getDriverPhoneSignUpCode(phoneNumber: String!): phoneVerificationResponse!
    checkDriverPhoneSignupCode(phoneNumber: String!, phoneSignUpCode: String!): Boolean
    driverSignUp(data: driverSignUpInput!): Driver!
    publicDriverSignUp(driverData: publicDriverSignUpInput!): Driver!
    driverLogin(data: driverLoginInput): Driver!
    createDriverByShopAdmin(data: createDriverByShopAdminInput!): Driver!
    updateDriverInfoByShopAdmin(driverId: ID!, input: UpdateDriverProfileInfoByAdminInput!): Driver
    deleteDriverByShopAdmin(idSet: [ID!]!): [Driver!]!
    getDriverForgotPasswordCode(phoneNumber: String!): getForgotPasswordCodeResponse!
    checkDriverForgotPasswordCode(
      forgotPasswordByPhoneNumberInput: forgotPasswordByPhoneNumberInput!
    ): forgotPasswordResponse!
    driverChangePassword(changePasswordInput: DriverChangePasswordInput!): changePasswordResponse!
    getDriverForgotPasswordEmailCode(email: String!): getForgotPasswordCodeResponse!
    checkDriverForgotPasswordEmailCode(
      forgotPasswordByEmailInput: forgotPasswordByEmailInput!
    ): forgotPasswordResponse!
    setDefaultCar(id: ID!): Driver
    updateDriverWorkStatus(status: WorkStatusInput!): Driver
    driverVerificationRequest(inputs: DriverVerifyRequestInput): Driver
    approveDriverVerificationRequestByAdmin(driverId: ID!): Driver
    rejectDriverVerificationRequestByAdmin(driverId: ID!, message: String): Driver
    suspendDriverByAdmin(idSet: [ID!]!): [Driver!]!
    activateDriverByAdmin(driverId: ID!): Driver
    driverSignUpByAdmin(input: DriverSignUpByAdminInput!): Driver
    driverSignUpByShopAdmin(input: DriverSignUpByAdminInput!): Driver
    updateDriverProfile(input: UpdateDriverProfileInput!): Driver
    updateDriverInfoByAdmin(driverId: ID!, input: UpdateDriverProfileInfoByAdminInput!): Driver
    setDefaultCarByAdmin(driverId: ID!, carId: ID!): Driver
    createDriverVerificationRequestByAdmin(
      input: DriverVerifyRequestByAdminInput!
      driverId: ID!
    ): Driver
  }
  ########## INPUTS & ENUMS ##########
  input driverSignUpInput {
    fullName: String!
    email: String!
    phoneNumber: String!
    password: String!
    fcm: String!
  }

  input DriverChangePasswordInput {
    currentPassword: String
    newPassword: String
  }

  input publicDriverSignUpInput {
    fullName: String!
    email: String!
    password: String!
    phoneNumber: String!
    birthDate: Date!
    address: String!
    gender: String!
    zipCode: String!
  }
  input createDriverByShopAdminInput {
    fullName: String!
    email: String!
    phoneNumber: String!
    password: String!
    profileImageUrl: String
    address: DriverAddressInput
    gender: DriverGender
  }

  input DriversSortInput {
    _id: Int
    fullName: Int
    defaultCar: Int
    drivingLicence: Int
    averageRate: Int
    sumRate: Int
    numberOfRates: Int
    hasNotification: Int
    email: Int
    phoneInt: Int
    profileImageUrl: Int
    birthDate: Int
    state: Int
    gender: Int
    isVerified: Int
    address: Int
    workStatus: Int
    token: Int
    createdAt: Int
    updatedAt: Int
  }

  input DriversShopAdminSortInput {
    _id: Int
    fullName: Int
    defaultCar: Int
    drivingLicence: Int
    averageRate: Int
    sumRate: Int
    numberOfRates: Int
    hasNotification: Int
    email: Int
    phoneInt: Int
    profileImageUrl: Int
    birthDate: Int
    state: Int
    gender: Int
    isVerified: Int
    address: Int
    workStatus: Int
    token: Int
    createdAt: Int
    updatedAt: Int
  }

  input driverLoginInput {
    emailOrPhoneNumber: String!
    password: String!
    fcm: String!
  }
  input DriverHistoryFilters {
    createdAtFrom: Date
    createdAt: Date
  }
  input DriverVerifyRequestInput {
    gender: DriverGender
    birthDate: Date
    taxCode: String
    creditCardNumber: String
    address: DriverAddressInput
    profileImageUrl: String
    drivingLicence: DriverDrivingLicenceInput
    drivingRecordPhotoUrl: String
    canadianVerificationPhotoUrl: String
    canadianVerificationExpireDate: Date
    backgroundCheckDocumentPhotoUrl: String
  }

  input DriverVerifyRequestByAdminInput {
    gender: DriverGender!
    birthDate: Date!
    address: DriverAddressByAdminInput!
    profileImageUrl: String!
    drivingLicence: DriverDrivingLicenceByAdminInput!
    drivingRecordPhotoUrl: String!
    canadianVerificationPhotoUrl: String!
    canadianVerificationExpireDate: Date!
    backgroundCheckDocumentPhotoUrl: String!
  }

  input DriverAddressByAdminInput {
    full: String!
    zipCode: String!
  }

  input DriverDrivingLicenceByAdminInput {
    licenceId: String!
    photoUrl: String!
    expireDate: Date!
  }

  input DriverAddressInput {
    full: String
    zipCode: String
  }

  input DriverDrivingLicenceInput {
    licenceId: String
    photoUrl: String
    expireDate: Date
  }

  input DriverFilters {
    _id: ID
    fullName: String
    car: ID
    shop: ID
    defaultCar: ID
    averageRateFrom: Float
    averageRate: Float
    sumRate: Float
    numberOfRates: Int
    hasNotification: Boolean
    email: String
    phoneNumber: String
    profileImageUrl: Upload
    birthDate: Date
    createdAtFrom: Date
    createdAt: Date
    updatedAt: Date
    state: DriverState
    gender: String
    isVerified: Boolean
    emailVerified: Boolean
    phoneNumberVerified: Boolean
    workStatus: String
    IncompleteInformationDrivers: Boolean
  }

  input PeriodFilters {
    from: Date
    to: Date
  }
  input PeriodHourFilters {
    from: Date
    to: Date
    hour: Int
  }
  enum DriverGender {
    MALE
    FEMALE
  }

  enum WorkStatusInput {
    ACTIVE
    INACTIVE
  }

  enum DriverVerificationRequestsStatus {
    APPROVED
    REJECTED
    PENDING
  }

  input DriverSignUpByAdminInput {
    fullName: String!
    email: String!
    phoneNumber: String!
    password: String!
  }

  input UpdateDriverProfileInput {
    gender: DriverGender
    address: DriverAddressInput
    birthDate: Date
    profileImageUrl: String
    fullName: String
  }

  input UpdateDriverProfileInfoByAdminInput {
    gender: DriverGender
    address: DriverAddressInput
    birthDate: Date
    profileImageUrl: String
    fullName: String
    email: String
    phoneNumber: String
    workStatus: WorkStatusInput
    hasNotification: Boolean
    emailVerified: Boolean
    phoneNumberVerified: Boolean
    stripeAccountId: String
    passwordHash: String
    isVerified: Boolean
  }

  input GetDriversVerificationRequestsByAdminQueryInput {
    status: DriverVerificationRequestsStatus
    rejectionMessage: String
    phoneNumber: String
    fullName: String
    phoneNumberVerified: Boolean
    email: String
    emailVerified: Boolean
    state: DriverState
    createdAtFrom: Date
    createdAt: Date
    _id: ID
  }

  input GetDriversVerificationRequestsByAdminSortInput {
    submitDate: Int
    responseDate: Int
    createdAt: Int
    updatedAt: Int
    workStatus: Int
    phoneNumberVerified: Int
    emailVerified: Int
    state: Int
    fullName: Int
    phoneNumber: Int
  }
  enum DriverState {
    ACTIVE
    SUSPENDED
  }
`

export default typeDef
