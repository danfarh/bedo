import faker from 'faker'
import moment from 'moment'
import Model from './schema'
import seederMaker from '../../utils/seederMaker'

const getSeedData = async (custom: any = {}): Promise<Object> => {
  const { cart, user, promotion, shop } = custom

  return {
    cart: cart._id,
    user,
    shop: shop._id,
    promotion: promotion._id,
    address: faker.address.streetAddress(true),
    shipmentModel: faker.random.arrayElement(['SHOP', 'BEDO']),
    type: faker.random.arrayElement(['RESERVE', 'ORDER']),
    commission: 20,
    commissionPercent: 0.2,
    HST: 10,
    HSTPercent: 0.1,
    status: faker.random.arrayElement([
      'ACCEPTED',
      'SHIPPING',
      'DELIVERED',
      'REJECTED',
      'DELIVERY_NOT_ACCEPTED'
    ]),
    rejectedFor: faker.random.arrayElement([
      'packingDamaged',
      'damagedForPacking',
      'differentProduct',
      'noReceiver'
    ]),
    createdAt: new Date(),
    paidAt: moment()
      .add(5, 'm')
      .toDate(),
    shipmentAt: moment()
      .add(2, 'd')
      .toDate(),
    tracking: {
      trackId: Math.random()
        .toString(36)
        .slice(-10),
      estimatedDelivery: moment()
        .add(2, 'h')
        .toDate()
    },
    finished: faker.random.arrayElement([true, false]),
    commented: faker.random.arrayElement(['NOT_COMMENTED', 'COMMENTED', 'SKIPPED']),
    productsPrice: faker.finance.amount(1, 100, 2),
    priceAfterDiscount: faker.finance.amount(1, 100, 2),
    delivery: faker.finance.amount(1, 100, 2),
    subtotal: faker.finance.amount(1, 100, 2),
    total: faker.finance.amount(1, 100, 2),
    shopIncome: faker.finance.amount(1, 100, 2),
    finalPrice: faker.finance.amount(1, 100, 2),
    discount: faker.finance.amount(1, 100, 2),
    priceAfterPromotionDiscount: faker.finance.amount(1, 100, 2),
    promotionDiscount: faker.finance.amount(1, 100, 2),
    shopInvoice: faker.finance.amount(1, 100, 2),
    sparkShare: faker.finance.amount(1, 100, 2),
    shopShare: faker.finance.amount(1, 100, 2),
    deliveryWithoutPromotion: faker.finance.amount(1, 100, 2),
    deliveryPromotionDiscount: faker.finance.amount(1, 100, 2)
  }
}

export default seederMaker(Model, getSeedData)
