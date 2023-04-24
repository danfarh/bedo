import faker from 'faker'
import Model from './schema'
import seederMaker from '../../utils/seederMaker'

const getSeedData = async (): Promise<Object> => {
  return {
    HST: faker.random.number({ min: 1, max: 2000 }),
    cart: faker.random.number({ min: 2000, max: 16000 }),
    discount: faker.random.number({ min: 1, max: 2000 }),
    delivery: faker.random.number({ min: 1, max: 2000 }),
    subTotal: faker.random.number({ min: 1, max: 18000 }),
    options: faker.random.number({ min: 1, max: 1000 }),
    total: faker.random.number({ min: 15000, max: 20000 }),
    user: null,
    order: null
  }
}

export default seederMaker(Model, getSeedData)
