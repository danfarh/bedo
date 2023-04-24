import faker from 'faker'
import Model from './schema'
import seederMaker from '../../utils/seederMaker'

const getSeedData = async (custom: any = {}): Promise<Object> => {
  return {
    user: null,
    driver: null,
    shop: '607db7c3621976d6e18c5c17',
    status: faker.random.arrayElement(['UNPAID', 'PAID', 'FAILED']),
    type: faker.random.arrayElement([
      'PAY_FROM_USER_TO_SHOP',
      'PAY_FROM_USER_TO_DRIVER',
      'PAY_FROM_SHOP_TO_DRIVER',
      'PAY_FROM_USER_TO_BEDO',
      'PAY_FROM_SHOP_TO_BEDO',
      'PAY_FROM_DRIVER_TO_BEDO',
      'PAY_FROM_BEDO_TO_SHOP',
      'PAY_FROM_BEDO_TO_DRIVER',
      'PAY_FROM_BEDO_TO_USER'
    ]),
    for: faker.random.arrayElement(['DELIVERY', 'RIDE', 'RESTAURANT', 'PURCHASE']),
    amount: faker.random.number({ min: 100000, max: 9999999 }),
    description: faker.lorem.words(25)
  }
}

export default seederMaker(Model, getSeedData)
