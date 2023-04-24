import faker from 'faker'
import Model from './schema'
import seederMaker from '../../utils/seederMaker'

const getSeedData = async (custom: any = {}): Promise<Object> => {
  const { rootCategory, user, shop, product } = custom

  return {
    user: user._id,
    currency: 'USD',
    productsPrice: faker.random.number({ min: 50, max: 100 }),
    shipmentCost: faker.random.number({ min: 2, max: 10 }),
    finalPrice: faker.random.number({ min: 52, max: 102 }),
    discount: faker.random.number({ min: 52, max: 102 }),
    afterDiscountPrice: faker.random.number({ min: 52, max: 102 }),
    rootCategory: rootCategory._id,
    shop: shop._id,
    products: [
      {
        product: product._id,
        quantity: faker.random.number({ min: 1, max: 5 })
      }
    ]
  }
}

export default seederMaker(Model, getSeedData)
