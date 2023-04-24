import faker from 'faker'
import Model from './schema'
import seederMaker from '../../utils/seederMaker'

const getSeedData = async (): Promise<Object> => {
  return {
    type: faker.random.arrayElement([
      'COMPACT',
      'INTERMEDIATE',
      'FULL_SIZE',
      'PREMIUM',
      'BIKE',
      'MOTORCYCLE',
      'TRUCK',
      'TRAILER'
    ]),
    alias: faker.random.arrayElement([
      'COMPACT',
      'INTERMEDIATE',
      'FULL_SIZE',
      'PREMIUM',
      'BIKE',
      'MOTORCYCLE',
      'TRUCK',
      'TRAILER'
    ]),
    maximumPassengersCount: faker.random.number({ min: 2, max: 6 }),
    maximumWeight: faker.random.number({ min: 100, max: 1000 }),
    logoUrl: faker.image.imageUrl(),
    description: faker.lorem.text()
  }
}

export default seederMaker(Model, getSeedData)
