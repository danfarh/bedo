import faker from 'faker'
import Model from './schema'
import seederMaker from '../../utils/seederMaker'
import { LANGUAGES_OF_APP } from '../../config'

const getSeedData = async (custom: any = {}): Promise<Object> => {
  const { product } = custom
  return {
    subMenus: {
      name: LANGUAGES_OF_APP.map(language => {
        return {
          lang: language,
          value: faker.lorem.word()
        }
      }),
      products: [product._id]
    }
  }
}

export default seederMaker(Model, getSeedData)
