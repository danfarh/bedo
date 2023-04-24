import { gql } from 'apollo-server-express'
import admin from './admin'
import user from './user'
import auth from './auth'
import car from './car'
import driver from './driver'
import userToken from './userToken'
import message from './message'
import conversation from './conversation'
import role from './role'
import permission from './permission'
import upload from './upload'
import trip from './trip'
import constant from './constant'
import tripPromotion from './tripPromotion'
import tripPromotionUsed from './tripPromotionUsed'
import favoritePlaces from './favoritePlaces'
import commentOnDriver from './commentOnDriver'
import commentOnShop from './commentOnShop'
import category from './category'
import product from './product'
import shop from './shop'
import attribute from './attribute'
import attributeGroup from './attributeGroup'
import commentsListOnShop from './commentsListOnShop'
import comment from './comment'
import canceledTripReason from './canceledTripReason'
import cart from './cart'
import carType from './carType'
import currency from './currency'
import driverCanceledTrip from './driverCanceledTrip'
import driverReadyComments from './driverReadyComments'
import shopReadyComments from './shopReadyComments'
import favoritesProducts from './favoritesProducts'
import payment from './payment'
import orderPromotion from './orderPromotion'
import order from './order'
import notification from './notification'
import advertisement from './advertisement'
import help from './help'
import legal from './legal'
import reqCarType from './reqCarType'
import shopMenu from './shopMenu'
import tripOrder from './tripOrder'
import readyMessage from './readyMessage'
import region from './region'
import carModel from './carModel'
import carBrand from './carBrand'
import carColor from './carColor'
import shopReceipt from './shopReceipt'
import parcelWeight from './parcelWeight'
import parcelVolume from './parcelVolume'
import shopFavoriteLocations from './shopFavoriteLocations'
import passengerReadyComments from './passengerReadyComments'
import commentOnPassenger from './commentOnPassenger'
import driverHowItWorks from './driverHowItWorks'
import passengerCanceledTrip from './passengerCanceledTrip'
import transaction from './transaction'
import cancelReservationConstant from './cancelReservationConstant'
import voiceCall from './voiceCall'
import shopHowItWorks from './shopHowItWorks'
import errors from './errors'

const typeDef: any = gql`
  scalar Date
  scalar Upload
  type Subscription
  type Query
  type Mutation
  input Pagination {
    limit: Int
    skip: Int
  }
  type Location {
    long: Float!
    lat: Float!
    angle: Float
  }
  input LocationInput {
    long: Float!
    lat: Float!
  }
  input LocationWithAngleInput {
    long: Float!
    lat: Float!
    angle: Float
  }
  input GlobalFilters {
    createdAt: Date
    updatedAt: Date
  }
  type MessageResponse {
    message: String
  }
  # enums
  enum LocationType {
    Point
  }

  enum LanguagesEnum {
    en
    az
    ru
  }

  type MultiLanguageField {
    lang: LanguagesEnum
    value: String
  }

  input MultiLanguageInput {
    lang: LanguagesEnum
    value: String
  }
`

const typeDefs: any[] = [
  typeDef,
  voiceCall.typeDef,
  user.typeDef,
  auth.typeDef,
  car.typeDef,
  driver.typeDef,
  userToken.typeDef,
  message.typeDef,
  conversation.typeDef,
  constant.typeDef,
  role.typeDef,
  permission.typeDef,
  trip.typeDef,
  upload.typeDef,
  trip.typeDef,
  tripPromotion.typeDef,
  commentOnDriver.typeDef,
  tripPromotionUsed.typeDef,
  favoritePlaces.typeDef,
  commentOnDriver.typeDef,
  commentOnShop.typeDef,
  shopHowItWorks.typeDef,
  shop.typeDef,
  admin.typeDef,
  category.typeDef,
  product.typeDef,
  attribute.typeDef,
  attributeGroup.typeDef,
  commentsListOnShop.typeDef,
  comment.typeDef,
  tripPromotion.typeDef,
  canceledTripReason.typeDef,
  cart.typeDef,
  carType.typeDef,
  currency.typeDef,
  driverCanceledTrip.typeDef,
  driverReadyComments.typeDef,
  shopReadyComments.typeDef,
  favoritesProducts.typeDef,
  payment.typeDef,
  orderPromotion.typeDef,
  message.typeDef,
  order.typeDef,
  notification.typeDef,
  advertisement.typeDef,
  help.typeDef,
  legal.typeDef,
  reqCarType.typeDef,
  shopMenu.typeDef,
  tripOrder.typeDef,
  readyMessage.typeDef,
  region.typeDef,
  carModel.typeDef,
  carColor.typeDef,
  carBrand.typeDef,
  shopReceipt.typeDef,
  parcelWeight.typeDef,
  parcelVolume.typeDef,
  shopFavoriteLocations.typeDef,
  passengerReadyComments.typeDef,
  commentOnPassenger.typeDef,
  driverHowItWorks.typeDef,
  passengerCanceledTrip.typeDef,
  transaction.typeDef,
  cancelReservationConstant.typeDef,
  errors.typeDef
]
const resolvers: any[] = [
  voiceCall.resolver,
  user.resolver,
  auth.resolver,
  car.resolver,
  driver.resolver,
  userToken.resolver,
  message.resolver,
  constant.resolver,
  role.resolver,
  permission.resolver,
  shopHowItWorks.resolver,
  trip.resolver,
  upload.resolver,
  trip.resolver,
  tripPromotion.resolver,
  commentOnDriver.resolver,
  commentOnShop.resolver,
  tripPromotionUsed.resolver,
  favoritePlaces.resolver,
  commentOnDriver.resolver,
  shop.resolver,
  admin.resolver,
  category.resolver,
  product.resolver,
  attribute.resolver,
  attributeGroup.resolver,
  commentsListOnShop.resolver,
  comment.resolver,
  tripPromotion.resolver,
  canceledTripReason.resolver,
  cart.resolver,
  carType.resolver,
  conversation.resolver,
  currency.resolver,
  driverCanceledTrip.resolver,
  driverReadyComments.resolver,
  shopReadyComments.resolver,
  favoritesProducts.resolver,
  payment.resolver,
  orderPromotion.resolver,
  order.resolver,
  notification.resolver,
  advertisement.resolver,
  help.resolver,
  legal.resolver,
  reqCarType.resolver,
  shopMenu.resolver,
  tripOrder.resolver,
  readyMessage.resolver,
  region.resolver,
  carModel.resolver,
  carColor.resolver,
  carBrand.resolver,
  shopReceipt.resolver,
  parcelWeight.resolver,
  parcelVolume.resolver,
  shopFavoriteLocations.resolver,
  passengerReadyComments.resolver,
  commentOnPassenger.resolver,
  driverHowItWorks.resolver,
  passengerCanceledTrip.resolver,
  transaction.resolver,
  cancelReservationConstant.resolver,
  errors.resolver
]

export { typeDefs, resolvers }
