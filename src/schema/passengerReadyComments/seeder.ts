import faker from 'faker'
import Model from './schema'
import seederMaker from '../../utils/seederMaker'
import { LANGUAGES_OF_APP } from '../../config'

const getSeedData = async (): Promise<Object> => {
  return {
    type: LANGUAGES_OF_APP.map(language => ({
      lang: language,
      value: faker.lorem.words(25)
    }))
  }
}

export default seederMaker(Model, getSeedData)
