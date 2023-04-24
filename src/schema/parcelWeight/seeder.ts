import faker from 'faker'
import Model from './schema'
import seederMaker from '../../utils/seederMaker'

const getSeedData = async (): Promise<Object> => {
  return {
    name: faker.lorem.word(),
    value: faker.random.number({ min: 0, max: 20 }),
    typeOfAttribute: faker.random.arrayElement(['PERCENTAGE', 'NUMBER'])
  }
}

export default seederMaker(Model, getSeedData)
