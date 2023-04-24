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
import CancelReservationConstant from '../schema/cancelReservationConstant/schema'
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
import Transaction from '../schema/transaction/schema'
import Payment from '../schema/payment/schema'
import carSeeder from '../schema/car/seeder'
import carTypeSeeder from '../schema/carType/seeder'
import userSeeder from '../schema/user/seeder'
import TripPromotionUsed from '../schema/tripPromotionUsed/schema'
import ParcelWeight from '../schema/parcelWeight/schema'
import ParcelVolume from '../schema/parcelVolume/schema'
import favoritePlacesSeeder from '../schema/favoritePlaces/seeder'
import tripPromotionSeeder from '../schema/tripPromotion/seeder'
import driverSeeder from '../schema/driver/seeder'
import productSeeder from '../schema/product/seeder'
import categorySeeder from '../schema/category/seeder'
import adminSeeder from '../schema/admin/seeder'
import tripSeeder from '../schema/trip/seeder'
import attributeSeeder from '../schema/attribute/seeder'
import attributeGroupSeeder from '../schema/attributeGroup/seeder'
import tripPromotionUsedSeeder from '../schema/tripPromotionUsed/seeder'
import shopSeeder from '../schema/shop/seeder'
import shopMenuSeeder from '../schema/shopMenu/seeder'
import reqCarTypeSeeder from '../schema/reqCarType/seeder'
import ReqCarType from '../schema/reqCarType/schema'
import notificationSeeder from '../schema/notification/seeder'
import helpSeeder from '../schema/help/seeder'
import legalSeeder from '../schema/legal/seeder'
import advertisementSeeder from '../schema/advertisement/seeder'
import carModelSeeder from '../schema/carModel/seeder'
import carColorSeeder from '../schema/carColor/seeder'
import tripOrderSeeder from '../schema/tripOrder/seeder'
import shopReceiptSeeder from '../schema/shopReceipt/seeder'
import shopReadyCommentSeeder from '../schema/shopReadyComments/seeder'
import parcelWeightSeeder from '../schema/parcelWeight/seeder'
import parcelVolumeSeeder from '../schema/parcelVolume/seeder'
import driverHowItWorksSeeder from '../schema/driverHowItWorks/seeder'
import shopHowItWorksSeeder from '../schema/shopHowItWorks/seeder'
import transactionSeeder from '../schema/transaction/seeder'
import paymentSeeder from '../schema/payment/seeder'
import ShopHowItWorks from '../schema/shopHowItWorks/schema'
export default async (count = 1, ctx: any = {}) => {
  // reset db
  await CarType.deleteMany({})
  await PassengerReadyComment.deleteMany({})
  await DriverReadyComment.deleteMany({})
  await Help.deleteMany({})
  await Legal.deleteMany({})
  await ReadyMessage.deleteMany({})
  await Advertisement.deleteMany({})
  await ShopHowItWorks.deleteMany({})
  await carModel.deleteMany({})
  await carBrand.deleteMany({})
  await carColor.deleteMany({})
  await ReqCarType.deleteMany({})
  await Constant.deleteMany({})
  await ParcelWeight.deleteMany({})
  await ParcelVolume.deleteMany({})
  await DriverHowItWorks.deleteMany({})
  await CanceledTripReason.deleteMany({})
  await Payment.deleteMany({})
  await Transaction.deleteMany({})

  if (!ctx.add) {
    console.log(green('deleting old db data'))
    await Car.deleteMany({})
    if (!ctx.keepUsers) {
      await User.deleteMany({})
    }
    await FavoritePlaces.deleteMany({})
    await TripPromotion.deleteMany({})
    await Driver.deleteMany({})
    await Category.deleteMany({})
    await Product.deleteMany({})
    await Admin.deleteMany({})
    await Trip.deleteMany({})
    await Attribute.deleteMany({})
    await AttributeGroup.deleteMany({})
    await Shop.deleteMany({})
    await ShopMenu.deleteMany({})
    await TripPromotionUsed.deleteMany({})
    await TripOrder.deleteMany({})
    await Notification.deleteMany({})
    await ShopReceipt.deleteMany({})
    await ShopReadyComment.deleteMany({})
  }

  // seed parcel weights
  console.log('parcel weight seeder')
  const parcelWeights = ['1 - 10', '10 - 20', '20 - 50', '50 - 100', '100 - 150']
  await Promise.all(
    parcelWeights.map(async (i, k) => {
      await parcelWeightSeeder({ name: i, order: k + 1 })
    })
  )

  // seed parcel weights
  console.log('parcel weight seeder')
  const parcelVolumes = ['0.1 - 0.5', '0.5 - 1', '1 - 2', '2 - 5', '5 - 10', '10 - 15']
  await Promise.all(
    parcelVolumes.map(async (i, k) => {
      await parcelVolumeSeeder({ name: i, order: k + 1 })
    })
  )

  // seed car types
  console.log('seeding car types')
  const availableCarTypes = {
    COMPACT: {
      maximumPassengersCount: 3,
      maximumWeight: 3,
      description: [
        {
          lang: 'en',
          value: 'up to 3 passengers and 3 bags'
        }
      ],
      logoUrl: '/images/icons/compact.svg'
    },
    INTERMEDIATE: {
      maximumPassengersCount: 4,
      maximumWeight: 4,
      description: [
        {
          lang: 'en',
          value: 'up to 6 passengers and 3 bags'
        }
      ],
      logoUrl: '/images/icons/intermediate.svg'
    },
    FULL_SIZE: {
      maximumPassengersCount: 6,
      maximumWeight: 3,
      description: [
        {
          lang: 'en',
          value: 'up to 6 passengers and 3 bags'
        }
      ],
      logoUrl: '/images/icons/full-size.svg'
    },
    PREMIUM: {
      maximumPassengersCount: 7,
      maximumWeight: 7,
      description: [
        {
          lang: 'en',
          value: 'up to 7 passengers and 7 bags'
        }
      ],
      logoUrl: '/images/icons/premium.svg'
    },
    BIKE: {
      maximumPassengersCount: null,
      maximumWeight: null,
      description: [
        {
          lang: 'en',
          value: 'for smallparcels'
        }
      ],
      logoUrl: '/images/icons/bike.svg'
    },
    MOTORCYCLE: {
      maximumPassengersCount: null,
      maximumWeight: null,
      description: [
        {
          lang: 'en',
          value: 'for smallparcels'
        }
      ],
      logoUrl: '/images/icons/motorcycle.svg'
    },
    TRUCK: {
      maximumPassengersCount: null,
      maximumWeight: null,
      description: [
        {
          lang: 'en',
          value: 'for smallparcels'
        }
      ],
      logoUrl: '/images/icons/truck.svg'
    },
    TRAILER: {
      maximumPassengersCount: null,
      maximumWeight: null,
      description: [
        {
          lang: 'en',
          value: 'for largeparcels'
        }
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
      tripType: 'DELIVERY',
      carTypes: [carTypes[4]._id, carTypes[5]._id],
      logoUrl: ['/images/icons/motorcycle.svg', '/images/icons/bicycle.svg'],
      increasePricePercent: 5,
      DistanceBasePricePerKM: 0.3,
      PerMinute: 0.13,
      BookingFee: 1,
      BaseFare: 3,
      maximumPassengersCount: 0,
      maximumWeight: 3,
      description: 'small parcels'
    },
    TRUCK_TRAILER: {
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
      tripType: 'DELIVERY',
      carTypes: [carTypes[0]._id, carTypes[1]._id, carTypes[2]._id, carTypes[3]._id],
      logoUrl: ['/images/icons/compact-delivery.svg', '/images/icons/intermediate-delivery.svg'],
      increasePricePercent: 5,
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
      title: [
        {
          lang: 'en',
          value: 'i want to report a service animal issue'
        }
      ],
      type: 'TAXI'
    },
    I_LOST_AN_ITEM: {
      title: [
        {
          lang: 'en',
          value: 'i lost an item'
        }
      ],
      type: 'TAXI'
    },
    I_WAS_INVOLVED_IN_AN_ACCIDENT: {
      title: [
        {
          lang: 'en',
          value: 'i was involved in an accident'
        }
      ],
      type: 'TAXI'
    },
    LEARN_ABOUT_BEDO: {
      title: [
        {
          lang: 'en',
          value: 'learn about BEDO'
        }
      ],
      type: 'TAXI'
    },
    ACCOUNT_AND_PAYMENT: {
      title: [
        {
          lang: 'en',
          value: 'account & payment'
        }
      ],
      type: 'TAXI'
    },
    RIDE_GUIDE: {
      title: [
        {
          lang: 'en',
          value: 'ride guide'
        }
      ],
      type: 'TAXI'
    },
    FOOD_GUIDE: {
      title: [
        {
          lang: 'en',
          value: 'food guide'
        }
      ],
      type: 'TAXI'
    },
    GROCERY_SHOPPING_GUIDE: {
      title: [
        {
          lang: 'en',
          value: 'grocery shopping guide'
        }
      ],
      type: 'TAXI'
    },
    DELIVERY_GUIDE: {
      title: [
        {
          lang: 'en',
          value: 'delivery guide'
        }
      ],
      type: 'TAXI'
    },
    MY_PARCEL_WAS_NOT_DELIVERED: {
      title: [
        {
          lang: 'en',
          value: 'My parcel  was not delivered'
        }
      ],
      type: 'DELIVERY'
    },
    MY_PARCEL_IS_MISSING_AN_ITEM: {
      title: [
        {
          lang: 'en',
          value: 'my parcel is missing an item'
        }
      ],
      type: 'DELIVERY'
    },
    MY_DELIVERY_HAS_BEEN_DELAYED: {
      title: [
        {
          lang: 'en',
          value: 'My delivery has been delayed'
        }
      ],
      type: 'DELIVERY'
    },
    DELIVERY_COSTED_MORE_THAN_ESTIMATED: {
      title: [
        {
          lang: 'en',
          value: 'delivery costed more than estimated'
        }
      ],
      type: 'DELIVERY'
    },
    MY_PACKAGE_WAS_OPENED: {
      title: [
        {
          lang: 'en',
          value: 'my package was opened'
        }
      ],
      type: 'DELIVERY'
    },
    OTHER_ISSUES: {
      title: [
        {
          lang: 'en',
          value: 'other issues'
        }
      ],
      type: 'DELIVERY'
    },
    I_LOST_AN_ITEM_DELIVERY: {
      title: [
        {
          lang: 'en',
          value: 'i lost an item'
        }
      ],
      type: 'DELIVERY'
    },
    FOOD_OTHER_ISSUES: {
      title: [
        {
          lang: 'en',
          value: 'Other issues'
        }
      ],
      type: 'FOOD'
    },
    FOOD_MY_ORDER_COSTED_MORE_THAN_ESTIMATED: {
      title: [
        {
          lang: 'en',
          value: 'My order costed more than estimated'
        }
      ],
      type: 'FOOD'
    },
    FOOD_MY_ORDER_HAS_BEEN_DELAYED: {
      title: [
        {
          lang: 'en',
          value: 'My order has been delayed'
        }
      ],
      type: 'FOOD'
    },
    FOOD_MY_ORDER_WAS_DIFFERENT: {
      title: [
        {
          lang: 'en',
          value: 'My order was differents'
        }
      ],
      type: 'FOOD'
    },
    GROCERY_OTHER_ISSUES: {
      title: [
        {
          lang: 'en',
          value: 'Other issues'
        }
      ],
      type: 'GROCERY'
    },
    GROCERY_MY_DELIVERY_COSTED_MORE_THAN_ESTIMATED: {
      title: [
        {
          lang: 'en',
          value: 'My order costed more than estimated'
        }
      ],
      type: 'GROCERY'
    },
    GROCERY_MY_ORDER_HAS_BEEN_DELAYED: {
      title: [
        {
          lang: 'en',
          value: 'My order has been delayed'
        }
      ],
      type: 'GROCERY'
    },
    GROCERY_MY_ORDER_WAS_DIFFERENT: {
      title: [
        {
          lang: 'en',
          value: 'My order was different'
        }
      ],
      type: 'GROCERY'
    },
    DRIVER_RIDE_HELP: {
      title: null,
      description: [
        {
          lang: 'en',
          value: 'If you had any issue in this ride you can contact us or the passenger'
        }
      ],
      type: 'DRIVER_RIDE'
    },
    DRIVER_DELIVERY_HELP: {
      title: null,
      description: [
        {
          lang: 'en',
          value:
            'If you had any issue in this delivery you can contact us, the sender or the passenger'
        }
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
      title: [
        {
          lang: 'en',
          value: 'copy right'
        }
      ]
    },
    TERMS_AND_CONDITIONS: {
      title: [
        {
          lang: 'en',
          value: 'terms & conditions'
        }
      ]
    },
    PRIVACY_POLICY: {
      title: [
        {
          lang: 'en',
          value: 'privacy policy'
        }
      ]
    },
    DATA_PROVIDERS: {
      title: [
        {
          lang: 'en',
          value: 'data providers'
        }
      ]
    },
    SOFTWARE_LICENCE: {
      title: [
        {
          lang: 'en',
          value: 'data providers'
        }
      ]
    },
    LOCATION_INFORMATION: {
      title: [
        {
          lang: 'en',
          value: 'location information'
        }
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
      title: [
        {
          lang: 'en',
          value: 'accept an order'
        }
      ]
    },
    REPORT_A_PROBLEM: {
      title: [
        {
          lang: 'en',
          value: 'report a problem'
        }
      ]
    },
    PRIVACY_POLICY: {
      title: [
        {
          lang: 'en',
          value: 'privacy policy'
        }
      ]
    },
    CUSTOMER_SERVICE: {
      title: [
        {
          lang: 'en',
          value: 'customer service'
        }
      ]
    },
    SOFTWARE_LICENCE: {
      title: [
        {
          lang: 'en',
          value: 'software licence'
        }
      ]
    },
    PAYMENT_ISSUES: {
      title: [
        {
          lang: 'en',
          value: 'payment issues'
        }
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
      title: [
        {
          lang: 'en',
          value: 'accept a trip'
        }
      ]
    },
    REPORT_A_PROBLEM: {
      title: [
        {
          lang: 'en',
          value: 'report a problem'
        }
      ]
    },
    PRIVACY_POLICY: {
      title: [
        {
          lang: 'en',
          value: 'privacy policy'
        }
      ]
    },
    CUSTOMER_SERVICE: {
      title: [
        {
          lang: 'en',
          value: 'customer service'
        }
      ]
    },
    SOFTWARE_LICENCE: {
      title: [
        {
          lang: 'en',
          value: 'software licence'
        }
      ]
    },
    PAYMENT_ISSUES: {
      title: [
        {
          lang: 'en',
          value: 'payment issues'
        }
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

  const availableCarColors = {
    red: {
      code: '#ff0000'
    },
    black: {
      code: '#000000'
    },
    lemon: {
      code: '#fff700'
    },
    brown: {
      code: '#964b00'
    },
    blue: {
      code: '#0000ff'
    },
    beige: {
      code: '#f5f5dc'
    },
    yellow: {
      code: '#ffff00'
    },
    white: {
      code: '#ffffff'
    },
    grey: {
      code: '#8c92ac'
    },
    pink: {
      code: '#ffc0cb'
    },
    purple: {
      code: '#800080'
    },
    orange: {
      code: '#ff7f00'
    }
  }

  let colors: any[] = []
  for (const color in availableCarColors) {
    colors = colors.concat(
      await carColorSeeder({
        name: [
          {
            lang: 'en',
            value: color
          }
        ],
        ...availableCarColors[color]
      })
    )
  }

  console.log('seeding car brands')

  const BMW = await carBrand.create({ name: 'BMW' })
  const Audi = await carBrand.create({ name: 'Audi' })

  console.log('seeding car models ')
  const availableCarModels = {
    'Audi A1': {
      brand: Audi._id
    },
    'Audi A2': {
      brand: Audi._id
    },
    'Audi A3': {
      brand: Audi._id
    },
    'Audi E-tron': {
      brand: Audi._id
    },
    'Audi TT': {
      brand: Audi._id
    },
    'Audi A4': {
      brand: Audi._id
    },
    'Audi A5': {
      brand: Audi._id
    },
    'Audi A6': {
      brand: Audi._id
    },
    'BMW 228 Gran Coupe': {
      brand: BMW._id
    },
    'BMW 230': {
      brand: BMW._id
    },
    'BMW 330': {
      brand: BMW._id
    },
    'BMW 540': {
      brand: BMW._id
    },
    'BMW 440': {
      brand: BMW._id
    },
    'BMW 430': {
      brand: BMW._id
    },
    'BMW 430 Gran Coupe': {
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
  // seed cars
  console.log('seeding cars')
  let cars: any[] = []
  for (let i = 0; i < count; i++) {
    const brand = faker.random.arrayElement([BMW, Audi])
    const model = faker.random.arrayElement(
      brand === BMW
        ? carModels.filter(item => item.name.toLowerCase().includes('bmw'))
        : carModels.filter(item => item.name.toLowerCase().includes('audi'))
    )
    cars = cars.concat(
      await carSeeder({
        carType: faker.random.arrayElement(carTypes),
        color: faker.random.arrayElement(colors),
        brand,
        model
      })
    )
  }

  // seed drivers
  console.log('seeding drivers')
  let drivers: any[] = []
  for (let i = 0; i < count; i++) {
    drivers = drivers.concat(
      await driverSeeder({
        defaultCar: cars[i]
      })
    )
  }

  // seed verified drivers
  console.log('seeding verified drivers')
  let verifiedDrivers: any[] = []
  for (let i = 0; i < count; i++) {
    let verifiedDriversCars: any[] = []
    for (let j = 0; j < count; j++) {
      const brand = faker.random.arrayElement([BMW, Audi])
      const model = faker.random.arrayElement(
        brand === BMW
          ? carModels.filter(item => item.name.toLowerCase().includes('bmw'))
          : carModels.filter(item => item.name.toLowerCase().includes('audi'))
      )
      verifiedDriversCars = verifiedDriversCars.concat(
        await carSeeder({
          carType: faker.random.arrayElement(carTypes),
          color: faker.random.arrayElement(colors),
          brand,
          model
        })
      )
    }
    verifiedDrivers = verifiedDrivers.concat(
      await driverSeeder({
        defaultCar: verifiedDriversCars[i],
        isVerified: true,
        email: `verified_${faker.internet.email()}`
      })
    )
  }

  console.log('seeding users')

  const users = await userSeeder(count)

  // seed favorite places
  console.log('seeding favorite places')
  let favoritePlaces: any[] = []
  for (let i = 0; i < count; i++) {
    favoritePlaces = favoritePlaces.concat(
      await favoritePlacesSeeder({
        user: users[i]
      })
    )
  }

  // seed trip promotion
  console.log('seeding trip promotions')
  const tripPromotions = await tripPromotionSeeder(count)
  console.log('seeding admins')
  if (!ctx.add) {
    await adminSeeder({ phoneNumber: '09119948768', type: 'SUPER-ADMIN' })
    await adminSeeder({ email: 'info.sparkapps@gmail.com', type: 'SUPER-ADMIN' })
    await adminSeeder({ phoneNumber: '09124129627', type: 'SUPER-ADMIN' })
  }
  const admins = await adminSeeder(count)

  // shopReadyComments
  console.log('seeding shop ready comments')
  await shopReadyCommentSeeder(count)

  console.log('seeding driver ready comments')
  const availableDriverReadyComments = [
    { type: 'How professional was your driver?' },
    { type: 'How was your driver vehicle?' },
    { type: 'How was your driver behavior?' },
    { type: 'How timely was your driver?' },
    { type: 'How accurate your driver was in driving?' },
    { type: 'Write your comment about driver here' }
  ]

  for (let i = 0; i < availableDriverReadyComments.length; i += 1) {
    DriverReadyComment.create(availableDriverReadyComments[i])
  }
  console.log('seeding passenger ready comments')
  const availablePassengerReadyComments = [
    { type: 'How polite was your passenger?' },
    { type: 'How professional was your passenger?' },
    { type: 'How was your passenger behavior?' },
    { type: 'How timely was your passenger?' },
    { type: 'How was your passenger social etiquette?' },
    { type: 'Write your comment about passenger here' }
  ]

  for (let i = 0; i < availablePassengerReadyComments.length; i += 1) {
    PassengerReadyComment.create(availablePassengerReadyComments[i])
  }
  console.log('seeding ready messages')
  const availableReadyMessage = [
    { message: [{ lang: 'en', value: 'I am coming' }], order: 1, type: 'TAXI' },
    { message: [{ lang: 'en', value: 'I will be there in a minute' }], order: 2, type: 'TAXI' },
    { message: [{ lang: 'en', value: 'I will be there in five minutes' }], order: 3, type: 'TAXI' },
    {
      message: [{ lang: 'en', value: 'I will be there in ten minutes' }],
      order: 4,
      type: 'TAXI'
    },
    {
      message: [{ lang: 'en', value: 'Please wait for me' }],
      order: 5,
      type: 'TAXI'
    },
    { message: [{ lang: 'en', value: 'I am coming' }], order: 6, type: 'DELIVERY' },
    { message: [{ lang: 'en', value: 'I will be there in a minute' }], order: 7, type: 'DELIVERY' },
    {
      message: [{ lang: 'en', value: 'I will be there in five minutes' }],
      order: 8,
      type: 'DELIVERY'
    },
    {
      message: [{ lang: 'en', value: 'I will be there in ten minutes' }],
      order: 9,
      type: 'DELIVERY'
    },
    {
      message: [{ lang: 'en', value: 'Please wait for me' }],
      order: 10,
      type: 'DELIVERY'
    }
  ]
  for (let i = 0; i < availableReadyMessage.length; i += 1) {
    ReadyMessage.create(availableReadyMessage[i])
  }

  // shopReceipts
  console.log('seeding shop receipts')
  for (let i = 0; i < count; i += 1) {
    await shopReceiptSeeder({ user: users[i] })
  }
  console.log('seeding advertisements')
  const availableAdvertisements = {
    'Taxi Promotion': {
      description: [
        {
          lang: 'en',
          value: 'up to 20% off'
        }
      ]
    },
    'Delivery Promotion': {
      description: [
        {
          lang: 'en',
          value: 'up to 30% off'
        }
      ]
    },
    'Food Promotion': {
      description: [
        {
          lang: 'en',
          value: 'up to 40% off'
        }
      ]
    },
    'Grocery Promotion': {
      description: [
        {
          lang: 'en',
          value: 'up to 50% off'
        }
      ]
    },
    'Weekend Promotion': {
      description: [
        {
          lang: 'en',
          value: 'up to 60% off'
        }
      ]
    }
  }

  let advertisements: any[] = []
  for (const advertisement in availableAdvertisements) {
    advertisements = advertisements.concat(
      await advertisementSeeder({
        title: [
          {
            lang: 'en',
            value: advertisement
          }
        ],
        ...availableAdvertisements[advertisement]
      })
    )
  }
  console.log('seeding notifications')
  await notificationSeeder(count)

  console.log('seeding trips')
  const trips: any[] = []
  for (let i = 0; i < count; i += 1) {
    const promotion = faker.random.arrayElement(tripPromotions)
    const car = faker.random.arrayElement(cars)
    const passenger = users[i]
    // eslint-disable-next-line no-await-in-loop
    const [trip] = await tripSeeder({
      driver: faker.random.arrayElement(drivers),
      passenger,
      car,
      promotion,
      ended: false,
      discount: null,
      payment: null
    })
    // eslint-disable-next-line no-await-in-loop
    await tripPromotionUsedSeeder({
      user: passenger,
      usedFor: trip,
      promotion
    })
    trips.push(trip)
  }

  // history trips : trips are ended
  for (let i = 0; i < count; i += 1) {
    const promotion = faker.random.arrayElement(tripPromotions)
    const car = faker.random.arrayElement(cars)
    const passenger = users[i]
    // eslint-disable-next-line no-await-in-loop
    const [trip] = await tripSeeder({
      driver: faker.random.arrayElement(drivers),
      passenger,
      car,
      promotion,
      ended: true,
      discount: null,
      payment: null
    })
    await tripOrderSeeder({
      user: passenger,
      trip,
      promotion
    })
    // eslint-disable-next-line no-await-in-loop
    await tripPromotionUsedSeeder({
      user: passenger,
      usedFor: trip,
      promotion
    })
    trips.push(trip)
  }

  console.log('seed canceled trip reason')
  const canceledTripReason = [
    {
      by: 'DRIVER',
      when: 'DURING_TRIP',
      title: [
        {
          lang: 'en',
          value: 'i had an accident'
        }
      ],
      type: 'DELIVERY'
    },
    {
      by: 'DRIVER',
      when: 'DURING_TRIP',
      title: [
        {
          lang: 'en',
          value: 'i had an accident'
        }
      ],
      type: 'RIDE'
    },
    {
      by: 'DRIVER',
      when: 'DURING_TRIP',
      title: [
        {
          lang: 'en',
          value: 'reserved'
        }
      ],
      type: 'RIDE'
    },
    {
      by: 'DRIVER',
      when: 'DURING_TRIP',
      title: [
        {
          lang: 'en',
          value: 'reserved'
        }
      ],
      type: 'DELIVERY'
    },
    {
      by: 'DRIVER',
      when: 'BEFORE_PICK_UP',
      title: [
        {
          lang: 'en',
          value: 'passenger did not Come'
        }
      ],
      type: 'RIDE'
    },
    {
      by: 'DRIVER',
      when: 'DURING_TRIP',
      title: [
        {
          lang: 'en',
          value: 'my car has a Malfunction'
        }
      ],
      type: 'DELIVERY'
    },
    {
      by: 'DRIVER',
      when: 'BEFORE_PICK_UP',
      title: [
        {
          lang: 'en',
          value: 'the Address is wrong'
        }
      ],
      type: 'DELIVERY'
    },
    {
      by: 'DRIVER',
      when: 'BEFORE_PICK_UP',
      title: [
        {
          lang: 'en',
          value: 'the Address is wrong'
        }
      ],
      type: 'RIDE'
    },
    {
      by: 'DRIVER',
      when: 'BEFORE_PICK_UP',
      title: [
        {
          lang: 'en',
          value: 'Passengers are too Many'
        }
      ],
      type: 'RIDE'
    },
    {
      by: 'DRIVER',
      when: 'BEFORE_PICK_UP',
      title: [
        {
          lang: 'en',
          value: 'cant find passenger'
        }
      ],
      type: 'RIDE'
    },
    {
      by: 'DRIVER',
      when: 'BEFORE_PICK_UP',
      title: [
        {
          lang: 'en',
          value: 'parcels are too heavy'
        }
      ],
      type: 'DELIVERY'
    },
    {
      by: 'DRIVER',
      when: 'BEFORE_PICK_UP',
      title: [
        {
          lang: 'en',
          value: 'parcels are different'
        }
      ],
      type: 'DELIVERY'
    },
    {
      by: 'DRIVER',
      when: 'BEFORE_PICK_UP',
      title: [
        {
          lang: 'en',
          value: 'Passenger is in unNormal State'
        }
      ],
      type: 'DELIVERY'
    },
    {
      by: 'DRIVER',
      when: 'BEFORE_PICK_UP',
      title: [
        {
          lang: 'en',
          value: 'Passenger is in unNormal State'
        }
      ],
      type: 'RIDE'
    },
    {
      by: 'DRIVER',
      when: 'DURING_TRIP',
      title: [
        {
          lang: 'en',
          value: 'my car was damaged'
        }
      ],
      type: 'RIDE'
    },
    {
      by: 'DRIVER',
      when: 'DURING_TRIP',
      title: [
        {
          lang: 'en',
          value: 'my car was damaged'
        }
      ],
      type: 'DELIVERY'
    },
    {
      by: 'PASSENGER',
      when: 'BEFORE_PICK_UP',
      title: [
        {
          lang: 'en',
          value: 'drivers picture Does not Mach'
        }
      ],
      type: 'DELIVERY'
    },
    {
      by: 'PASSENGER',
      when: 'BEFORE_PICK_UP',
      title: [
        {
          lang: 'en',
          value: 'its a different Car'
        }
      ],
      type: 'RIDE'
    },
    {
      by: 'PASSENGER',
      when: 'BEFORE_PICK_UP',
      title: [
        {
          lang: 'en',
          value: 'car has a different CarId'
        }
      ],
      type: 'DELIVERY'
    },
    {
      by: 'PASSENGER',
      when: 'BEFORE_PICK_UP',
      title: [
        {
          lang: 'en',
          value: 'driver has an unNormal state'
        }
      ],
      type: 'RIDE'
    },
    {
      by: 'PASSENGER',
      when: 'BEFORE_PICK_UP',
      title: [
        {
          lang: 'en',
          value: 'driver has an unNormal state'
        }
      ],
      type: 'DELIVERY'
    },
    {
      by: 'PASSENGER',
      when: 'DURING_TRIP',
      title: [
        {
          lang: 'en',
          value: 'driver has an unNormal state'
        }
      ],
      type: 'RIDE'
    },
    {
      by: 'PASSENGER',
      when: 'DURING_TRIP',
      title: [
        {
          lang: 'en',
          value: 'driver has an unNormal state'
        }
      ],
      type: 'DELIVERY'
    },
    {
      by: 'PASSENGER',
      when: 'DURING_TRIP',
      title: [
        {
          lang: 'en',
          value: 'has an accident'
        }
      ],
      type: 'RIDE'
    },
    {
      by: 'PASSENGER',
      when: 'DURING_TRIP',
      title: [
        {
          lang: 'en',
          value: 'has an accident'
        }
      ],
      type: 'DELIVERY'
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
      typeOfAttribute: 'BOOLEAN'
    },
    {
      attribute: 'TRIP_PAYMENT_CREDIT',
      value: true,
      typeOfAttribute: 'BOOLEAN'
    },
    {
      attribute: 'TRIP_BASE_FARE',
      value: 20,
      typeOfAttribute: 'NUMBER'
    },
    {
      attribute: 'TRIP_HST',
      value: 13,
      typeOfAttribute: 'PERCENTAGE'
    },
    {
      attribute: 'TRIP_COMMISSION',
      value: 20,
      typeOfAttribute: 'PERCENTAGE'
    },
    {
      attribute: 'TRIP_BOOKING_FEE',
      value: 25,
      typeOfAttribute: 'NUMBER'
    },
    {
      attribute: 'TRIP_WITH_INFANT',
      value: 20,
      typeOfAttribute: 'PERCENTAGE'
    },
    {
      attribute: 'TRIP_BAGS_WITH_ME',
      value: 1,
      typeOfAttribute: 'NUMBER'
    },
    {
      attribute: 'TRIP_PET_WITH_CARRIER',
      value: 30,
      typeOfAttribute: 'NUMBER'
    },
    {
      attribute: 'TRIP_PET_WITHOUT_CARRIER',
      value: 4,
      typeOfAttribute: 'NUMBER'
    },
    {
      attribute: 'TRIP_DRIVER_ASSISTANT',
      value: 3,
      typeOfAttribute: 'NUMBER'
    },
    {
      attribute: 'TRIP_WELCOME_SIGN',
      value: 2,
      typeOfAttribute: 'NUMBER'
    },
    {
      attribute: 'TRIP_ARRIVAL_AT_THE_AIRPORT',
      value: 5,
      typeOfAttribute: 'NUMBER'
    },
    {
      attribute: 'TRIP_AIR_CONDITIONER',
      value: 5,
      typeOfAttribute: 'NUMBER'
    },
    {
      attribute: 'DOOR_TO_DOOR_IN_BUILDING',
      value: 5,
      typeOfAttribute: 'NUMBER'
    },
    {
      attribute: 'ACCOMPANY_PARCEL',
      value: 5,
      typeOfAttribute: 'NUMBER'
    },
    {
      attribute: 'PARCEL_PACKED',
      value: 5,
      typeOfAttribute: 'NUMBER'
    },
    {
      attribute: 'WAIT_TIMES_IN_MINUTES',
      value: 5,
      typeOfAttribute: 'NUMBER'
    },
    {
      attribute: 'TRIP_COEFFICIENT',
      value: 10,
      typeOfAttribute: 'NUMBER'
    },
    {
      attribute: 'FIND_DRIVER_RADIUS',
      value: 50000,
      typeOfAttribute: 'NUMBER'
    },
    {
      attribute: 'MAX_RADIUS_COEFFICIENT',
      value: 3,
      typeOfAttribute: 'NUMBER'
    },
    {
      attribute: 'ACCEPT_TRIP_TIMEOUT_SECONDS',
      value: 300,
      typeOfAttribute: 'NUMBER'
    },
    {
      attribute: 'SHOP_COMMISSION',
      value: 20,
      typeOfAttribute: 'PERCENTAGE'
    },
    {
      attribute: 'SHOP_HST',
      value: 13,
      typeOfAttribute: 'PERCENTAGE'
    },
    {
      attribute: 'SHOP_MAXIMUM_DISTANCE',
      value: 10000,
      typeOfAttribute: 'NUMBER'
    },
    {
      attribute: 'ONLINE_CARS_AROUND_RADIUS',
      value: 50000,
      typeOfAttribute: 'NUMBER'
    },
    {
      attribute: 'ORDER_BASE_PREPARE_TIME',
      value: 20,
      typeOfAttribute: 'NUMBER'
    },
    {
      attribute: 'MAX_SHOP_SEARCH_ZONE',
      value: 60,
      typeOfAttribute: 'NUMBER'
    }
  ]

  for (let i = 0; i < constantKeys.length; i += 1) {
    Constant.create(constantKeys[i])
  }

  // cancelReservationConstants seed

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

  for (let i = 0; i < cancelReservationConstantKeys.length; i += 1) {
    CancelReservationConstant.create(cancelReservationConstantKeys[i])
  }

  // seed categories
  console.log('seeding categories')

  let rootCategories: any[] = []
  rootCategories = rootCategories.concat(
    await categorySeeder({
      parent: null,
      title: [
        {
          lang: 'en',
          value: 'Restaurant'
        }
      ],
      photoUrl: null
    })
  )

  rootCategories = rootCategories.concat(
    await categorySeeder({
      parent: null,
      title: [
        {
          lang: 'en',
          value: 'Grocery'
        }
      ],
      photoUrl: null
    })
  )

  const categories: any[] = await categorySeeder(
    {
      parent: faker.random.arrayElement(rootCategories),
      title: [
        {
          lang: 'en',
          value: 'Fastfood'
        }
      ]
    },
    5
  )

  // seed attributeGroups
  console.log('seeding attributeGroups')
  let attributeGroups: any[] = []
  attributeGroups = attributeGroups.concat(
    await attributeGroupSeeder({
      category: faker.random.arrayElement(rootCategories),
      name: 'Country'
    })
  )
  attributeGroups = attributeGroups.concat(
    await attributeGroupSeeder({
      category: faker.random.arrayElement(rootCategories),
      name: 'Food type'
    })
  )
  attributeGroups = attributeGroups.concat(
    await attributeGroupSeeder({
      category: faker.random.arrayElement(rootCategories),
      name: 'Allergy proof'
    })
  )

  // seed attributes
  console.log('seeding attributes')
  let attributes: any[] = []
  attributes = attributes.concat(
    await attributeSeeder({
      attributeGroup: faker.random.arrayElement(attributeGroups),
      name: 'Italian',
      photoUrl: faker.image.imageUrl()
    })
  )
  attributes = attributes.concat(
    await attributeSeeder({
      attributeGroup: faker.random.arrayElement(attributeGroups),
      name: 'Halal',
      photoUrl: faker.image.imageUrl()
    })
  )
  attributes = attributes.concat(
    await attributeSeeder({
      attributeGroup: faker.random.arrayElement(attributeGroups),
      name: 'Seafood',
      photoUrl: faker.image.imageUrl()
    })
  )

  // seed products
  console.log('seeding products')
  let products: any[] = []
  for (let i = 0; i < count; i++) {
    const attribute = faker.random.arrayElement(attributes)
    const { category } = attributeGroups.find(item => item._id === attribute.attributeGroup._id)
    const price = faker.random.number({ min: 1, max: 2000 })
    const percent = faker.random.number({ min: 1, max: 99 })
    const percentagedPrice = Number((Number(price) * Number(percent)) / 100)
    const afterDiscountPrice = Number(Number(price) - Number(percentagedPrice)).toFixed(2)
    products = products.concat(
      await productSeeder({
        category,
        attribute,
        afterDiscountPrice,
        price,
        percent,
        title: [
          {
            lang: 'en',
            value: 'Fastfood'
          }
        ],
        description: [
          {
            lang: 'en',
            value: 'Perspiciatis qui.'
          }
        ]
      })
    )
  }

  // seed shopMenu
  console.log('seeding shopMenues')
  let subMenus: any[] = []
  for (let i = 0; i < count; i++) {
    const product = products[i]
    subMenus = subMenus.concat(
      await shopMenuSeeder({
        product,
        name: [
          {
            lang: 'en',
            value: 'animi'
          }
        ]
      })
    )
  }
  // seed shops
  console.log('seeding shops')
  let shops: any[] = []
  for (let i = 0; i < count; i++) {
    const shopMenu = subMenus[i]
    const category = faker.random.arrayElement(categories)
    const attribute = faker.random.arrayElement(attributes)
    const product = products[i]
    const admin: any = faker.random.arrayElement(admins)
    shops = shops.concat(
      await shopSeeder({
        shopMenu,
        category,
        attribute,
        admin,
        product
      })
    )

    const lastShop = shops[shops.length - 1]
    // update product's shop
    Product.updateOne({ _id: product._id }, { shop: lastShop._id }).exec()

    // update admin's shop
    Admin.updateOne({ _id: admin._id }, { shop: lastShop._id }).exec()

    // update shop menu'ss shop
    ShopMenu.updateOne({ _id: shopMenu._id }, { shop: lastShop._id })
  }

  console.log('seeding transactions')
  let transactions: any[] = []
  for (let i = 0; i < count; i++) {
    const type = faker.random.arrayElement([
      'PAY_FROM_USER_TO_SHOP',
      'PAY_FROM_USER_TO_DRIVER',
      'PAY_FROM_SHOP_TO_DRIVER',
      'PAY_FROM_USER_TO_BEDO',
      'PAY_FROM_SHOP_TO_BEDO',
      'PAY_FROM_DRIVER_TO_BEDO',
      'PAY_FROM_BEDO_TO_SHOP',
      'PAY_FROM_BEDO_TO_DRIVER',
      'PAY_FROM_BEDO_TO_USER'
    ])
    const amount = faker.random.number({ min: 10, max: 200000 })
    const transactionMethod = faker.random.arrayElement(['ONLINE', 'CASH'])
    const shop = shops[i]._id
    transactions = transactions.concat(
      await transactionSeeder({
        type,
        amount,
        transactionMethod,
        shop
      })
    )
  }

  console.log('seeding payments')
  let payments: any[] = []
  for (let i = 0; i < count; i++) {
    const type = faker.random.arrayElement([
      'PAY_FROM_USER_TO_SHOP',
      'PAY_FROM_USER_TO_DRIVER',
      'PAY_FROM_SHOP_TO_DRIVER',
      'PAY_FROM_USER_TO_BEDO',
      'PAY_FROM_SHOP_TO_BEDO',
      'PAY_FROM_DRIVER_TO_BEDO',
      'PAY_FROM_BEDO_TO_SHOP',
      'PAY_FROM_BEDO_TO_DRIVER',
      'PAY_FROM_BEDO_TO_USER'
    ])
    const amount = faker.random.number({ min: 10, max: 200000 })
    const shop = shops[i]._id
    payments = payments.concat(
      await paymentSeeder({
        type,
        amount,
        shop
      })
    )
  }

  console.log(green('models are seeded'))
}
