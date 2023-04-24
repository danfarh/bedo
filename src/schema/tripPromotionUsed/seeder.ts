import faker from 'faker'
import Model from './schema'
import seederMaker from '../../utils/seederMaker'

const getSeedData = async (): Promise<Object> => {
  return {
    promotion: null,
    user: null,
    usedFor: null
  }
}

export default seederMaker(Model, getSeedData)
