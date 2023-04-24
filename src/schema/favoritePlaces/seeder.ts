import faker from 'faker'
import Model from './schema'
import seederMaker from '../../utils/seederMaker'
import userSeeder from '../user/seeder'

const getSeedData = async (custom: any = {}): Promise<Object> => {
  let { user } = custom
  if (!user) {
    const [seededUser] = await userSeeder()
    user = seededUser
  }

  return {
    user: user._id,
    favorites: [
      {
        type: 'Point',
        title: 'home',
        address: faker.address.city(),
        coordinates: [faker.finance.amount(1, 100, 5), faker.finance.amount(1, 100, 5)]
      },
      {
        type: 'Point',
        title: 'office',
        address: faker.address.city(),
        coordinates: [faker.finance.amount(1, 100, 5), faker.finance.amount(1, 100, 5)]
      }
    ]
  }
}

export default seederMaker(Model, getSeedData)
