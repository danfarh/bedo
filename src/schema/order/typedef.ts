/* eslint-disable prettier/prettier */
import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type Order {
    _id: ID
    user: User
    cart: Cart
    shop: Shop
    payment: Payment
    shopPayment: ID
    promotion: OrderPromotion
    shipmentModel: OrderShipmentModel
    type: OrderType
    commission: Float
    commissionPercent: Int
    status: OrderStatus
    reserveCanceled: Boolean
    finalPrice: Float
    deliverOrderToCourierAt: Date
    rejectedFor: OrderRejectedFor
    createdAt: Date
    address: String
    paidAt: Date
    shipmentAt: Date
    tracking: OrderTracking
    finished: Boolean
    updatedAt: Date
    commented: ShopCommented
    HST: Float
    HSTPercent: Int
    userLocation: OrderUserLocation
    productsPrice: Float
    priceAfterDiscount: Float
    delivery: Float
    subtotal: Float
    total: Float
    shopIncome: Float
    discount: Float
    priceAfterPromotionDiscount: Float
    promotionDiscount: Float
    description: String
    shopInvoice: Float
    sparkShare: Float
    shopShare: Float
    deliveryWithoutPromotion: Float
    deliveryPromotionDiscount: Float
    trip: Trip
  }
  type OrderUserLocation {
    long: Float
    lat: Float
  }
  type OrderTracking {
    trackId: String
    estimatedDelivery: Date
  }
  type OrderPaginatorResponse {
    data: [Order]
    meta: OrderPaginatorResponseMeta
  }
  type OrderPaginatorResponseMeta {
    currentPage: Int
    totalCount: Int
    itemsPerPage: Int
    previousPage: Int
    nextPage: Int
  }
  type OrderDetail {
    orders: [Order]
    numberOfOrders: Float
    benefitForSpark: Float
    userTakings: Float
    shopsIncome: Float
  }

  type ShopTotalOrdersAndTotalAmountResponse {
    totalOrdersCount: Int
    totalOrderAmount: Float
  }

  type GetLastShopOrderRes {
    order: Order
    redirectToCommentSection: Boolean
  }
  type OrdersStatisticsListCountIntValues {
    num: Int
    date: Date
  }
  type OrdersStatisticsListCountFloatValues {
    num: Float
    date: Date
  }
  type CountOrdersStatisticsList {
    numberOfSales: [OrdersStatisticsListCountIntValues]
    receivedOrders: [OrdersStatisticsListCountIntValues]
    successfulOrders: [OrdersStatisticsListCountIntValues]
    unSuccessfulOrders: [OrdersStatisticsListCountIntValues]
    returnedOrders: [OrdersStatisticsListCountIntValues]
    cashDaySales: [OrdersStatisticsListCountFloatValues]
    cardDaySales: [OrdersStatisticsListCountFloatValues]
    companyCommission: [OrdersStatisticsListCountFloatValues]
  }
  type OrdersStatisticsList {
    numberOfSales: Int
    receivedOrders: Int
    successfulOrders: Int
    unSuccessfulOrders: Int
    returnedOrders: Int
    cashDaySales: Float
    cardDaySales: Float
    companyCommission: Float
  }
  ########## OPERATIONS ##########
  extend type Query {
    getOrdersByAdmin(
      pagination: Pagination
      filters: GetOrdersByAdminQueryInput
      sort: GetOrdersByAdminSortInput
    ): [Order]
    getOrdersByAdminCount(filters: GetOrdersByAdminQueryInput): Int
    getOrderByAdmin(id: ID): Order
    getLastShopOrder: GetLastShopOrderRes
    getOrder(_id: ID!): Order!
    getShopTotalOrdersCountAndTotalAmountByShopAdmin(
      filters: RangeFilerInput!
    ): ShopTotalOrdersAndTotalAmountResponse
    getOrdersCount(filters: GlobalFilters): Int
    getOrdersHistory(
      pagination: Pagination
      sort: orderSort
      filters: OrderHistoryFiltersInput!
    ): [Order]
    getOrdersHistoryByShopAdmin(
      pagination: Pagination
      filters: OrderHistoryByShopAdminFiltersInput
      sort: OrderHistoryByShopAdminSortInput
    ): [Order]
    getOrdersHistoryByShopAdminCount(filters: OrderHistoryByShopAdminFiltersInput): Int
    getOrderByShopAdmin(id: ID!): Order
    getOrderTracking(trackId: String!): Order
    getOrdersDetailByAdmin(
      filters: getShopOrdersQuery
      sort: GetTripOrdersDetailSortInput
    ): OrderDetail
    getOrdersByShopAdmin(
      filters: GetOrdersByShopAdminQueryInput
      pagination: Pagination
      sort: GetOrdersByShopAdminSortInput
    ): [Order]
    getOrdersByShopAdminCount(filters: GetOrdersByShopAdminQueryInput): Int
    getOrderStatisticsListCountValuesByShopAdmin(
      filters: PeriodHourFilters
    ): CountOrdersStatisticsList
    getFullReportByShopAdmin(pagination: Pagination): [Order]
    getOrdersStatisticsListByShopAdmin(filters: PeriodFilters): OrdersStatisticsList
    getOrderStatisticsListCountValuesByAdmin(
      shopId: ID!
      filters: PeriodHourFilters
    ): CountOrdersStatisticsList
    getFullReportByAdmin(shopId: ID!, pagination: Pagination): [Order]
    getOrdersStatisticsListByAdmin(shopId: ID!, filters: PeriodFilters): OrdersStatisticsList
  }
  extend type Mutation {
    createOrder(inputs: createOrderInput!, onlyCalculate: Boolean = false): Order!
    applyPromotionToOrder(_id: ID!, inputs: applyPromotionToOrder!): Order!
    orderAcceptance(category: String): Order!
    orderRejection(category: String): MessageResponse
    # cancelOrderReservation(orderId: ID!): MessageResponse
    reCreateOrderDeliveryByShopAdmin(orderId: ID!, reserve: Boolean = false): Order
    rejectOrderByShopAdmin(orderId: ID!, rejectedFor: OrderRejectedFor): Order
    acceptOrderByShopAdmin(inputs: AcceptOrderInput, orderId: ID!): Order
    updateOrderByAdmin(orderId: ID!, inputs: updateOrderByAdminInput): Order
    deleteOrderByAdmin(orderId: ID!): MessageResponse
    # TODO remove below mutation
    finishedOrder(orderId: ID!): Order
  }
  extend type Subscription {
    createOrder: Order
    updateOrder(orderId: ID): Order
  }

  input AcceptOrderInput {
    preparationTime: Int!
    shipmentModel: OrderShipmentModel!
    driver: ID
  }
  ########## INPUTS & ENUMS ##########
  input RangeFilerInput {
    from: Date
    to: Date
  }

  enum OrderShipmentModel {
    SHOP
    BEDO
  }
  enum OrderType {
    PURCHASE
    RESTAURANT
  }
  enum OrderStatus {
    PENDING
    ACCEPTED
    PREPARING
    SHIPPING
    DELIVERED
    REJECTED
    DELIVERY_NOT_ACCEPTED
    FINISHED_DUE_TO_NOT_PAYING
  }
  enum OrderRejectedFor {
    packingDamaged
    damagedForPacking
    differentProduct
    noReceiver
    deliveryWasNotAccepted
  }
  input createOrderInput {
    shipmentModel: OrderShipmentModel!
    userLocation: LocationInput!
    shop: ID!
    rootCategory: ID!
    address: String
    promotion: ID
    description: String
    trip: ID
  }
  input applyPromotionToOrder {
    rootCategory: ID!
    promotion: ID!
    userLocation: LocationInput
  }
  input OrderHistoryFiltersInput {
    rootCategory: ID!
    finished: Boolean
    status: OrderStatus
    rejectedFor: OrderRejectedFor
    type: OrderType
    _id: ID
  }

  input GetTripOrdersDetailSortInput {
    createdAt: Int
  }

  input OrderHistoryByShopAdminFiltersInput {
    _id: ID
    rootCategory: ID
    user: ID
    passengerName: String
    passengerPhoneNumber: String
    cart: ID
    promotion: ID
    payment: ID
    address: String
    finalPrice: Float
    deliverOrderToCourierAt: Date
    shipmentModel: OrderShipmentModel
    type: OrderType
    status: OrderStatus
    rejectedFor: OrderRejectedFor
    createdAtFrom: Date
    createdAt: Date
    updatedAt: Date
    paidAt: Date
    shipmentAt: Date
    finished: Boolean
    commented: ShopCommented
    tracking: OrderTrackingQueryInput
    commission: Float
    commissionPercent: Int
    productsPrice: Float
    priceAfterDiscount: Float
    delivery: Float
    shopIncome: Float
    discount: Float
    priceAfterPromotionDiscount: Float
    promotionDiscount: Float
    description: String
    shopInvoice: Float
    sparkShare: Float
  }
  input OrderHistoryByShopAdminSortInput {
    address: Int
    shipmentModel: Int
    type: Int
    status: Int
    rejectedFor: Int
    createdAt: Int
    updatedAt: Int
    paidAt: Int
    shipmentAt: Int
    finished: Int
    commented: Int
    finalPrice: Int
    deliverOrderToCourierAt: Date
    estimatedDelivery: Int
    commission: Int
    commissionPercent: Int
    productsPrice: Int
    priceAfterDiscount: Int
    delivery: Int
    shopIncome: Int
    discount: Int
    priceAfterPromotionDiscount: Int
    promotionDiscount: Int
    description: Int
    shopInvoice: Int
    sparkShare: Int
  }

  input getShopOrdersQuery {
    _id: ID
    from: Date!
    to: Date!
    user: ID
    shop: ID
    passengerName: String
    shopName: String
    passengerPhoneNumber: String
    shopPhoneNumber: String
    rootCategory: ID
    paidAt: Date
    type: String
    shipmentModel: String
    status: String
    rejectedFor: String
    finished: Boolean
    estimatedDelivery: Int
  }
  input orderSort {
    createdAt: Int
    updatedAt: Int
    paidAt: Int
    finished: Int
    rejectedFor: Int
    shipmentAt: Int
    finalPrice: Int
    type: Int
    estimatedDelivery: Int
  }

  input OrderTrackingQueryInput {
    trackId: String
    estimatedDelivery: Date
  }

  enum ShopCommented {
    NOT_COMMENTED
    COMMENTED
    SKIPPED
  }
  input GetOrdersByAdminQueryInput {
    _id: ID
    user: ID
    passengerName: String
    shopName: String
    passengerPhoneNumber: String
    shopPhoneNumber: String
    cart: ID
    rootCategory: ID
    payment: ID
    shop: ID
    promotion: ID
    address: String
    shipmentModel: OrderShipmentModel
    type: OrderType
    commissionFrom: Float
    commission: Float
    finalPriceFrom: Float
    finalPrice: Float
    status: OrderStatus
    deliverOrderToCourierAt: Date
    rejectedFor: OrderRejectedFor
    createdAtFrom: Date
    createdAt: Date
    updatedAt: Date
    paidAt: Date
    shipmentAt: Date
    tracking: OrderTrackingQueryInput
    finished: Boolean
    commented: ShopCommented
  }
  input GetOrdersByShopAdminQueryInput {
    _id: ID
    user: ID
    passengerName: String
    shopName: String
    passengerPhoneNumber: String
    shopPhoneNumber: String
    cart: ID
    payment: ID
    promotion: ID
    address: String
    isCurrentOrder: Boolean
    shipmentModel: OrderShipmentModel
    type: OrderType
    commission: Float
    finalPriceFrom: Float
    finalPrice: Float
    deliverOrderToCourierAt: Date
    status: OrderStatus
    rejectedFor: OrderRejectedFor
    createdAtFrom: Date
    createdAt: Date
    updatedAt: Date
    paidAt: Date
    shipmentAt: Date
    tracking: OrderTrackingQueryInput
    finished: Boolean
    commented: ShopCommented
  }
  input GetOrdersByAdminSortInput {
    address: Int
    shipmentModel: Int
    type: Int
    commission: Int
    finalPrice: Int
    status: Int
    rejectedFor: Int
    createdAt: Int
    updatedAt: Int
    paidAt: Int
    shipmentAt: Int
    estimatedDelivery: Int
    finished: Int
    commented: Int
  }
  input GetOrdersByShopAdminSortInput {
    commission: Int
    finalPrice: Int
    createdAt: Int
    updatedAt: Int
    paidAt: Int
    shipmentAt: Int
    estimatedDelivery: Int
    finished: Int
  }
  input updateOrderByAdminInput {
    shipmentModel: OrderShipmentModel
    type: OrderType
    commission: Float
    commissionPercent: Int
    status: OrderStatus
    finalPrice: Float
    createdAt: Date
    address: String
    total: Float
    priceAfterPromotionDiscount: Float
    promotionDiscount: Float
    tracking: OrderTrackingQueryInput
  }
`

export default typeDef
