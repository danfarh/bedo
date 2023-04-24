import faker from 'faker'
import Model from './schema'
import seederMaker from '../../utils/seederMaker'

const getSeedData = async (): Promise<Object> => {
  return {
    name: faker.random.arrayElement([
      'COMPACT',
      'INTERMEDIATE',
      'FULL_SIZE',
      'PREMIUM',
      'BIKE_MOTORCYCLE',
      'CARS',
      'TRUCK_TRAILER'
    ]),
    logoUrl: [],
    increasePricePercent: faker.random.number({ min: 0, max: 100 }),
    maximumPassengersCount: faker.random.number({ min: 2, max: 6 }),
    maximumWeight: faker.random.number({ min: 100, max: 1000 }),
    tripType: faker.random.arrayElement(['DELIVERY', 'RIDE', 'DELIVERY_AND_RIDE']),
    description: faker.lorem.text()
  }
}

export default seederMaker(Model, getSeedData)
