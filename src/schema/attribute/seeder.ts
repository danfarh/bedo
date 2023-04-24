import faker from 'faker'
import Model from './schema'
import seederMaker from '../../utils/seederMaker'

const getSeedData = async (custom: any = {}): Promise<Object> => {
  const { attributeGroup, name } = custom
  return {
    attributeGroup: attributeGroup ? attributeGroup._id : null,
    name
  }
}

export default seederMaker(Model, getSeedData)
