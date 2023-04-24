import faker from 'faker'
import Model from './schema'
import seederMaker from '../../utils/seederMaker'

const getSeedData = async (custom: any = {}): Promise<Object> => {
  const { parent } = custom

  return {
    parent: parent ? parent._id : null,
    title: faker.random.arrayElement(['Seafood', 'Fastfood', 'Desert', 'Breakfast', 'Appetizer']),
    photoUrl: faker.image.imageUrl()
  }
}

export default seederMaker(Model, getSeedData)
