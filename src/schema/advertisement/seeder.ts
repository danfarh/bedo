import faker from 'faker'
import Model from './schema'
import seederMaker from '../../utils/seederMaker'

const getSeedData = async (): Promise<Object> => {
  return {
    description: faker.lorem.sentence(10),
    title: faker.lorem.words(3),
    photoUrl: faker.image.imageUrl(),
    admin: null,
    redirectTo: faker.lorem.words(7),
    startAt: new Date(),
    endAt: new Date()
  }
}

export default seederMaker(Model, getSeedData)
