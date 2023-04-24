import faker from 'faker'
import Model from './schema'
import seederMaker from '../../utils/seederMaker'

const getSeedData = async (custom: any = {}): Promise<Object> => {
  const { category } = custom

  return {
    rootCategory: category ? category._id : null,
    name: faker.random.arrayElement(['Country', 'Food type', 'Allergy proof'])
  }
}

export default seederMaker(Model, getSeedData)
