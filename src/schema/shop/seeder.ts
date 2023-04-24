import faker from 'faker'
import Model from './schema'
import seederMaker from '../../utils/seederMaker'

const getSeedData = async (custom: any = {}): Promise<Object> => {
  const { admin, attribute, category, shopMenu } = custom
  return {
    shopAdmin: admin._id,
    name: faker.lorem.words(1),
    budget: faker.random.arrayElement(['B', 'BB', 'BBB']),
    acceptCash: faker.random.boolean(),
    address: faker.address.streetAddress(),
    origin: faker.lorem.word(),
    active: faker.random.arrayElement([true, false]),
    phoneNumbers: [
      `0935${String(faker.random.number({ min: 1000000, max: 9999999 }))}`,
      `0936${String(faker.random.number({ min: 1000000, max: 9999999 }))}`,
      `0937${String(faker.random.number({ min: 1000000, max: 9999999 }))}`
    ],
    location: {
      type: 'Point',
      coordinates: [51.353003, 35.705925]
    },
    description: faker.lorem.sentence(3),
    workingHoursInMinutes: [
      {
        type: 'SAT',
        from: 600,
        to: 1320
      },
      {
        type: 'MON',
        from: 600,
        to: 1320
      },
      {
        type: 'TUE',
        from: 540,
        to: 1320
      },
      {
        type: 'WEN',
        from: 540,
        to: 1260
      },
      {
        type: 'THU',
        from: 540,
        to: 1260
      },
      {
        type: 'FRI',
        from: 540,
        to: 1260
      }
    ],
    notWorkingDays: [
      {
        type: 'SUN'
      }
    ],
    averageRate: faker.random.number({ min: 1, max: 5 }),
    numberOfRates: faker.random.number({ min: 1, max: 25 }),
    preparingTime: faker.random.number({ min: 1, max: 60 }),
    sumOfRates: faker.random.number({ min: 1, max: 100 }),
    bannerUrl: faker.image.imageUrl(),
    logoUrl: faker.image.imageUrl(),
    rootCategory: category.parent,
    categories: [category._id],
    attributes: [attribute._id],
    shopMenu: shopMenu._id
  }
}

export default seederMaker(Model, getSeedData)
