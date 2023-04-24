import faker from 'faker'
import Model from './schema'
import seederMaker from '../../utils/seederMaker'

const getSeedData = async (): Promise<Object> => {
  return {
    name: faker.lorem.words(25),
    brand: null,
    admin: null
  }
}

export default seederMaker(Model, getSeedData)
