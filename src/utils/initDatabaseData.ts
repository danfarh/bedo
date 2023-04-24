/* eslint-disable no-plusplus */
/* eslint-disable guard-for-in */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import faker from 'faker'
import { green } from 'chalk'
import Car from '../schema/car/schema'
import CarType from '../schema/carType/schema'
import User from '../schema/user/schema'
import Driver from '../schema/driver/schema'
import FavoritePlaces from '../schema/favoritePlaces/schema'
import TripPromotion from '../schema/tripPromotion/schema'
import Product from '../schema/product/schema'
import Category from '../schema/category/schema'
import Shop from '../schema/shop/schema'
import ShopMenu from '../schema/shopMenu/schema'
import Admin from '../schema/admin/schema'
import Trip from '../schema/trip/schema'
import CanceledTripReason from '../schema/canceledTripReason/schema'
import Attribute from '../schema/attribute/schema'
import AttributeGroup from '../schema/attributeGroup/schema'
import Constant from '../schema/constant/schema'
import Notification from '../schema/notification/schema'
import Help from '../schema/help/schema'
import Legal from '../schema/legal/schema'
import Advertisement from '../schema/advertisement/schema'
import carModel from '../schema/carModel/schema'
import carColor from '../schema/carColor/schema'
import carBrand from '../schema/carBrand/schema'
import TripOrder from '../schema/tripOrder/schema'
import ShopReceipt from '../schema/shopReceipt/schema'
import ShopReadyComment from '../schema/shopReadyComments/schema'
import DriverReadyComment from '../schema/driverReadyComments/schema'
import PassengerReadyComment from '../schema/passengerReadyComments/schema'
import ReadyMessage from '../schema/readyMessage/schema'
import DriverHowItWorks from '../schema/driverHowItWorks/schema'
import ShopHowItWorks from '../schema/shopHowItWorks/schema'
import carTypeSeeder from '../schema/carType/seeder'
import TripPromotionUsed from '../schema/tripPromotionUsed/schema'
import ParcelWeight from '../schema/parcelWeight/schema'
import ParcelVolume from '../schema/parcelVolume/schema'
import categorySeeder from '../schema/category/seeder'
import CancelReservationConstant from '../schema/cancelReservationConstant/schema'
import attributeSeeder from '../schema/attribute/seeder'
import attributeGroupSeeder from '../schema/attributeGroup/seeder'
import reqCarTypeSeeder from '../schema/reqCarType/seeder'
import ReqCarType from '../schema/reqCarType/schema'
import helpSeeder from '../schema/help/seeder'
import legalSeeder from '../schema/legal/seeder'
import carModelSeeder from '../schema/carModel/seeder'
import carColorSeeder from '../schema/carColor/seeder'
import { LANGUAGES_OF_APP } from '../config'
import parcelWeightSeeder from '../schema/parcelWeight/seeder'
import parcelVolumeSeeder from '../schema/parcelVolume/seeder'
import driverHowItWorksSeeder from '../schema/driverHowItWorks/seeder'
import shopHowItWorksSeeder from '../schema/shopHowItWorks/seeder'

import errorSchema from '../schema/errors/schema'
import errorsKeys from '../schema/errors/errors'

