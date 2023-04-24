import bcrypt from 'bcryptjs'
import faker from 'faker'
import Model from './schema'
import seederMaker from '../../utils/seederMaker'
import { HASH_SALT } from '../../config'

const getSeedData = async (custom: any = {}): Promise<Object> => {
  const { type } = custom
  return {
    fullName: faker.name.findName(),
    phoneNumber: `0912${String(faker.random.number({ min: 1000000, max: 9999999 }))}`,
    email: faker.internet.email(),
    phoneNumberVerified: true,
    passwordHash: await bcrypt.hash(type === 'SHOP-ADMIN' ? 'secret100' : 'secret', HASH_SALT),
    type: faker.random.arrayElement(['SHOP-ADMIN', 'SUPER-ADMIN']),
    verificationState: faker.random.arrayElement(['VERIFIED', 'WAITING']),
    shop: null
  }
}

export default seederMaker(Model, getSeedData)
