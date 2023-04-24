import faker from 'faker'
import bcrypt from 'bcryptjs'
import Model from './schema'
import seederMaker from '../../utils/seederMaker'
import { HASH_SALT, PHONE_VERIFICATION_MAX_VALUE } from '../../config'
import mongoose from 'mongoose'

const getSeedData = async (): Promise<Object> => {
  return {
    fullName: faker.name.findName(),
    email: faker.internet.email(),
    phoneNumber: `0912${String(faker.random.number({ min: 1000000, max: 9999999 }))}`,
    passwordHash: await bcrypt.hash('secret', HASH_SALT),
    birthDate: faker.date.past(),
    hasNotification: false,
    profileImageUrl: faker.image.imageUrl(),
    state: 'ACTIVE',
    averageRate: faker.random.number({ min: 1, max: 5 }),
    sumRate: faker.random.number({ min: 5, max: 200 }),
    numberOfRates: faker.random.number({ min: 40, max: 50 }),
    gender: faker.random.arrayElement(['MALE', 'FEMALE']),
    isVerified: faker.random.boolean(),
    emailVerified: faker.random.boolean(),
    phoneNumberVerified: faker.random.boolean(),
    lockTillDate: null,
    phoneNumberVerification: {
      tries: faker.random.number({ min: 0, max: Number(PHONE_VERIFICATION_MAX_VALUE) - 1 }),
      sentTime: null
    },
    creditCardData: [
      {
        id: mongoose.Types.ObjectId(),
        value: await bcrypt.hash(faker.lorem.text(), HASH_SALT)
      }
    ],
    address: {
      country: faker.address.country(),
      state: faker.address.state(),
      city: faker.address.city(),
      street: faker.address.streetAddress(),
      zip: Number(faker.address.zipCode().replace('-', ''))
    }
  }
}

export default seederMaker(Model, getSeedData)
