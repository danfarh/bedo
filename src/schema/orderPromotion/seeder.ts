import faker from 'faker'
import moment from 'moment'
import Model from './schema'
import seederMaker from '../../utils/seederMaker'

const getSeedData = async (custom: any = {}): Promise<Object> => {
  const { userCanUse, userCanNotUse } = custom

  return {
    condition: faker.random.arrayElement(['TIMELY', 'FIRST_ORDER', 'PERCENTAGE']),
    type: faker.random.arrayElement(['FIXED', 'PERCENT']),
    shop: null,
    useLimitCount: faker.random.number({ min: 1, max: 25 }),
    from: new Date(),
    to: moment()
      .add(7, 'd')
      .toDate(),
    percent: 0.2,
    maximumPromotion: 20,
    promotionCode: Math.random()
      .toString(36)
      .slice(-10)
  }
}

export default seederMaker(Model, getSeedData)
