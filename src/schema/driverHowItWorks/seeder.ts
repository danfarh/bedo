import faker from 'faker'
import Model from './schema'
import seederMaker from '../../utils/seederMaker'
import { LANGUAGES_OF_APP } from '../../config'

const getSeedData = async (): Promise<Object> => {
  return {
    title: faker.random.arrayElement([
      'accept a trip ',
      'report a problem',
      'privacy policy',
      'customer service',
      'software licence',
      'payment issues'
    ]),
    description: LANGUAGES_OF_APP.map(language => ({
      lang: language,
      value: faker.lorem.words(25)
    })),
    admin: null
  }
}

export default seederMaker(Model, getSeedData)
