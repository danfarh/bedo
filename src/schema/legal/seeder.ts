import faker from 'faker'
import Model from './schema'
import seederMaker from '../../utils/seederMaker'
import { LANGUAGES_OF_APP } from '../../config'

const getSeedData = async (): Promise<Object> => {
  return {
    title: faker.random.arrayElement([
      'copy right',
      'terms & conditions',
      'privacy policy',
      'data providers',
      'software licence',
      'location information'
    ]),
    description:
      // LANGUAGES_OF_APP.map(lang =>({lang,value: faker.lorem.words(25)}))
      [
        { lang: LANGUAGES_OF_APP[0], value: faker.lorem.words(25) },
        { lang: LANGUAGES_OF_APP[1], value: faker.lorem.words(25) },
        { lang: LANGUAGES_OF_APP[2], value: faker.lorem.words(25) }
      ],
    admin: null
  }
}

export default seederMaker(Model, getSeedData)
