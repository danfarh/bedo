import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type Transaction {
    paymentIntent: String
    transactionId: String
    _id: ID
    payments: [Payment]
    status: PaymentStatus
    paidAt: Date
    type: PaymentType
    amount: Float
    user: User
    shop: Shop
    driver: Driver
    createdAt: Date
    updatedAt: Date
    transactionMethod: TransactionMethod
    reversalId: String
    refundId: String
    reversed: Boolean
  }
  ########## OPERATIONS ##########
  extend type Query {
    getTransactions(
      filters: GetTransactionQueryInput
      pagination: Pagination
      sort: GetTransactionSortInput
    ): [Transaction]
    getDriverTransactions(
      filters: GetTransactionQueryInput
      pagination: Pagination
      sort: GetTransactionSortInput
    ): [Transaction]
    getShopTransactions(
      filters: GetTransactionQueryInput
      pagination: Pagination
      sort: GetTransactionSortInput
    ): [Transaction]
    getShopTransactionsCount(filters: GetTransactionQueryInput): Int
    getTransactionsByAdmin(
      filters: GetTransactionByAdminQueryInput
      pagination: Pagination
      sort: GetTransactionSortInput
    ): [Transaction]
    getTransactionsByAdminCount(filters: GetTransactionByAdminQueryInput): Int
    getTransactionsByShopAdmin(
      filters: GetTransactionsByShopAdminQuryInput!
      pagination: Pagination
    ): [Transaction]
    getTotalTransactionsAmountByShopAdmin: Float
  }
  extend type Mutation {
    refundTransactionByAdmin(_id: ID!): Transaction
    createTransactionByDriver(payments: [ID!]!): Transaction
    createTransactionByShop(payments: [ID!]!): Transaction
    createTransactionByAdmin(input: CreateTransactionByAdminInput!): Transaction
    createTransactionFromDriverToBedo(payments: [ID!]!): Transaction
    createTransactionFromShopToBedo(payments: [ID!]!): Transaction
  }
  ########## INPUTS & ENUMS ##########
  input GetTransactionQueryInput {
    _id: ID
    status: PaymentStatus
    paidAtFrom: Date
    paidAt: Date
    amountFrom: Float
    amount: Float
    transactionId: String
    reversed: Boolean
    createdAtFrom: Date
    createdAt: Date
  }
  input GetTransactionByAdminQueryInput {
    _id: ID
    status: PaymentStatus
    paidAtFrom: Date
    paidAt: Date
    amountFrom: Float
    amount: Float
    transactionId: String
    user: ID
    driver: ID
    shop: ID
    driverName: String
    passengerName: String
    shopName: String
    driverPhoneNumber: String
    passengerPhoneNumber: String
    shopPhoneNumber: String
    type: PaymentType
    createdAtFrom: Date
    createdAt: Date
    updatedAt: Date
  }
  input GetTransactionSortInput {
    createdAt: Int
    updatedAt: Int
    paidAt: Int
    amount: Int
  }
  input CreateTransactionByAdminInput {
    data: TransactionForInput!
    payments: [ID!]!
  }
  input GetTransactionsByShopAdminQuryInput {
    type: TransactionType!
  }
  input TransactionForInput {
    for: TransactionFor!
    id: ID!
  }
  enum TransactionType {
    INPUT
    OUTPUT
    TOTAL
  }
  enum TransactionFor {
    driver
    shop
  }
  enum TransactionMethod {
    ONLINE
    CASH
  }
`

export default typeDef
