/* eslint-disable indent */
import faker from 'faker'
import Model from './schema'
import seederMaker from '../../utils/seederMaker'

const getSeedData = async (): Promise<Object> => {
  return {
    discount: faker.random.number({ min: 0, max: 10 }),
    commission: faker.random.number({ min: 0, max: 5 }),
    commissionPercent: faker.random.number({ min: 0, max: 10 }),
    HST: faker.random.number({ min: 0, max: 3 }),
    HSTPercent: faker.random.number({ min: 0, max: 3 }),
    paidAt: faker.date.past(),
    finished: faker.random.boolean(),
    commented: faker.random.arrayElement(['NOT_COMMENTED', 'COMMENTED', 'SKIPPED'])
  }
}

export default seederMaker(Model, getSeedData)
