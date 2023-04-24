import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type Payment {
    _id: ID!
    trip: Trip
    order: Order
    user: User
    driver: Driver
    shop: Shop
    transactionId: Transaction
    status: PaymentStatus
    amount: Float
    createdAt: Date
    updatedAt: Date
    type: PaymentType
    for: PaymentFor
    transactionMethod: TransactionMethod
    description: String
  }
  type PaymentTaking {
    details: [Payment]
    allTakings: Float
    paid: Float
    unPaid: Float
  }
  type DriverOrShopPaymentDetail {
    details: [Payment]
    all: Float
    paid: Float
    shouldPay: Float
  }

  type CheckLastPaymentResult {
    # orderId: ID
    tripId: ID
    hasUnpaidTripPayment: Boolean
    # hasUnpaidOrderPayment: Boolean
  }

  type PaymentInfo {
    payment: Payment
    receiveMoneyByDriver: Float
    receiveMoneyByBedo: Float
    receiveMoneyByShop: Float
  }

  ########## OPERATIONS ##########
  extend type Query {
    getPaymentMethodStatus: PaymentMethodStatus
    getPayments(pagination: Pagination, filters: GetPaymentsQueryInput): [Payment]
    getFailedPayments(pagination: Pagination): [Payment]
    getPayment(_id: ID!): Payment
    getPaymentsCount(filters: GlobalFilters): Int
    getDriverPayments(pagination: Pagination, filters: GetDriverOrShopPaymentsQueryInput): [Payment]
    getDriverPayment(_id: ID!): Payment
    getShopPayments(
      filters: GetShopPaymentsByAdminQueryInput
      pagination: Pagination
      sort: GetShopPaymentsSortInput
    ): [Payment]
    getShopPaymentsCount(filters: GetShopPaymentsByAdminQueryInput): Int
    getShopPayment(_id: ID!): Payment
    getPaymentsByAdmin(
      filters: GetShopPaymentsByAdminQueryInput
      pagination: Pagination
      sort: GetShopPaymentsByAdminSortInput
    ): [Payment]
    getPaymentsByAdminCount(filters: GetShopPaymentsByAdminQueryInput): Int
    getPaymentTakingsByAdmin(
      filters: GetTakingsByAdminQueryInput
      withDetail: Boolean = true
    ): PaymentTaking
    getDriverPaymentDetailByAdmin(
      filters: GetDriverPaymentDetailByAdminQueryInput
      withDetail: Boolean = true
    ): DriverOrShopPaymentDetail
    getShopPaymentDetailByAdmin(
      filters: GetShopPaymentDetailByAdminQueryInput
      withDetail: Boolean = true
    ): DriverOrShopPaymentDetail
    checkLastPayment: CheckLastPaymentResult
    getPaymentInfoByAdmin(
      type: TripKind
      filters: GetPaymentInfoByAdminQueryInput
      pagination: Pagination
    ): [PaymentInfo]
    getPaymentInfoByAdminCount(type: TripKind, filters: GetPaymentInfoByAdminQueryInput): Int
    getBedoTotalPaymentByAdmin: Float
  }
  extend type Mutation {
    createPayment(inputs: CreateAndUpdatePaymentInput!): Payment
    updatePayment(_id: ID!, inputs: CreateAndUpdatePaymentInput!): Payment
    deletePayment(_id: ID!): Payment
    manualResolvePayment(_id: ID!): Payment
    updatePaymentTypeByAdmin(_id: ID!, inputs: UpdatePaymentTypeByAdminInput!): Payment
  }
  ########## INPUTS & ENUMS ##########
  input GetShopPaymentsSortInput {
    createdAt: Int
    amount: Int
  }

  input GetPaymentsQueryInput {
    _id: ID
    from: Date
    to: Date
    status: PaymentStatus
    amount: Float
    transactionId: String
    for: PaymentFor
  }
  input GetDriverOrShopPaymentsQueryInput {
    _id: ID
    from: Date
    to: Date
    status: PaymentStatus
    amount: Float
    for: PaymentFor
  }
  input GetShopPaymentsByAdminQueryInput {
    _id: ID
    user: ID
    shop: ID
    driver: ID
    driverName: String
    passengerName: String
    shopName: String
    driverPhoneNumber: String
    passengerPhoneNumber: String
    shopPhoneNumber: String
    from: Date
    to: Date
    paidAt: Date
    createdAtFrom: Date
    createdAt: Date
    status: PaymentStatus
    type: PaymentType
    amountFrom: Float
    amount: Float
    transactionId: String
    for: PaymentFor
    updatedAt: Date
  }
  input GetShopPaymentsByAdminSortInput {
    createdAt: Int
    updatedAt: Int
    amount: Int
  }
  input CreateAndUpdatePaymentInput {
    user: ID
    transactionId: String
    status: PaymentStatus
    amount: Float
    for: PaymentFor
  }
  input UpdatePaymentTypeByAdminInput {
    type: UpdatePaymentType
  }
  input GetTakingsByAdminQueryInput {
    user: ID
    from: Date
    to: Date
    for: PaymentFor
  }
  input GetDriverPaymentDetailByAdminQueryInput {
    driver: ID
    from: Date
    to: Date
    for: PaymentFor
  }
  input GetShopPaymentDetailByAdminQueryInput {
    shop: ID
    from: Date
    to: Date
    for: PaymentFor
  }
  input GetPaymentInfoByAdminQueryInput {
    _id: ID
    driverName: String
    driverPhoneNumber: String
    driverEmail: String
    passengerName: String
    passengerPhoneNumber: String
    amountFrom: Float
    amountTo: Float
    tripCreatedAtFrom: Date
    tripCreatedAtTo: Date
    receiveMoneyByDriverFrom: Float
    receiveMoneyByDriverTo: Float
    receiveMoneyByBedoFrom: Float
    receiveMoneyByBedoTo: Float
    receiveMoneyByShopFrom: Float
    receiveMoneyByShopTo: Float
  }
  enum TripKind {
    RIDE_AND_DELIVERY
    FOOD_AND_PURCHASE
    ALL
  }
  enum PaymentStatus {
    PAID
    UNPAID
    FAILED
  }
  enum PaymentType {
    PAY_FROM_USER_TO_SHOP
    PAY_FROM_USER_TO_DRIVER
    PAY_FROM_SHOP_TO_DRIVER
    PAY_FROM_USER_TO_BEDO
    PAY_FROM_SHOP_TO_BEDO
    PAY_FROM_DRIVER_TO_SHOP
    PAY_FROM_DRIVER_TO_BEDO
    PAY_FROM_BEDO_TO_SHOP
    PAY_FROM_BEDO_TO_DRIVER
    PAY_FROM_BEDO_TO_USER
  }
  enum PaymentMethodStatus {
    HAS_ACCOUNT
    DOES_NOT_HAVE_ACCOUNT
  }
  enum UserPaymentMethodStatus {
    HAS_PAYMENT_METHOD
    DOES_NOT_HAVE_PAYMENT_METHOD
  }
  enum PaymentFor {
    DELIVERY
    RIDE
    RESTAURANT
    PURCHASE
  }
  enum UpdatePaymentType {
    PAY_FROM_USER_TO_DRIVER
    PAY_FROM_DRIVER_TO_BEDO
    PAY_FROM_BEDO_TO_SHOP
  }
`

export default typeDef
