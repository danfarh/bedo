import faker from 'faker'
import Model from './schema'
import seederMaker from '../../utils/seederMaker'

const getSeedData = async (): Promise<Object> => {
  return {
    condition: faker.random.arrayElement(['TIMELY', 'FIRST_TRIP']),
    type: faker.random.arrayElement(['FIXED', 'PERCENT']),
    from: faker.date.past(),
    to: faker.date.future(),
    useLimitCount: faker.random.number({ min: 1, max: 45 }),
    percent: faker.random.number({ min: 1, max: 99 }),
    maximumDiscount: faker.random.number({ min: 5, max: 100 }),
    promotionCode: faker.random.uuid()
  }
}

export default seederMaker(Model, getSeedData)
