import faker from 'faker'
import Model from './schema'
import seederMaker from '../../utils/seederMaker'
import { Types } from 'mongoose'

const getSeedData = async (custom: any = {}): Promise<Object> => {
  return {
    user: null,
    driver: null,
    payments: null,
    shop: '607db7c3621976d6e18c5c17',
    paymentIntent: faker.lorem.words(5),
    refundId: faker.lorem.words(10),
    transactionId: faker.lorem.words(15),
    reversalId: faker.lorem.words(15),
    reversed: faker.random.boolean(),
    status: faker.random.arrayElement(['UNPAID', 'PAID', 'FAILED']),
    paidAt: faker.date.past(2),
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
    amount: faker.random.number({ min: 100000, max: 9999999 }),
    transactionMethod: faker.random.arrayElement(['ONLINE', 'CASH'])
  }
}

export default seederMaker(Model, getSeedData)
