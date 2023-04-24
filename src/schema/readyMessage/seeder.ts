import faker from 'faker'
import Model from './schema'
import seederMaker from '../../utils/seederMaker'

const getSeedData = async (): Promise<Object> => {
  return {
    message: faker.name.findName(),
    order: faker.random.number({ min: 1, max: 10 }),
    type: faker.random.arrayElement(['TAXI', 'DELIVERY'])
  }
}
export default seederMaker(Model, getSeedData)
