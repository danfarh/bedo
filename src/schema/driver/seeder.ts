import faker from 'faker'
import bcrypt from 'bcryptjs'
import Model from './schema'
import seederMaker from '../../utils/seederMaker'
import encrypt from '../../utils/encrypt'
import { HASH_SALT, PHONE_VERIFICATION_MAX_VALUE } from '../../config'
import mongoose from 'mongoose'

const getSeedData = async (custom: any = {}): Promise<Object> => {
  return {
    fullName: faker.name.findName(),
    car: [],
    drivingLicence: {
      licenceId: faker.random.uuid(),
      photoUrl: faker.image.imageUrl(),
      expireDate: faker.date.future()
    },
    averageRate: faker.random.number({ min: 1, max: 5 }),
    sumRate: faker.random.number({ min: 5, max: 200 }),
    numberOfRates: faker.random.number({ min: 40, max: 50 }),
    commentsList: null,
    // USER
    hasNotification: false,
    email: faker.internet.email(),
    phoneNumber: `0912${String(faker.random.number({ min: 1000000, max: 9999999 }))}`,
    passwordHash: await bcrypt.hash('secret', HASH_SALT),
    birthDate: faker.date.past(),
    profileImageUrl: faker.image.imageUrl(),
    state: 'ACTIVE',
    gender: faker.random.arrayElement(['MALE', 'FEMALE']),
    isVerified: faker.random.boolean(),
    emailVerified: faker.random.boolean(),
    phoneNumberVerified: faker.random.boolean(),
    phoneNumberVerification: {
      tries: faker.random.number({ min: 0, max: Number(PHONE_VERIFICATION_MAX_VALUE) - 1 }),
      sentTime: null
    },
    creditCardData: [
      {
        accountOwnerName: faker.name.findName(),
        accountNumber: faker.random.number({ min: 1111111111, max: 999999999999 }),
        instituteNumber: faker.random.number({ min: 1111111111, max: 999999999999 }),
        transitNumber: faker.random.number({ min: 1111111111, max: 999999999999 }),
        PaypalEmail: faker.internet.email()
      }
    ],
    address: {
      full: faker.address.streetAddress(),
      zip: Number(faker.address.zipCode().replace('-', ''))
    },
    verificationRequests: [
      {
        status: faker.random.arrayElement(['APPROVED', 'REJECTED', 'PENDING']),
        submitDate: faker.date.past(),
        verificationDetails: {
          gender: faker.random.arrayElement(['MALE', 'FEMALE']),
          birthDate: faker.date.past(),
          address: {
            full: faker.address.streetAddress(),
            zip: Number(faker.address.zipCode().replace('-', ''))
          },
          profileImageUrl: faker.image.imageUrl(),
          drivingRecordPhotoUrl: faker.image.imageUrl(),
          canadianVerificationPhotoUrl: faker.image.imageUrl(),
          canadianVerificationExpireDate: faker.date.future(),
          drivingLicence: {
            licenceId: faker.random.uuid(),
            photoUrl: faker.image.imageUrl(),
            expireDate: faker.date.future()
          },
          backgroundCheckDocumentPhotoUrl: faker.image.imageUrl()
        },
        responseDate: faker.date.past(),
        rejectionMessage: faker.lorem.text()
      }
    ]
  }
}

export default seederMaker(Model, getSeedData)
