import faker from 'faker'
import Model from './schema'
import seederMaker from '../../utils/seederMaker'

const getSeedData = async (custom: any = {}): Promise<Object> => {
  const { readyCommentsArray, order, user, shop } = custom

  return {
    userComment: faker.lorem.sentence(20),
    readyComments: readyCommentsArray.map(c => {
      return {
        rate: faker.random.number({ min: 1, max: 5 }),
        readyComment: c._id
      }
    }),
    order,
    user,
    shop
  }
}

export default seederMaker(Model, getSeedData)
