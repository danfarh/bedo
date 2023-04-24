import faker from 'faker'
import moment from 'moment'
import Model from './schema'
import seederMaker from '../../utils/seederMaker'

const getSeedData = async (custom: any = {}): Promise<Object> => {
  const { attribute } = custom

  return {
    title: faker.lorem.word(),
    attributes: [
      {
        attributeGroup: attribute.attributeGroup,
        att: [attribute._id]
      }
    ],
    shop: null,
    price: faker.random.number({ min: 1, max: 2000 }),
    promotion: {
      percent: faker.random.number({ min: 1, max: 99 }),
      discountFrom: new Date(),
      discountTo: moment()
        .add(2, 'd')
        .toDate()
    },
    afterDiscountPrice: faker.random.number({ min: 1, max: 2000 }),
    description: faker.lorem.sentence(2),
    photoUrl: [faker.image.imageUrl(), faker.image.imageUrl()]
  }
}

export default seederMaker(Model, getSeedData)