export default async () => {
  // reset db
  await CarType.deleteMany({})
  await PassengerReadyComment.deleteMany({})
  await DriverReadyComment.deleteMany({})
  await Help.deleteMany({})
  await Legal.deleteMany({})
  await ReadyMessage.deleteMany({})
  await Advertisement.deleteMany({})
  await carModel.deleteMany({})
  await carBrand.deleteMany({})
  await carColor.deleteMany({})
  await ReqCarType.deleteMany({})
  await Constant.deleteMany({})
  await CancelReservationConstant.deleteMany({})
  await ParcelWeight.deleteMany({})
  await ParcelVolume.deleteMany({})
  await DriverHowItWorks.deleteMany({})
  await ShopHowItWorks.deleteMany({})
  await ShopReadyComment.deleteMany({})
  await CanceledTripReason.deleteMany({})
  // await Car.deleteMany({})
  // await User.deleteMany({})
  // await FavoritePlaces.deleteMany({})
  // await TripPromotion.deleteMany({})
  // await Driver.deleteMany({})
  await Category.deleteMany({})
  await errorSchema.deleteMany({})
  // await Product.deleteMany({})
  // await Admin.deleteMany({})
  // await Trip.deleteMany({})
  // await Attribute.deleteMany({})
  // await AttributeGroup.deleteMany({})
  // await Shop.deleteMany({})
  // await ShopMenu.deleteMany({})
  // await TripPromotionUsed.deleteMany({})
  // await TripOrder.deleteMany({})
  // await Notification.deleteMany({})
  // await ShopReceipt.deleteMany({})
  // await ShopReadyComment.deleteMany({})

  let ids

  // seed parcel weights
  console.log('parcel weight seeder')
  const parcelWeights = ['1 - 10', '10 - 20', '20 - 50', '50 - 100', '100 - 150']
  ids = [
    '5edf83b8bf5bc31cbcaf7491',
    '5edf8423bf5bc31cbcaf7492',
    '5edf842fbf5bc31cbcaf7493',
    '5edf8435bf5bc31cbcaf7494',
    '5edf8444bf5bc31cbcaf7495'
  ]
  await Promise.all(
    parcelWeights.map(async (i, k) => {
      await parcelWeightSeeder({ _id: ids[k], name: i, order: k + 1 })
    })
  )

  // seed parcel weights
  console.log('parcel weight seeder')
  const parcelVolumes = ['0.1 - 0.5', '0.5 - 1', '1 - 2', '2 - 5', '5 - 10', '10 - 15']
  ids = [
    '5edf85aa4d3d9f334871a2c7',
    '5edf85ab4d3d9f334871a2c8',
    '5edf85ac4d3d9f334871a2c9',
    '5edf85b74d3d9f334871a2ca',
    '5edf85b84d3d9f334871a2cb',
    '5edf85c84d3d9f334871a2cc'
  ]
  await Promise.all(
    parcelVolumes.map(async (i, k) => {
      const res = await parcelVolumeSeeder({ _id: ids[k], name: i, order: k + 1 })
      return res
    })
  )

  // seed car types
  console.log('seeding car types')
  const availableCarTypes = {
    COMPACT: {
      _id: '5edf8606675e011dc019395f',
      maximumPassengersCount: 3,
      maximumWeight: 3,
      description: [
        { lang: 'en', value: 'up to 3 passengers and 3 bags' },
        { lang: 'az', value: '3 sərnişin və 3 çanta' },
        { lang: 'ru', value: 'до 3 пассажиров и 3 сумки' }
      ],
      logoUrl: '/images/icons/compact.svg'
    },
    INTERMEDIATE: {
      _id: '5edf8607675e011dc0193960',
      maximumPassengersCount: 4,
      maximumWeight: 4,
      description: [
        { lang: 'en', value: 'up to 4 passengers and 4 bags' },
        { lang: 'az', value: '4 sərnişin və 4 çanta ' },
        { lang: 'ru', value: 'до 4 пассажиров и 4 сумки ' }
      ],
      logoUrl: '/images/icons/intermediate.svg'
    },
    FULL_SIZE: {
      _id: '5edf8608675e011dc0193961',
      maximumPassengersCount: 6,
      maximumWeight: 3,
      description: [
        { lang: 'en', value: 'up to 6 passengers and 3 bags' },
        { lang: 'az', value: '6 sərnişin və 3 çanta ' },
        { lang: 'ru', value: 'до 6 пассажиров и 3 сумки ' }
      ],
      logoUrl: '/images/icons/full-size.svg'
    },
    PREMIUM: {
      _id: '5edf8608675e011dc0193962',
      maximumPassengersCount: 7,
      maximumWeight: 7,
      description: [
        { lang: 'en', value: 'up to 7 passengers and 7 bags' },
        { lang: 'az', value: '7 sərnişin və 7 çanta ' },
        { lang: 'ru', value: 'до 7 пассажиров и 7 сумки ' }
      ],
      logoUrl: '/images/icons/premium.svg'
    },
    BIKE: {
      _id: '5edf8609675e011dc0193963',
      maximumPassengersCount: null,
      maximumWeight: null,
      description: [
        { lang: 'en', value: 'for small parcels' },
        { lang: 'az', value: 'kiçik bağlamalar üçün ' },
        { lang: 'ru', value: 'для небольших посылок' }
      ],
      logoUrl: '/images/icons/bike.svg'
    },
    MOTORCYCLE: {
      _id: '5edf8609675e011dc0193964',
      maximumPassengersCount: null,
      maximumWeight: null,
      description: [
        { lang: 'en', value: 'for small parcels' },
        { lang: 'az', value: 'kiçik bağlamalar üçün ' },
        { lang: 'ru', value: 'для небольших посылок' }
      ],
      logoUrl: '/images/icons/motorcycle.svg'
    },
    TRUCK: {
      _id: '5edf860a675e011dc0193965',
      maximumPassengersCount: null,
      maximumWeight: null,
      description: [
        { lang: 'en', value: 'for large parcels' },
        { lang: 'az', value: 'böyük bağlamalar üçün' },
        { lang: 'ru', value: 'для больших посылок' }
      ],
      logoUrl: '/images/icons/truck.svg'
    },
    TRAILER: {
      _id: '5edf860b675e011dc0193966',
      maximumPassengersCount: null,
      maximumWeight: null,
      description: [
        { lang: 'en', value: 'for large parcels' },
        { lang: 'az', value: 'böyük bağlamalar üçün' },
        { lang: 'ru', value: 'для больших посылок' }
      ],
      logoUrl: '/images/icons/big-truck.svg'
    }
  }

  let carTypes: any[] = []
  for (const carTypeName in availableCarTypes) {
    carTypes = carTypes.concat(
      await carTypeSeeder({
        type: carTypeName.toLowerCase(),
        alias: carTypeName,
        ...availableCarTypes[carTypeName]
      })
    )
  }

  const availableReqCarTypes = {
    COMPACT: {
      _id: '5edf88ddcaaf4c1e8465ef4a',
      tripType: 'RIDE',
      carTypes: carTypes[0]._id,
      logoUrl: ['/images/icons/compact.svg'],
      increasePricePercent: 5,
      DistanceBasePricePerKM: 0.6,
      PerMinute: 0.15,
      BookingFee: 1.5,
      BaseFare: 5,
      maximumPassengersCount: 3,
      maximumWeight: 3,
      description: null
    },
    INTERMEDIATE: {
      _id: '5edf88decaaf4c1e8465ef4b',
      tripType: 'RIDE',
      carTypes: carTypes[1]._id,
      logoUrl: ['/images/icons/intermediate.svg'],
      increasePricePercent: 5,
      DistanceBasePricePerKM: 0.7,
      PerMinute: 0.16,
      BookingFee: 1.5,
      BaseFare: 5.25,
      maximumPassengersCount: 4,
      maximumWeight: 4,
      description: null
    },
    FULL_SIZE: {
      _id: '5edf88decaaf4c1e8465ef4c',
      tripType: 'RIDE',
      carTypes: carTypes[2]._id,
      logoUrl: ['/images/icons/full-size.svg'],
      increasePricePercent: 5,
      DistanceBasePricePerKM: 0.8,
      PerMinute: 0.18,
      BookingFee: 1.5,
      BaseFare: 5.5,
      maximumPassengersCount: 6,
      maximumWeight: 3,
      description: null
    },
    PREMIUM: {
      _id: '5edf88dfcaaf4c1e8465ef4d',
      tripType: 'RIDE',
      carTypes: carTypes[3]._id,
      logoUrl: ['/images/icons/premium.svg'],
      increasePricePercent: 5,
      DistanceBasePricePerKM: 1.2,
      PerMinute: 0.25,
      BookingFee: 1.5,
      BaseFare: 7,
      maximumPassengersCount: 2,
      maximumWeight: 2,
      description: null
    },
    BIKE_MOTORCYCLE: {
      _id: '5edf88dfcaaf4c1e8465ef4e',
      tripType: 'DELIVERY',
      carTypes: [carTypes[4]._id, carTypes[5]._id],
      logoUrl: ['/images/icons/motorcycle.svg', '/images/icons/bicycle.svg'],
      increasePricePercent: 3,
      DistanceBasePricePerKM: 0.3,
      PerMinute: 0.13,
      BookingFee: 1,
      BaseFare: 3,
      maximumPassengersCount: 0,
      maximumWeight: 3,
      description: 'small parcels'
    },
    TRUCK_TRAILER: {
      _id: '5edf88e0caaf4c1e8465ef4f',
      tripType: 'DELIVERY',
      carTypes: [carTypes[6]._id, carTypes[7]._id],
      logoUrl: ['/images/icons/truck.svg', '/images/icons/big-truck.svg'],
      increasePricePercent: 5,
      DistanceBasePricePerKM: 0.6,
      PerMinute: 0.16,
      BookingFee: 1,
      BaseFare: 6,
      maximumPassengersCount: 2,
      maximumWeight: 15,
      description: 'large parcels'
    },
    CARS: {
      _id: '5edf88e0caaf4c1e8465ef50',
      tripType: 'DELIVERY',
      carTypes: [carTypes[0]._id, carTypes[1]._id, carTypes[2]._id, carTypes[3]._id],
      logoUrl: ['/images/icons/compact-delivery.svg', '/images/icons/intermediate-delivery.svg'],
      increasePricePercent: 4,
      DistanceBasePricePerKM: 0.4,
      PerMinute: 0.15,
      BookingFee: 1,
      BaseFare: 5,
      maximumPassengersCount: 2,
      maximumWeight: 2,
      description: 'medium parcels'
    }
  }

  let reqCarTypes: any[] = []
  for (const reqCarType in availableReqCarTypes) {
    reqCarTypes = reqCarTypes.concat(
      await reqCarTypeSeeder({
        name: reqCarType,
        ...availableReqCarTypes[reqCarType]
      })
    )
  }
  console.log('seeding helps')
  const availableHelps = {
    I_WANT_TO_REPORT_A_SERVICE_ANIMAL_ISSUE: {
      _id: '5edf896b275fe12d343bff52',
      title: [
        { lang: 'en', value: 'i want to report a service animal issue' },
        { lang: 'az', value: 'bir xidmət heyvanı problemini bildirmək istəyirəm ' },
        { lang: 'ru', value: 'я хочу сообщить о проблеме с животным-поводырем ' }
      ],
      type: 'TAXI'
    },
    I_LOST_AN_ITEM: {
      _id: '5edf896c275fe12d343bff53',
      title: [
        { lang: 'en', value: 'i lost an item' },
        { lang: 'az', value: 'bir xidmət heyvanı problemini bildirmək istəyirəm ' },
        { lang: 'ru', value: 'я хочу сообщить о проблеме с животным-поводырем ' }
      ],
      type: 'TAXI'
    },
    I_WAS_INVOLVED_IN_AN_ACCIDENT: {
      _id: '5edf896c275fe12d343bff54',
      title: [
        { lang: 'en', value: 'i was involved in an accident' },
        { lang: 'az', value: 'bir xidmət heyvanı problemini bildirmək istəyirəm ' },
        { lang: 'ru', value: 'я хочу сообщить о проблеме с животным-поводырем ' }
      ],
      type: 'TAXI'
    },
    LEARN_ABOUT_BEDO: {
      _id: '5edf896c275fe12d343bff55',
      title: [
        { lang: 'en', value: 'learn about Spark' },
        { lang: 'az', value: 'bir xidmət heyvanı problemini bildirmək istəyirəm ' },
        { lang: 'ru', value: 'я хочу сообщить о проблеме с животным-поводырем ' }
      ],
      type: 'TAXI'
    },
    ACCOUNT_AND_PAYMENT: {
      _id: '5edf896c275fe12d343bff56',
      title: [
        { lang: 'en', value: 'account & payment' },
        { lang: 'az', value: 'bir xidmət heyvanı problemini bildirmək istəyirəm ' },
        { lang: 'ru', value: 'я хочу сообщить о проблеме с животным-поводырем ' }
      ],
      type: 'TAXI'
    },
    RIDE_GUIDE: {
      _id: '5edf896d275fe12d343bff57',
      title: [
        { lang: 'en', value: 'ride guide' },
        { lang: 'az', value: 'bir xidmət heyvanı problemini bildirmək istəyirəm ' },
        { lang: 'ru', value: 'я хочу сообщить о проблеме с животным-поводырем ' }
      ],
      type: 'TAXI'
    },
    FOOD_GUIDE: {
      _id: '5edf896d275fe12d343bff58',
      title: [
        { lang: 'en', value: 'food guide' },
        { lang: 'az', value: 'bir xidmət heyvanı problemini bildirmək istəyirəm ' },
        { lang: 'ru', value: 'я хочу сообщить о проблеме с животным-поводырем ' }
      ],
      type: 'TAXI'
    },
    GROCERY_SHOPPING_GUIDE: {
      _id: '5edf896d275fe12d343bff59',
      title: [
        { lang: 'en', value: 'grocery shopping guide' },
        { lang: 'az', value: 'bir xidmət heyvanı problemini bildirmək istəyirəm ' },
        { lang: 'ru', value: 'я хочу сообщить о проблеме с животным-поводырем ' }
      ],
      type: 'TAXI'
    },
    DELIVERY_GUIDE: {
      _id: '5edf896d275fe12d343bff5a',
      title: [
        { lang: 'en', value: 'delivery guide' },
        { lang: 'az', value: 'bir xidmət heyvanı problemini bildirmək istəyirəm ' },
        { lang: 'ru', value: 'я хочу сообщить о проблеме с животным-поводырем ' }
      ],
      type: 'TAXI'
    },
    MY_PARCEL_WAS_NOT_DELIVERED: {
      _id: '5edf896e275fe12d343bff5b',
      title: [
        { lang: 'en', value: 'My parcel  was not delivered' },
        { lang: 'az', value: 'bir xidmət heyvanı problemini bildirmək istəyirəm ' },
        { lang: 'ru', value: 'я хочу сообщить о проблеме с животным-поводырем ' }
      ],
      type: 'DELIVERY'
    },
    MY_PARCEL_IS_MISSING_AN_ITEM: {
      _id: '5edf896e275fe12d343bff5c',
      title: [
        { lang: 'en', value: 'my parcel is missing an item' },
        { lang: 'az', value: 'bir xidmət heyvanı problemini bildirmək istəyirəm ' },
        { lang: 'ru', value: 'я хочу сообщить о проблеме с животным-поводырем ' }
      ],
      type: 'DELIVERY'
    },
    MY_DELIVERY_HAS_BEEN_DELAYED: {
      _id: '5edf896e275fe12d343bff5d',
      title: [
        { lang: 'en', value: 'My delivery has been delayed' },
        { lang: 'az', value: 'bir xidmət heyvanı problemini bildirmək istəyirəm ' },
        { lang: 'ru', value: 'я хочу сообщить о проблеме с животным-поводырем ' }
      ],
      type: 'DELIVERY'
    },
    DELIVERY_COSTED_MORE_THAN_ESTIMATED: {
      _id: '5edf896e275fe12d343bff5e',
      title: [
        { lang: 'en', value: 'delivery costed more than estimated' },
        { lang: 'az', value: 'bir xidmət heyvanı problemini bildirmək istəyirəm ' },
        { lang: 'ru', value: 'я хочу сообщить о проблеме с животным-поводырем ' }
      ],
      type: 'DELIVERY'
    },
    MY_PACKAGE_WAS_OPENED: {
      _id: '5edf896e275fe12d343bff5f',
      title: [
        { lang: 'en', value: 'my package was opened' },
        { lang: 'az', value: 'bir xidmət heyvanı problemini bildirmək istəyirəm ' },
        { lang: 'ru', value: 'я хочу сообщить о проблеме с животным-поводырем ' }
      ],
      type: 'DELIVERY'
    },
    OTHER_ISSUES: {
      _id: '5edf896f275fe12d343bff60',
      title: [
        { lang: 'en', value: 'other issues' },
        { lang: 'az', value: 'bir xidmət heyvanı problemini bildirmək istəyirəm ' },
        { lang: 'ru', value: 'я хочу сообщить о проблеме с животным-поводырем ' }
      ],
      type: 'DELIVERY'
    },
    I_LOST_AN_ITEM_DELIVERY: {
      _id: '5edf896f275fe12d343bff61',
      title: [
        { lang: 'en', value: 'i lost an item' },
        { lang: 'az', value: 'bir xidmət heyvanı problemini bildirmək istəyirəm ' },
        { lang: 'ru', value: 'я хочу сообщить о проблеме с животным-поводырем ' }
      ],
      type: 'DELIVERY'
    },
    FOOD_OTHER_ISSUES: {
      _id: '5edf896f275fe12d343bff62',
      title: [
        { lang: 'en', value: 'Other issues' },
        { lang: 'az', value: 'bir xidmət heyvanı problemini bildirmək istəyirəm ' },
        { lang: 'ru', value: 'я хочу сообщить о проблеме с животным-поводырем ' }
      ],
      type: 'FOOD'
    },
    FOOD_MY_ORDER_COSTED_MORE_THAN_ESTIMATED: {
      _id: '5edf896f275fe12d343bff63',
      title: [
        { lang: 'en', value: 'My order costed more than estimated' },
        { lang: 'az', value: 'bir xidmət heyvanı problemini bildirmək istəyirəm ' },
        { lang: 'ru', value: 'я хочу сообщить о проблеме с животным-поводырем ' }
      ],
      type: 'FOOD'
    },
    FOOD_MY_ORDER_HAS_BEEN_DELAYED: {
      _id: '5edf8970275fe12d343bff64',
      title: [
        { lang: 'en', value: 'My order has been delayed' },
        { lang: 'az', value: 'bir xidmət heyvanı problemini bildirmək istəyirəm ' },
        { lang: 'ru', value: 'я хочу сообщить о проблеме с животным-поводырем ' }
      ],
      type: 'FOOD'
    },
    FOOD_MY_ORDER_WAS_DIFFERENT: {
      _id: '5edf8970275fe12d343bff65',
      title: [
        { lang: 'en', value: 'My order was different' },
        { lang: 'az', value: 'bir xidmət heyvanı problemini bildirmək istəyirəm ' },
        { lang: 'ru', value: 'я хочу сообщить о проблеме с животным-поводырем ' }
      ],
      type: 'FOOD'
    },
    GROCERY_OTHER_ISSUES: {
      _id: '5edf8970275fe12d343bff66',
      title: [
        { lang: 'en', value: 'Other issues' },
        { lang: 'az', value: 'bir xidmət heyvanı problemini bildirmək istəyirəm ' },
        { lang: 'ru', value: 'я хочу сообщить о проблеме с животным-поводырем ' }
      ],
      type: 'GROCERY'
    },
    GROCERY_MY_DELIVERY_COSTED_MORE_THAN_ESTIMATED: {
      _id: '5edf8970275fe12d343bff67',
      title: [
        { lang: 'en', value: 'My order costed more than estimated' },
        { lang: 'az', value: 'bir xidmət heyvanı problemini bildirmək istəyirəm ' },
        { lang: 'ru', value: 'я хочу сообщить о проблеме с животным-поводырем ' }
      ],
      type: 'GROCERY'
    },
    GROCERY_MY_ORDER_HAS_BEEN_DELAYED: {
      _id: '5edf89c0275fe12d343bff6a',
      title: [
        { lang: 'en', value: 'My order has been delayed' },
        { lang: 'az', value: 'bir xidmət heyvanı problemini bildirmək istəyirəm ' },
        { lang: 'ru', value: 'я хочу сообщить о проблеме с животным-поводырем ' }
      ],
      type: 'GROCERY'
    },
    GROCERY_MY_ORDER_WAS_DIFFERENT: {
      _id: '5edf89c0275fe12d343bff6b',
      title: [
        { lang: 'en', value: 'My order was different' },
        { lang: 'az', value: 'bir xidmət heyvanı problemini bildirmək istəyirəm ' },
        { lang: 'ru', value: 'я хочу сообщить о проблеме с животным-поводырем ' }
      ],
      type: 'GROCERY'
    },
    DRIVER_RIDE_HELP: {
      _id: '5edf89c1275fe12d343bff6c',
      title: [
        { lang: 'en', value: null },
        { lang: 'az', value: 'bir xidmət heyvanı problemini bildirmək istəyirəm ' },
        { lang: 'ru', value: 'я хочу сообщить о проблеме с животным-поводырем ' }
      ],
      description: [
        {
          lang: 'en',
          value: 'If you had any issue in this ride you can contact us or the passenger'
        },
        { lang: 'az', value: 'bir xidmət heyvanı problemini bildirmək istəyirəm ' },
        { lang: 'ru', value: 'я хочу сообщить о проблеме с животным-поводырем ' }
      ],
      type: 'DRIVER_RIDE'
    },
    DRIVER_DELIVERY_HELP: {
      _id: '5edf89c1275fe12d343bff6d',
      title: [
        { lang: 'en', value: null },
        { lang: 'az', value: 'bir xidmət heyvanı problemini bildirmək istəyirəm ' },
        { lang: 'ru', value: 'я хочу сообщить о проблеме с животным-поводырем ' }
      ],
      description: [
        {
          lang: 'en',
          value:
            'If you had any issue in this delivery you can contact us, the sender or the passenger'
        },
        { lang: 'az', value: 'bir xidmət heyvanı problemini bildirmək istəyirəm ' },
        { lang: 'ru', value: 'я хочу сообщить о проблеме с животным-поводырем ' }
      ],
      type: 'DRIVER_DELIVERY'
    }
  }

  let helps: any[] = []
  for (const help in availableHelps) {
    helps = helps.concat(
      await helpSeeder({
        name: help,
        ...availableHelps[help]
      })
    )
  }

  console.log('seeding legals')

  const availableLegals = {
    COPY_RIGHT: {
      _id: '5edf8a094646dc29fc7e0e3d',
      title: [
        { lang: LANGUAGES_OF_APP[0], value: 'copy right' },
        { lang: LANGUAGES_OF_APP[1], value: 'Авторские права' },
        { lang: LANGUAGES_OF_APP[2], value: 'müəllif hüquqları' }
      ]
    },
    TERMS_AND_CONDITIONS: {
      _id: '5edf8a0a4646dc29fc7e0e3e',
      title: [
        { lang: LANGUAGES_OF_APP[0], value: 'terms & conditions' },
        { lang: LANGUAGES_OF_APP[1], value: 'условия и положения' },
        { lang: LANGUAGES_OF_APP[2], value: 'Şərtlər və qaydalar' }
      ]
    },
    PRIVACY_POLICY: {
      _id: '5edf8a0a4646dc29fc7e0e3f',
      title: [
        { lang: LANGUAGES_OF_APP[0], value: 'privacy policy' },
        { lang: LANGUAGES_OF_APP[1], value: 'политика конфиденциальности' },
        { lang: LANGUAGES_OF_APP[2], value: 'Gizlilik Siyasəti' }
      ]
    },
    DATA_PROVIDERS: {
      _id: '5edf8a0b4646dc29fc7e0e40',
      title: [
        { lang: LANGUAGES_OF_APP[0], value: 'data providers' },
        { lang: LANGUAGES_OF_APP[1], value: 'поставщики данных' },
        { lang: LANGUAGES_OF_APP[2], value: 'məlumat təminatçıları' }
      ]
    },
    SOFTWARE_LICENCE: {
      _id: '5edf8a0b4646dc29fc7e0e41',
      title: [
        { lang: LANGUAGES_OF_APP[0], value: 'software license' },
        { lang: LANGUAGES_OF_APP[1], value: 'лицензия на программное обеспечение' },
        { lang: LANGUAGES_OF_APP[2], value: 'proqram lisenziyası' }
      ]
    },
    LOCATION_INFORMATION: {
      _id: '5edf8a0b4646dc29fc7e0e42',
      title: [
        { lang: LANGUAGES_OF_APP[0], value: 'location information' },
        { lang: LANGUAGES_OF_APP[1], value: 'Информация о местонахождении' },
        { lang: LANGUAGES_OF_APP[2], value: 'yer haqqında məlumat' }
      ]
    }
  }

  let legals: any[] = []
  for (const legal in availableLegals) {
    legals = legals.concat(
      await legalSeeder({
        name: legal,
        ...availableLegals[legal]
      })
    )
  }

  console.log('seeding ShopHowItWorks')
  const availableShopHowItWorks = {
    ACCEPT_AN_ORDER: {
      _id: '5edf8a0c4646dc29fc7e0e43',
      title: [
        { lang: 'en', value: 'accept an order' },
        { lang: 'az', value: 'səyahət qəbul edin' },
        { lang: 'ru', value: 'принять поездку' }
      ]
    },
    REPORT_A_PROBLEM: {
      _id: '5edf8a0c4646dc29fc7e0e44',
      title: [
        { lang: 'en', value: 'report a problem' },
        { lang: 'az', value: 'Problemi bildirmək' },
        { lang: 'ru', value: 'сообщить о проблеме' }
      ]
    },
    PRIVACY_POLICY: {
      _id: '5edf8a404646dc29fc7e0e46',
      title: [
        { lang: 'en', value: 'privacy policy' },
        { lang: 'az', value: 'Gizlilik Siyasəti' },
        { lang: 'ru', value: 'политика конфиденциальности' }
      ]
    },
    CUSTOMER_SERVICE: {
      _id: '5edf8a414646dc29fc7e0e47',
      title: [
        { lang: 'en', value: 'customer service' },
        { lang: 'az', value: 'müştəri xidməti' },
        { lang: 'ru', value: 'обслуживание клиентов' }
      ]
    },
    SOFTWARE_LICENCE: {
      _id: '5edf8a424646dc29fc7e0e48',
      title: [
        { lang: 'en', value: 'software licence' },
        { lang: 'az', value: 'proqram lisenziyası' },
        { lang: 'ru', value: 'лицензия на программное обеспечение' }
      ]
    },
    PAYMENT_ISSUES: {
      _id: '5edf8a424646dc29fc7e0e49',
      title: [
        { lang: 'en', value: 'payment issues' },
        { lang: 'az', value: 'ödəmə məsələləri' },
        { lang: 'ru', value: 'вопросы оплаты' }
      ]
    }
  }

  let shopHowItWorks: any[] = []
  for (const singleShopHowItWorks in availableShopHowItWorks) {
    shopHowItWorks = shopHowItWorks.concat(
      await shopHowItWorksSeeder({
        name: singleShopHowItWorks,
        ...availableShopHowItWorks[singleShopHowItWorks]
      })
    )
  }

  console.log('seeding driverHowItWorks')

  const availableDriverHowItWorks = {
    ACCEPT_A_TRIP: {
      _id: '5edf8a0c4646dc29fc7e0e43',
      title: [
        { lang: 'en', value: 'accept a trip' },
        { lang: 'az', value: 'səyahət qəbul edin' },
        { lang: 'ru', value: 'принять поездку' }
      ]
    },
    REPORT_A_PROBLEM: {
      _id: '5edf8a0c4646dc29fc7e0e44',
      title: [
        { lang: 'en', value: 'report a problem' },
        { lang: 'az', value: 'Problemi bildirmək' },
        { lang: 'ru', value: 'сообщить о проблеме' }
      ]
    },
    PRIVACY_POLICY: {
      _id: '5edf8a404646dc29fc7e0e46',
      title: [
        { lang: 'en', value: 'privacy policy' },
        { lang: 'az', value: 'Gizlilik Siyasəti' },
        { lang: 'ru', value: 'политика конфиденциальности' }
      ]
    },
    CUSTOMER_SERVICE: {
      _id: '5edf8a414646dc29fc7e0e47',
      title: [
        { lang: 'en', value: 'customer service' },
        { lang: 'az', value: 'müştəri xidməti' },
        { lang: 'ru', value: 'обслуживание клиентов' }
      ]
    },
    SOFTWARE_LICENCE: {
      _id: '5edf8a424646dc29fc7e0e48',
      title: [
        { lang: 'en', value: 'software licence' },
        { lang: 'az', value: 'proqram lisenziyası' },
        { lang: 'ru', value: 'лицензия на программное обеспечение' }
      ]
    },
    PAYMENT_ISSUES: {
      _id: '5edf8a424646dc29fc7e0e49',
      title: [
        { lang: 'en', value: 'payment issues' },
        { lang: 'az', value: 'ödəmə məsələləri' },
        { lang: 'ru', value: 'вопросы оплаты' }
      ]
    }
  }

  let driverHowItWorks: any[] = []
  for (const singleDriverHowItWorks in availableDriverHowItWorks) {
    driverHowItWorks = driverHowItWorks.concat(
      await driverHowItWorksSeeder({
        name: singleDriverHowItWorks,
        ...availableDriverHowItWorks[singleDriverHowItWorks]
      })
    )
  }

  console.log('seeding car colors')

  const availableCarColors = [
    {
      _id: '5edf8a7c4646dc29fc7e0e4d',
      code: '#ff0000',
      name: [
        { lang: 'en', value: 'red' },
        { lang: 'az', value: 'qırmızı' },
        { lang: 'ru', value: 'красный' }
      ]
    },
    {
      _id: '5edf8a7d4646dc29fc7e0e4e',
      code: '#000000',
      name: [
        { lang: 'en', value: 'black' },
        { lang: 'az', value: 'qara' },
        { lang: 'ru', value: 'чернить' }
      ]
    },
    {
      _id: '5edf8a7d4646dc29fc7e0e4f',
      code: '#fff700',
      name: [
        { lang: 'en', value: 'lemon' },
        { lang: 'az', value: 'limon' },
        { lang: 'ru', value: 'лимон' }
      ]
    },
    {
      _id: '5edf8a7d4646dc29fc7e0e50',
      code: '#964b00',
      name: [
        { lang: 'en', value: 'brown' },
        { lang: 'az', value: 'qəhvəyi' },
        { lang: 'ru', value: 'коричневый' }
      ]
    },
    {
      _id: '5edf8a7e4646dc29fc7e0e51',
      code: '#0000ff',
      name: [
        { lang: 'en', value: 'blue' },
        { lang: 'az', value: 'mavi' },
        { lang: 'ru', value: 'синий' }
      ]
    },
    {
      _id: '5edf8a7e4646dc29fc7e0e52',
      code: '#f5f5dc',
      name: [
        { lang: 'en', value: 'beige' },
        { lang: 'az', value: 'bej' },
        { lang: 'ru', value: 'бежевый' }
      ]
    },
    {
      _id: '5edf8a7f4646dc29fc7e0e53',
      code: '#ffff00',
      name: [
        { lang: 'en', value: 'yellow' },
        { lang: 'az', value: 'sarı' },
        { lang: 'ru', value: 'желтый' }
      ]
    },
    {
      _id: '5edf8a804646dc29fc7e0e54',
      code: '#ffffff',
      name: [
        { lang: 'en', value: 'white' },
        { lang: 'az', value: 'ağ' },
        { lang: 'ru', value: 'белый' }
      ]
    },
    {
      _id: '5edf8a804646dc29fc7e0e55',
      code: '#8c92ac',
      name: [
        { lang: 'en', value: 'grey' },
        { lang: 'az', value: 'Boz' },
        { lang: 'ru', value: 'серый' }
      ]
    },
    {
      _id: '5edf8a804646dc29fc7e0e56',
      code: '#ffc0cb',
      name: [
        { lang: 'en', value: 'pink' },
        { lang: 'az', value: 'çəhrayı' },
        { lang: 'ru', value: 'розовый' }
      ]
    },
    {
      _id: '5edf8a804646dc29fc7e0e57',
      code: '#800080',
      name: [
        { lang: 'en', value: 'purple' },
        { lang: 'az', value: 'bənövşəyi' },
        { lang: 'ru', value: 'фиолетовый' }
      ]
    },
    {
      _id: '5edf8a804646dc29fc7e0e58',
      code: '#ff7f00',
      name: [
        { lang: 'en', value: 'orange' },
        { lang: 'az', value: 'narıncı' },
        { lang: 'ru', value: 'апельсин' }
      ]
    }
  ]

  let colors: any[] = []
  for (const color in availableCarColors) {
    colors = colors.concat(
      await carColorSeeder({
        ...availableCarColors[color]
      })
    )
  }

  console.log('seeding car brands')

  const BMW = await carBrand.create({ _id: '5edf8acf4646dc29fc7e0e60', name: 'BMW' })
  const Audi = await carBrand.create({ _id: '5edf8ad04646dc29fc7e0e61', name: 'Audi' })

  console.log('seeding car models ')
  const availableCarModels = {
    'Audi A1': {
      _id: '5edf8aee4646dc29fc7e0e63',
      brand: Audi._id
    },
    'Audi A2': {
      _id: '5edf8af04646dc29fc7e0e64',
      brand: Audi._id
    },
    'Audi A3': {
      _id: '5edf8af04646dc29fc7e0e65',
      brand: Audi._id
    },
    'Audi E-tron': {
      _id: '5edf8af04646dc29fc7e0e66',
      brand: Audi._id
    },
    'Audi TT': {
      _id: '5edf8af04646dc29fc7e0e67',
      brand: Audi._id
    },
    'Audi A4': {
      _id: '5edf8af14646dc29fc7e0e68',
      brand: Audi._id
    },
    'Audi A5': {
      _id: '5edf8af14646dc29fc7e0e69',
      brand: Audi._id
    },
    'Audi A6': {
      _id: '5edf8af14646dc29fc7e0e6a',
      brand: Audi._id
    },
    'BMW 228 Gran Coupe': {
      _id: '5edf8af24646dc29fc7e0e6b',
      brand: BMW._id
    },
    'BMW 230': {
      _id: '5edf8af24646dc29fc7e0e6c',
      brand: BMW._id
    },
    'BMW 330': {
      _id: '5edf8af24646dc29fc7e0e6d',
      brand: BMW._id
    },
    'BMW 540': {
      _id: '5edf8af24646dc29fc7e0e6e',
      brand: BMW._id
    },
    'BMW 440': {
      _id: '5edf8af34646dc29fc7e0e6f',
      brand: BMW._id
    },
    'BMW 430': {
      _id: '5edf8af34646dc29fc7e0e70',
      brand: BMW._id
    },
    'BMW 430 Gran Coupe': {
      _id: '5edf8af34646dc29fc7e0e71',
      brand: BMW._id
    }
  }
  let carModels: any[] = []
  for (const model in availableCarModels) {
    carModels = carModels.concat(
      await carModelSeeder({
        name: model,
        ...availableCarModels[model]
      })
    )
  }

  console.log('seeding driver ready comments')
  const availableShopReadyComments = [
    { _id: '5edf965ff85d613500c4f627', type: 'food ?' },
    { _id: '5edf8c2c4646dc29fc7e0e79', type: 'delivery' }
  ]

  for (let i = 0; i < availableShopReadyComments.length; i += 1) {
    ShopReadyComment.create(availableShopReadyComments[i])
  }

  console.log('seeding driver ready comments')
  const availableDriverReadyComments = [
    {
      type: 'How was your ride?',
      _id: '5edf8be34646dc29fc7e0e73'
    }
  ]

  for (let i = 0; i < availableDriverReadyComments.length; i += 1) {
    DriverReadyComment.create(availableDriverReadyComments[i])
  }
  console.log('seeding passenger ready comments')
  const availablePassengerReadyComments = [
    {
      type: 'How was your ride?',
      _id: '5edf8cb64646dc29fc7e0e7b'
    }
  ]

  for (let i = 0; i < availablePassengerReadyComments.length; i += 1) {
    PassengerReadyComment.create(availablePassengerReadyComments[i])
  }
  console.log('seeding ready messages')
  const availableReadyMessage = [
    {
      message: [
        { lang: 'en', value: 'I am coming' },
        { lang: 'az', value: 'Mən gəlirəm' },
        { lang: 'ru', value: 'я иду' }
      ],
      order: 1,
      type: 'TAXI',
      _id: '5edf8ce94646dc29fc7e0e81'
    },
    {
      message: [
        { lang: 'en', value: 'I will be there in a minute' },
        { lang: 'az', value: 'Bir dəqiqə sonra orada olacam' },
        { lang: 'ru', value: 'Я буду там через минуту' }
      ],
      order: 2,
      type: 'TAXI',
      _id: '5edf8ce94646dc29fc7e0e82'
    },
    {
      message: [
        { lang: 'en', value: 'I will be there in five minutes' },
        { lang: 'az', value: 'Beş dəqiqədən sonra orada olacam' },
        { lang: 'ru', value: 'Я буду через пять минут' }
      ],
      order: 3,
      type: 'TAXI',
      _id: '5edf8ce94646dc29fc7e0e83'
    },
    {
      message: [
        { lang: 'en', value: 'I will be there in ten minutes' },
        { lang: 'az', value: 'On dəqiqə sonra orada olacam' },
        { lang: 'ru', value: 'Я буду через десять минут' }
      ],
      order: 4,
      type: 'TAXI',
      _id: '5edf8ce94646dc29fc7e0e84'
    },
    {
      message: [
        { lang: 'en', value: 'Please wait for me' },
        { lang: 'az', value: 'Zəhmət olmasa məni gözləyin' },
        { lang: 'ru', value: 'Пожалуйста, подожди меня' }
      ],
      order: 5,
      type: 'TAXI',
      _id: '5edf8ce94646dc29fc7e0e85'
    },
    {
      message: [
        { lang: 'en', value: 'I am coming' },
        { lang: 'az', value: 'Mən gəlirəm' },
        { lang: 'ru', value: 'я иду' }
      ],
      order: 6,
      type: 'DELIVERY',
      _id: '5edf8ce94646dc29fc7e0e86'
    },
    {
      message: [
        { lang: 'en', value: 'I will be there in a minute' },
        { lang: 'az', value: 'Bir dəqiqə sonra orada olacam' },
        { lang: 'ru', value: 'Я буду там через минуту' }
      ],
      order: 7,
      type: 'DELIVERY',
      _id: '5edf8ce94646dc29fc7e0e87'
    },
    {
      message: [
        { lang: 'en', value: 'I will be there in five minutes' },
        { lang: 'az', value: 'Beş dəqiqədən sonra orada olacam' },
        { lang: 'ru', value: 'Я буду через пять минут' }
      ],
      order: 8,
      type: 'DELIVERY',
      _id: '5edf8ce94646dc29fc7e0e88'
    },
    {
      message: [
        { lang: 'en', value: 'I will be there in ten minutes' },
        { lang: 'az', value: 'On dəqiqə sonra orada olacam' },
        { lang: 'ru', value: 'Я буду через десять минут' }
      ],
      order: 9,
      type: 'DELIVERY',
      _id: '5edf8ce94646dc29fc7e0e89'
    },
    {
      message: [
        { lang: 'en', value: 'Please wait for me' },
        { lang: 'az', value: 'Zəhmət olmasa məni gözləyin' },
        { lang: 'ru', value: 'Пожалуйста, подожди меня' }
      ],
      order: 10,
      type: 'DELIVERY',
      _id: '5edf8ce94646dc29fc7e0e8a'
    }
  ]
  for (let i = 0; i < availableReadyMessage.length; i += 1) {
    ReadyMessage.create(availableReadyMessage[i])
  }

  console.log('seed canceled trip reason')
  const canceledTripReason = [
    {
      by: 'DRIVER',
      when: 'DURING_TRIP',
      title: [
        { lang: 'en', value: 'i had an accident' },
        { lang: 'az', value: 'qəza etdim' },
        { lang: 'ru', value: 'Я попал в аварию' }
      ],
      type: 'DELIVERY',
      _id: '5edf8d454646dc29fc7e0e8b'
    },
    {
      by: 'DRIVER',
      when: 'DURING_TRIP',
      title: [
        { lang: 'en', value: 'i had an accident' },
        { lang: 'az', value: 'qəza etdim' },
        { lang: 'ru', value: 'Я попал в аварию' }
      ],
      type: 'RIDE',
      _id: '5edf8d454646dc29fc7e0e8c'
    },
    {
      by: 'DRIVER',
      when: 'DURING_TRIP',
      title: [
        { lang: 'en', value: 'reserved' },
        { lang: 'az', value: 'qəza etdim' },
        { lang: 'ru', value: 'Я попал в аварию' }
      ],
      type: 'RIDE',
      _id: '5edf8d454646dc29fc7e0e8d'
    },
    {
      by: 'DRIVER',
      when: 'DURING_TRIP',
      title: [
        { lang: 'en', value: 'reserved' },
        { lang: 'az', value: 'qəza etdim' },
        { lang: 'ru', value: 'Я попал в аварию' }
      ],
      type: 'DELIVERY',
      _id: '5edf8d454646dc29fc7e0e8e'
    },
    {
      by: 'DRIVER',
      when: 'BEFORE_PICK_UP',
      title: [
        { lang: 'en', value: 'passenger did not Come' },
        { lang: 'az', value: 'qəza etdim' },
        { lang: 'ru', value: 'Я попал в аварию' }
      ],
      type: 'RIDE',
      _id: '5edf8d454646dc29fc7e0e8f'
    },
    {
      by: 'DRIVER',
      when: 'DURING_TRIP',
      title: [
        { lang: 'en', value: 'my car has a Malfunction' },
        { lang: 'az', value: 'qəza etdim' },
        { lang: 'ru', value: 'Я попал в аварию' }
      ],
      type: 'DELIVERY',
      _id: '5edf8d454646dc29fc7e0e90'
    },
    {
      by: 'DRIVER',
      when: 'BEFORE_PICK_UP',
      title: [
        { lang: 'en', value: 'the Address is wrong' },
        { lang: 'az', value: 'qəza etdim' },
        { lang: 'ru', value: 'Я попал в аварию' }
      ],
      type: 'DELIVERY',
      _id: '5edf8d454646dc29fc7e0e91'
    },
    {
      by: 'DRIVER',
      when: 'BEFORE_PICK_UP',
      title: [
        { lang: 'en', value: 'the Address is wrong' },
        { lang: 'az', value: 'qəza etdim' },
        { lang: 'ru', value: 'Я попал в аварию' }
      ],
      type: 'RIDE',
      _id: '5edf8d454646dc29fc7e0e92'
    },
    {
      by: 'DRIVER',
      when: 'BEFORE_PICK_UP',
      title: [
        { lang: 'en', value: 'Passengers are too Many' },
        { lang: 'az', value: 'qəza etdim' },
        { lang: 'ru', value: 'Я попал в аварию' }
      ],
      type: 'RIDE',
      _id: '5edf8d454646dc29fc7e0e93'
    },
    {
      by: 'DRIVER',
      when: 'BEFORE_PICK_UP',
      title: [
        { lang: 'en', value: 'cant find passenger' },
        { lang: 'az', value: 'qəza etdim' },
        { lang: 'ru', value: 'Я попал в аварию' }
      ],
      type: 'RIDE',
      _id: '5edf8d454646dc29fc7e0e94'
    },
    {
      by: 'DRIVER',
      when: 'BEFORE_PICK_UP',
      title: [
        { lang: 'en', value: 'parcels are too heavy' },
        { lang: 'az', value: 'qəza etdim' },
        { lang: 'ru', value: 'Я попал в аварию' }
      ],
      type: 'DELIVERY',
      _id: '5edf8d454646dc29fc7e0e95'
    },
    {
      by: 'DRIVER',
      when: 'BEFORE_PICK_UP',
      title: [
        { lang: 'en', value: 'parcels are different' },
        { lang: 'az', value: 'qəza etdim' },
        { lang: 'ru', value: 'Я попал в аварию' }
      ],
      type: 'DELIVERY',
      _id: '5edf8d454646dc29fc7e0e96'
    },
    {
      by: 'DRIVER',
      when: 'BEFORE_PICK_UP',
      title: [
        { lang: 'en', value: 'Passenger is in unNormal State' },
        { lang: 'az', value: 'qəza etdim' },
        { lang: 'ru', value: 'Я попал в аварию' }
      ],
      type: 'DELIVERY',
      _id: '5edf8d454646dc29fc7e0e97'
    },
    {
      by: 'DRIVER',
      when: 'BEFORE_PICK_UP',
      title: [
        { lang: 'en', value: 'Passenger is in unNormal State' },
        { lang: 'az', value: 'qəza etdim' },
        { lang: 'ru', value: 'Я попал в аварию' }
      ],
      type: 'RIDE',
      _id: '5edf8d454646dc29fc7e0e98'
    },
    {
      by: 'DRIVER',
      when: 'DURING_TRIP',
      title: [
        { lang: 'en', value: 'my car was damaged' },
        { lang: 'az', value: 'qəza etdim' },
        { lang: 'ru', value: 'Я попал в аварию' }
      ],
      type: 'RIDE',
      _id: '5edf8d454646dc29fc7e0e99'
    },
    {
      by: 'DRIVER',
      when: 'DURING_TRIP',
      title: [
        { lang: 'en', value: 'my car was damaged' },
        { lang: 'az', value: 'qəza etdim' },
        { lang: 'ru', value: 'Я попал в аварию' }
      ],
      type: 'DELIVERY',
      _id: '5edf8d454646dc29fc7e0e9a'
    },
    {
      by: 'PASSENGER',
      when: 'BEFORE_PICK_UP',
      title: [
        { lang: 'en', value: 'drivers picture Does not Mach' },
        { lang: 'az', value: 'qəza etdim' },
        { lang: 'ru', value: 'Я попал в аварию' }
      ],
      type: 'DELIVERY',
      _id: '5edf8d454646dc29fc7e0e9b'
    },
    {
      by: 'PASSENGER',
      when: 'BEFORE_PICK_UP',
      title: [
        { lang: 'en', value: 'its a different Car' },
        { lang: 'az', value: 'qəza etdim' },
        { lang: 'ru', value: 'Я попал в аварию' }
      ],
      type: 'RIDE',
      _id: '5edf8d454646dc29fc7e0e9c'
    },
    {
      by: 'PASSENGER',
      when: 'BEFORE_PICK_UP',
      title: [
        { lang: 'en', value: 'car has a different CarId' },
        { lang: 'az', value: 'qəza etdim' },
        { lang: 'ru', value: 'Я попал в аварию' }
      ],
      type: 'DELIVERY',
      _id: '5edf8d454646dc29fc7e0e9d'
    },
    {
      by: 'PASSENGER',
      when: 'BEFORE_PICK_UP',
      title: [
        { lang: 'en', value: 'driver has an unNormal state' },
        { lang: 'az', value: 'qəza etdim' },
        { lang: 'ru', value: 'Я попал в аварию' }
      ],
      type: 'RIDE',
      _id: '5edf8d454646dc29fc7e0e9e'
    },
    {
      by: 'PASSENGER',
      when: 'BEFORE_PICK_UP',
      title: [
        { lang: 'en', value: 'driver has an unNormal state' },
        { lang: 'az', value: 'qəza etdim' },
        { lang: 'ru', value: 'Я попал в аварию' }
      ],
      type: 'DELIVERY',
      _id: '5edf8d454646dc29fc7e0e9f'
    },
    {
      by: 'PASSENGER',
      when: 'DURING_TRIP',
      title: [
        { lang: 'en', value: 'driver has an unNormal state' },
        { lang: 'az', value: 'qəza etdim' },
        { lang: 'ru', value: 'Я попал в аварию' }
      ],
      type: 'RIDE',
      _id: '5edf8d454646dc29fc7e0ea0'
    },
    {
      by: 'PASSENGER',
      when: 'DURING_TRIP',
      title: [
        { lang: 'en', value: 'driver has an unNormal state' },
        { lang: 'az', value: 'qəza etdim' },
        { lang: 'ru', value: 'Я попал в аварию' }
      ],
      type: 'DELIVERY',
      _id: '5edf8d454646dc29fc7e0ea1'
    },
    {
      by: 'PASSENGER',
      when: 'DURING_TRIP',
      title: [
        { lang: 'en', value: 'has an accident' },
        { lang: 'az', value: 'qəza etdim' },
        { lang: 'ru', value: 'Я попал в аварию' }
      ],
      type: 'RIDE',
      _id: '5edf8d454646dc29fc7e0ea2'
    },
    {
      by: 'PASSENGER',
      when: 'DURING_TRIP',
      title: [
        { lang: 'en', value: 'has an accident' },
        { lang: 'az', value: 'qəza etdim' },
        { lang: 'ru', value: 'Я попал в аварию' }
      ],
      type: 'DELIVERY',
      _id: '5edf8d454646dc29fc7e0ea3'
    }
  ]

  const canceledTripReasonKeys = Object.keys(canceledTripReason)
  for (let i = 0; i < canceledTripReasonKeys.length; i += 1) {
    const data = canceledTripReason[canceledTripReasonKeys[i]]
    CanceledTripReason.create(data)
  }

  const constantKeys = [
    {
      attribute: 'TRIP_PAYMENT_CASH',
      value: true,
      typeOfAttribute: 'BOOLEAN',
      _id: '5edf8d924646dc29fc7e0ea3'
    },
    {
      attribute: 'TRIP_PAYMENT_CREDIT',
      value: true,
      typeOfAttribute: 'BOOLEAN',
      _id: '5edf8d924646dc29fc7e0ea2'
    },
    {
      attribute: 'TRIP_BASE_FARE',
      value: 20,
      typeOfAttribute: 'NUMBER',
      _id: '5edf8d924646dc29fc7e0ea4'
    },
    {
      attribute: 'TRIP_HST',
      value: 13,
      typeOfAttribute: 'PERCENTAGE',
      _id: '5edf8d924646dc29fc7e0ea5'
    },
    {
      attribute: 'TRIP_COMMISSION',
      value: 20,
      typeOfAttribute: 'PERCENTAGE',
      _id: '5edf8d924646dc29fc7e0ea6'
    },
    {
      attribute: 'TRIP_BOOKING_FEE',
      value: 25,
      typeOfAttribute: 'NUMBER',
      _id: '5edf8d924646dc29fc7e0ea7'
    },
    {
      attribute: 'TRIP_WITH_INFANT',
      value: 20,
      typeOfAttribute: 'PERCENTAGE',
      _id: '5edf8d924646dc29fc7e0ea8'
    },
    {
      attribute: 'TRIP_BAGS_WITH_ME',
      value: 1,
      typeOfAttribute: 'NUMBER',
      _id: '5edf8d924646dc29fc7e0ea9'
    },
    {
      attribute: 'TRIP_PET_WITH_CARRIER',
      value: 30,
      typeOfAttribute: 'NUMBER',
      _id: '5edf8d924646dc29fc7e0eaa'
    },
    {
      attribute: 'TRIP_PET_WITHOUT_CARRIER',
      value: 4,
      typeOfAttribute: 'NUMBER',
      _id: '5edf8d924646dc29fc7e0eab'
    },
    {
      attribute: 'TRIP_DRIVER_ASSISTANT',
      value: 3,
      typeOfAttribute: 'NUMBER',
      _id: '5edf8d924646dc29fc7e0eac'
    },
    {
      attribute: 'TRIP_WELCOME_SIGN',
      value: 2,
      typeOfAttribute: 'NUMBER',
      _id: '5edf8d924646dc29fc7e0ead'
    },
    {
      attribute: 'TRIP_ARRIVAL_AT_THE_AIRPORT',
      value: 5,
      typeOfAttribute: 'NUMBER',
      _id: '5edf8d924646dc29fc7e0eae'
    },
    {
      attribute: 'TRIP_AIR_CONDITIONER',
      value: 5,
      typeOfAttribute: 'NUMBER',
      _id: '5edf8d924646dc29fc7e0eaf'
    },
    {
      attribute: 'DOOR_TO_DOOR_IN_BUILDING',
      value: 5,
      typeOfAttribute: 'NUMBER',
      _id: '5edf8d924646dc29fc7e0eb0'
    },
    {
      attribute: 'ACCOMPANY_PARCEL',
      value: 5,
      typeOfAttribute: 'NUMBER',
      _id: '5edf8d924646dc29fc7e0eb1'
    },
    {
      attribute: 'PARCEL_PACKED',
      value: 5,
      typeOfAttribute: 'NUMBER',
      _id: '5edf8d924646dc29fc7e0eb2'
    },
    {
      attribute: 'WAIT_TIMES_IN_MINUTES',
      value: 5,
      typeOfAttribute: 'NUMBER',
      _id: '5edf8d924646dc29fc7e0eb3'
    },
    {
      attribute: 'TRIP_COEFFICIENT',
      value: 10,
      typeOfAttribute: 'NUMBER',
      _id: '5edf8d924646dc29fc7e0eb4'
    },
    {
      attribute: 'FIND_DRIVER_RADIUS',
      value: 50000,
      typeOfAttribute: 'NUMBER',
      _id: '5edf8d924646dc29fc7e0eb5'
    },
    {
      attribute: 'MAX_RADIUS_COEFFICIENT',
      value: 3,
      typeOfAttribute: 'NUMBER',
      _id: '5edf8d924646dc29fc7e0eb6'
    },
    {
      attribute: 'ACCEPT_TRIP_TIMEOUT_SECONDS',
      value: 300,
      typeOfAttribute: 'NUMBER',
      _id: '5edf8d924646dc29fc7e0eb7'
    },
    {
      attribute: 'SHOP_COMMISSION',
      value: 20,
      typeOfAttribute: 'PERCENTAGE',
      _id: '5edf8d924646dc29fc7e0eb8'
    },
    {
      attribute: 'SHOP_HST',
      value: 13,
      typeOfAttribute: 'PERCENTAGE',
      _id: '5edf8d924646dc29fc7e0eb9'
    },
    {
      attribute: 'SHOP_MAXIMUM_DISTANCE',
      value: 10000,
      typeOfAttribute: 'NUMBER',
      _id: '5edf8d924646dc29fc7e0eba'
    },
    {
      attribute: 'ONLINE_CARS_AROUND_RADIUS',
      value: 50000,
      typeOfAttribute: 'NUMBER',
      _id: '5edf8d924646dc29fc7e0ebb'
    },
    {
      attribute: 'PAYMENT_INTERVAL_IN_HOURS',
      value: 24,
      typeOfAttribute: 'NUMBER'
    },
    {
      attribute: 'ORDER_BASE_PREPARE_TIME',
      value: 20,
      typeOfAttribute: 'NUMBER',
      _id: '5edf8d924646dc29fc7e0ebc'
    },
    {
      attribute: 'COUNT_CANCEL_TRIP_BY_DRIVER',
      value: 5,
      typeOfAttribute: 'NUMBER',
      _id: '5edf8d924646dc29fc7e0ebd'
    },
    {
      attribute: 'MAXIMUM_DEBT_AMOUNT_SUSPEND_DRIVER',
      value: 500,
      typeOfAttribute: 'NUMBER',
      _id: '5edf8d924646dc29fc7e0ebe'
    }
  ]

  for (let i = 0; i < constantKeys.length; i += 1) {
    Constant.create(constantKeys[i])
  }

  // seeding cancelReservationConstants

  const cancelReservationConstantKeys = [
    {
      from: 1,
      to: 2,
      ratePunishment: 0.2,
      costPunishment: 6,
      forType: 'DRIVER'
    },
    {
      from: 2,
      to: 4,
      ratePunishment: 0.2,
      costPunishment: 4,
      forType: 'DRIVER'
    },
    {
      from: 4,
      to: 8,
      ratePunishment: 0,
      costPunishment: 3,
      forType: 'DRIVER'
    },
    {
      from: 8,
      to: 16,
      ratePunishment: 0,
      costPunishment: 2,
      forType: 'DRIVER'
    },
    {
      from: 16,
      to: 24,
      ratePunishment: 0,
      costPunishment: 1,
      forType: 'DRIVER'
    },
    {
      from: 24,
      ratePunishment: 0,
      costPunishment: 0.5,
      forType: 'DRIVER'
    },
    {
      from: 1,
      to: 2,
      ratePunishment: 0,
      costPunishment: 5,
      forType: 'PASSENGER'
    },
    {
      from: 2,
      to: 4,
      ratePunishment: 0,
      costPunishment: 3,
      forType: 'PASSENGER'
    },
    {
      from: 4,
      to: 8,
      ratePunishment: 0,
      costPunishment: 2,
      forType: 'PASSENGER'
    },
    {
      from: 8,
      to: 16,
      ratePunishment: 0,
      costPunishment: 1,
      forType: 'PASSENGER'
    },
    {
      from: 16,
      to: 24,
      ratePunishment: 0,
      costPunishment: 0.5,
      forType: 'PASSENGER'
    },
    {
      from: 24,
      ratePunishment: 0,
      costPunishment: 0.25,
      forType: 'PASSENGER'
    }
  ]

  cancelReservationConstantKeys.forEach(async cancelReservationConstantObj => {
    await CancelReservationConstant.create(cancelReservationConstantObj)
  })

  // seed categories
  console.log('seeding categories')

  let rootCategories: any[] = []
  rootCategories = rootCategories.concat(
    await categorySeeder({
      _id: '5edf8dbd4646dc29fc7e0ebd',
      parent: null,
      title: [
        { lang: 'en', value: 'Restaurant' },
        { lang: 'az', value: 'Restoran' },
        { lang: 'ru', value: 'Ресторан' }
      ],
      photoUrl: null
    })
  )

  rootCategories = rootCategories.concat(
    await categorySeeder({
      _id: '5edf8dbe4646dc29fc7e0ebe',
      parent: null,
      title: [
        { lang: 'en', value: 'Purchase' },
        { lang: 'az', value: 'Alış' },
        { lang: 'ru', value: 'Покупка' }
      ],
      photoUrl: null
    })
  )

  // seed errors
  console.log('seeding errors')
  for (let i = 0; i < errorsKeys.length; i += 1) {
    errorSchema.create(errorsKeys[i])
  }

  // seed attributeGroups
  // console.log('seeding attributeGroups')
  // let items

  // const [group1]: any[] = await attributeGroupSeeder({
  //   _id: '5edf91644646dc29fc7e0ebf',
  //   category: rootCategories[1],
  //   name: 'Cuisine'
  // })

  // items = [
  //   {
  //     _id: '5edf93444646dc29fc7e0ec0',
  //     attributeGroup: group1._id,
  //     name: 'Italian',
  //     photoUrl: faker.image.imageUrl()
  //   },
  //   {
  //     _id: '5edf93444646dc29fc7e0ec1',
  //     attributeGroup: group1._id,
  //     name: 'Indian',
  //     photoUrl: faker.image.imageUrl()
  //   },
  //   {
  //     _id: '5edf93444646dc29fc7e0ec2',
  //     attributeGroup: group1._id,
  //     name: 'Asian',
  //     photoUrl: faker.image.imageUrl()
  //   },
  //   {
  //     _id: '5edf93454646dc29fc7e0ec3',
  //     attributeGroup: group1._id,
  //     name: 'American',
  //     photoUrl: faker.image.imageUrl()
  //   },
  //   {
  //     _id: '5edf93454646dc29fc7e0ec4',
  //     attributeGroup: group1._id,
  //     name: 'Mediterranean',
  //     photoUrl: faker.image.imageUrl()
  //   },
  //   {
  //     _id: '5edf93454646dc29fc7e0ec5',
  //     attributeGroup: group1._id,
  //     name: 'African',
  //     photoUrl: faker.image.imageUrl()
  //   },
  //   {
  //     _id: '5edf93454646dc29fc7e0ec6',
  //     attributeGroup: group1._id,
  //     name: 'Middle Eastern',
  //     photoUrl: faker.image.imageUrl()
  //   }
  // ]
  // for (const item of items) {
  //   await attributeSeeder(item)
  // }

  // const [group2]: any[] = await attributeGroupSeeder({
  //   _id: '5edf93464646dc29fc7e0ec7',
  //   category: rootCategories[0],
  //   name: 'Special'
  // })

  // items = [
  //   {
  //     _id: '5edf93464646dc29fc7e0ec8',
  //     attributeGroup: group2._id,
  //     name: 'Halal',
  //     photoUrl: faker.image.imageUrl()
  //   },
  //   {
  //     _id: '5edf93464646dc29fc7e0ec9',
  //     attributeGroup: group2._id,
  //     name: 'Kosher',
  //     photoUrl: faker.image.imageUrl()
  //   },
  //   {
  //     _id: '5edf93464646dc29fc7e0eca',
  //     attributeGroup: group2._id,
  //     name: 'Vegetarian',
  //     photoUrl: faker.image.imageUrl()
  //   },
  //   {
  //     _id: '5edf93474646dc29fc7e0ecb',
  //     attributeGroup: group2._id,
  //     name: 'Vegan',
  //     photoUrl: faker.image.imageUrl()
  //   }
  // ]
  // for (const item of items) {
  //   await attributeSeeder(item)
  // }

  // const [group3]: any[] = await attributeGroupSeeder({
  //   _id: '5edf93474646dc29fc7e0ecc',
  //   category: rootCategories[0],
  //   name: 'Allergy Proof'
  // })

  // items = [
  //   {
  //     _id: '5edf93f54646dc29fc7e0ece',
  //     attributeGroup: group3._id,
  //     name: 'Seafood',
  //     photoUrl: faker.image.imageUrl()
  //   },
  //   {
  //     _id: '5edf93f64646dc29fc7e0ecf',
  //     attributeGroup: group3._id,
  //     name: 'Nuts',
  //     photoUrl: faker.image.imageUrl()
  //   },
  //   {
  //     _id: '5edf93f64646dc29fc7e0ed0',
  //     attributeGroup: group3._id,
  //     name: 'Dairy',
  //     photoUrl: faker.image.imageUrl()
  //   },
  //   {
  //     _id: '5edf93f64646dc29fc7e0ed1',
  //     attributeGroup: group3._id,
  //     name: 'gluten',
  //     photoUrl: faker.image.imageUrl()
  //   }
  // ]
  // for (const item of items) {
  //   await attributeSeeder(item)
  // }

  // const [group4]: any[] = await attributeGroupSeeder({
  //   _id: '5edf94754646dc29fc7e0ed8',
  //   category: rootCategories[0],
  //   name: 'Other Options'
  // })

  // items = [
  //   {
  //     _id: '5edf94794646dc29fc7e0ed9',
  //     attributeGroup: group4._id,
  //     name: 'Seafood',
  //     photoUrl: faker.image.imageUrl()
  //   },
  //   {
  //     _id: '5edf947a4646dc29fc7e0eda',
  //     attributeGroup: group4._id,
  //     name: 'Fast Food',
  //     photoUrl: faker.image.imageUrl()
  //   },
  //   {
  //     _id: '5edf947a4646dc29fc7e0edb',
  //     attributeGroup: group4._id,
  //     name: 'Desert',
  //     photoUrl: faker.image.imageUrl()
  //   },
  //   {
  //     _id: '5edf947a4646dc29fc7e0edc',
  //     attributeGroup: group4._id,
  //     name: 'Breakfast',
  //     photoUrl: faker.image.imageUrl()
  //   },
  //   {
  //     _id: '5edf962dcf66e036e05a06fe',
  //     attributeGroup: group4._id,
  //     name: 'Appetizers',
  //     photoUrl: faker.image.imageUrl()
  //   }
  // ]
  // for (const item of items) {
  //   await attributeSeeder(item)
  // }

  // const [group5]: any[] = await attributeGroupSeeder({
  //   _id: '5edf96a17383811dd4d73d0e',
  //   category: rootCategories[0],
  //   name: 'Cuisine'
  // })

  // items = [
  //   {
  //     _id: '5edf94dd4646dc29fc7e0ee2',
  //     attributeGroup: group5._id,
  //     name: 'Italian',
  //     photoUrl: faker.image.imageUrl()
  //   },
  //   {
  //     _id: '5edf94de4646dc29fc7e0ee3',
  //     attributeGroup: group5._id,
  //     name: 'Indian',
  //     photoUrl: faker.image.imageUrl()
  //   },
  //   {
  //     _id: '5edf94de4646dc29fc7e0ee4',
  //     attributeGroup: group5._id,
  //     name: 'Asian',
  //     photoUrl: faker.image.imageUrl()
  //   },
  //   {
  //     _id: '5edf94de4646dc29fc7e0ee5',
  //     attributeGroup: group5._id,
  //     name: 'American',
  //     photoUrl: faker.image.imageUrl()
  //   },
  //   {
  //     _id: '5edf94df4646dc29fc7e0ee6',
  //     attributeGroup: group5._id,
  //     name: 'Mediterranean',
  //     photoUrl: faker.image.imageUrl()
  //   },
  //   {
  //     _id: '5edf94df4646dc29fc7e0ee7',
  //     attributeGroup: group5._id,
  //     name: 'African',
  //     photoUrl: faker.image.imageUrl()
  //   },
  //   {
  //     _id: '5edf94df4646dc29fc7e0ee8',
  //     attributeGroup: group5._id,
  //     name: 'Middle Eastern',
  //     photoUrl: faker.image.imageUrl()
  //   }
  // ]
  // for (const item of items) {
  //   await attributeSeeder(item)
  // }

  console.log(green('models are seeded'))
}
