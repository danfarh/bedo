import faker from 'faker'
import Model from './schema'
import seederMaker from '../../utils/seederMaker'
import { LANGUAGES_OF_APP } from '../../config'

const getSeedData = async (): Promise<Object> => {
  return {
    name: faker.random.arrayElement([
      'I_WANT_TO_REPORT_A_SERVICE_ANIMAL_ISSUE',
      'I_LOST_AN_ITEM',
      'I_WAS_INVOLVED_IN_AN_ACCIDENT',
      'LEARN_ABOUT_SPARK',
      'ACCOUNT_AND_PAYMENT',
      'RIDE_GUIDE',
      'FOOD_GUIDE',
      'GROCERY_SHOPPING_GUIDE',
      'DELIVERY_GUIDE',
      'MY_PARCEL_WAS_NOT_DELIVERED',
      ' MY_PARCEL_IS_MISSING_AN_ITEM',
      'MY_DELIVERY_HAS_BEEN_DELAYED',
      'DELIVERY_COSTED_MORE_THAN_ESTIMATED',
      'MY_PACKAGE_WAS_OPENED',
      'OTHER_ISSUES',
      'I_LOST_AN_ITEM_DELIVERY',
      'FOOD_MY_ORDER_COSTED_MORE_THAN_ESTIMATED',
      'FOOD_MY_ORDER_HAS_BEEN_DELAYED',
      'FOOD_MY_ORDER_WAS_DIFFERENT',
      'FOOD_OTHER_ISSUES',
      'GROCERY_MY_ORDER_COSTED_MORE_THAN_ESTIMATED',
      'GROCERY_MY_ORDER_HAS_BEEN_DELAYED',
      'GROCERY_MY_ORDER_WAS_DIFFERENT',
      'GROCERY_OTHER_ISSUES',
      'DRIVER_RIDE_HELP',
      'DRIVER_DELIVERY_HELP'
    ]),
    title: faker.random.arrayElement([
      'I_WANT_TO_REPORT_A_SERVICE_ANIMAL_ISSUE',
      'I_LOST_AN_ITEM',
      'I_WAS_INVOLVED_IN_AN_ACCIDENT',
      'ACCOUNT_AND_PAYMENT',
      'LEARN_ABOUT_SPARK',
      'RIDE_GUIDE',
      'FOOD_GUIDE',
      'GROCERY_SHOPPING_GUIDE',
      'DELIVERY_GUIDE',
      'MY_PARCEL_WAS_NOT_DELIVERED',
      'MY_PARCEL_IS_MISSING_AN_ITEM',
      'MY_DELIVERY_HAS_BEEN_DELAYED',
      'DELIVERY_COSTED_MORE_THAN_ESTIMATED',
      'MY_PACKAGE_WAS_OPENED',
      'OTHER_ISSUES',
      'I_LOST_AN_ITEM_DELIVERY',
      'FOOD_MY_ORDER_COSTED_MORE_THAN_ESTIMATED',
      'FOOD_MY_ORDER_HAS_BEEN_DELAYED',
      'FOOD_MY_ORDER_WAS_DIFFERENT',
      'FOOD_OTHER_ISSUES',
      'GROCERY_MY_ORDER_COSTED_MORE_THAN_ESTIMATED',
      'GROCERY_MY_ORDER_HAS_BEEN_DELAYED',
      'GROCERY_MY_ORDER_WAS_DIFFERENT',
      'GROCERY_OTHER_ISSUES',
      'DRIVER_RIDE_HELP',
      'DRIVER_DELIVERY_HELP'
    ]),
    description: LANGUAGES_OF_APP.map(language => ({
      lang: language,
      value: faker.lorem.words(25)
    })),
    type: faker.random.arrayElement([
      'TAXI',
      'DRIVER_RIDE',
      'DRIVER_DELIVERY',
      'DELIVERY',
      'FOOD',
      'GROCERY'
    ]),
    admin: null
  }
}

export default seederMaker(Model, getSeedData)
