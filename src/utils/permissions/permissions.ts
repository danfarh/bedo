import { shield, allow } from 'graphql-shield'
import tripPermission from './schema/trip'
import shopPermission from './schema/shop'
import shopMenuPermission from './schema/shopMenu'
import driverPermissions from './schema/driver'
import attributeGroupPermission from './schema/attributeGroup'
import attributePermission from './schema/attribute'
import canceledTripReason from './schema/canceledTripReason'
import commentOnShop from './schema/commentOnShop'
import parcelVolume from './schema/parcelVolume'
import parcelWeight from './schema/parcelWeight'
import carColor from './schema/carColor'
import carBrand from './schema/carBrand'
import carModel from './schema/carModel'
import notification from './schema/notification'
import commentOnDriver from './schema/commentOnDriver'
import constantPermission from './schema/constant'
import tripOrderPermission from './schema/tripOrder'
import orderPermission from './schema/order'
import categoryPermission from './schema/category'
import passengerReadyComments from './schema/passengerReadyComments'
import shopReadyComments from './schema/shopReadyComments'
import driverReadyComments from './schema/driverReadyComments'
import permission from './schema/permission'
import product from './schema/product'
import adminPermission from './schema/admin'
import orderPromotionPermission from './schema/orderPromotion'
import commentOnPassenger from './schema/commentOnPassenger'
import tripPromotion from './schema/tripPromotion'
import conversation from './schema/conversation'
import message from './schema/message'
import reqCarType from './schema/reqCarType'
import advertisement from './schema/advertisement'
import car from './schema/car'
import carType from './schema/carType'
import comment from './schema/comment'
import driverCanceledTrip from './schema/driverCanceledTrip'
import driverHowItWorks from './schema/driverHowItWorks'
import shopHowItWorks from './schema/shopHowItWorks'
import favoritePlaces from './schema/favoritePlaces'
import favoriteProducts from './schema/favoriteProducts'
import help from './schema/help'
import legal from './schema/legal'
import payment from './schema/payment'
import readyMessage from './schema/readyMessage'
import region from './schema/region'
import role from './schema/role'
import shopFavoriteLocations from './schema/shopFavoriteLocations'
import shopReceipt from './schema/shopReceipt'
import tripPromotionUsed from './schema/tripPromotionUsed'
import upload from './schema/upload'
import user from './schema/user'
import cart from './schema/cart'
import passengerCanceledTrip from './schema/passengerCanceledTrip'
import transaction from './schema/transaction'
import auth from './schema/auth'
import userToken from './schema/userToken'

export default shield(
  {
    Query: {
      ...tripPermission.Query,
      ...shopPermission.Query,
      ...driverPermissions.Query,
      ...commentOnDriver.Query,
      ...attributeGroupPermission.Query,
      ...tripOrderPermission.Query,
      ...orderPermission.Query,
      ...notification.Query,
      ...shopReadyComments.Query,
      ...driverReadyComments.Query,
      ...passengerReadyComments.Query,
      ...commentOnPassenger.Query,
      ...parcelVolume.Query,
      ...parcelWeight.Query,
      ...commentOnShop.Query,
      ...canceledTripReason.Query,
      ...permission.Query,
      ...adminPermission.Query,
      ...orderPermission.Query,
      ...tripPromotion.Query,
      ...conversation.Query,
      ...message.Query,
      ...constantPermission.Query,
      ...reqCarType.Query,
      ...advertisement.Query,
      ...attributePermission.Query,
      ...car.Query,
      ...carBrand.Query,
      ...carColor.Query,
      ...carModel.Query,
      ...carType.Query,
      ...categoryPermission.Query,
      ...comment.Query,
      ...driverCanceledTrip.Query,
      // ...driverHowItWorks.Query,
      //  ...shopHowItWorks.Query,
      ...favoritePlaces.Query,
      ...favoriteProducts.Query,
      // ...help.Query,
      // ...legal.Query,
      ...payment.Query,
      ...product.Query,
      ...readyMessage.Query,
      ...region.Query,
      ...role.Query,
      ...shopFavoriteLocations.Query,
      ...shopMenuPermission.Query,
      ...shopReceipt.Query,
      ...user.Query,
      ...cart.Query,
      ...passengerCanceledTrip.Query,
      ...transaction.Query,
      ...orderPromotionPermission.Query,
      ...userToken.Query
    },
    Mutation: {
      ...tripPermission.Mutation,
      ...driverPermissions.Mutation,
      ...attributeGroupPermission.Mutation,
      ...attributePermission.Mutation,
      ...canceledTripReason.Mutation,
      ...commentOnShop.Mutation,
      ...parcelVolume.Mutation,
      ...parcelWeight.Mutation,
      ...carColor.Mutation,
      ...carModel.Mutation,
      ...carBrand.Mutation,
      ...region.Mutation,
      ...commentOnPassenger.Mutation,
      ...notification.Mutation,
      ...shopMenuPermission.Mutation,
      ...constantPermission.Mutation,
      ...categoryPermission.Mutation,
      ...passengerReadyComments.Mutation,
      ...shopReadyComments.Mutation,
      ...driverReadyComments.Mutation,
      ...product.Mutation,
      ...adminPermission.Mutation,
      ...orderPromotionPermission.Mutation,
      ...commentOnDriver.Mutation,
      ...driverReadyComments.Mutation,
      ...orderPermission.Mutation,
      ...conversation.Mutation,
      ...message.Mutation,
      ...reqCarType.Mutation,
      ...shopPermission.Mutation,
      ...advertisement.Mutation,
      ...car.Mutation,
      ...comment.Mutation,
      ...driverHowItWorks.Mutation,
      ...shopHowItWorks.Mutation,
      ...favoritePlaces.Mutation,
      ...help.Mutation,
      ...legal.Mutation,
      ...payment.Mutation,
      ...permission.Mutation,
      ...readyMessage.Mutation,
      ...role.Mutation,
      ...shopFavoriteLocations.Mutation,
      ...tripOrderPermission.Mutation,
      ...tripPromotion.Mutation,
      ...tripPromotionUsed.Mutation,
      ...upload.Mutation,
      ...user.Mutation,
      ...cart.Mutation,
      ...transaction.Mutation,
      ...auth.Mutation,
      ...userToken.Mutation
    }
  },
  {
    fallbackRule: allow,
    allowExternalErrors: true
  }
)
