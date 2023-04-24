/* eslint-disable indent */
import faker from 'faker'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import Model from './schema'
import seederMaker from '../../utils/seederMaker'
import { HASH_SALT, PHONE_VERIFICATION_MAX_VALUE } from '../../config'

const getSeedData = async (): Promise<Object> => {
  return {
    tripType: faker.random.arrayElement(['DELIVERY', 'RIDE']),
    driver: null,
    passenger: null,
    discount: 0,
    payment: null,
    staticMapImageUrl: faker.image.imageUrl(),
    ended: Math.random() > 0.8,
    state: faker.random.arrayElement([
      'SEARCHING',
      'ACCEPTED',
      'DRIVER_CANCELED',
      'PASSENGER_CANCELED',
      'ARRIVED',
      'WAITING',
      'PICKED_UP',
      'DESTINATION'
    ]),
    origin: {
      type: 'Point',
      coordinates: [faker.finance.amount(1, 100, 5), faker.finance.amount(1, 100, 5)]
    },
    destinations: [
      {
        type: 'Point',
        coordinates: [faker.finance.amount(1, 100, 5), faker.finance.amount(1, 100, 5)],
        order: 1
      },
      ...(Math.random() > 0.7
        ? [
            {
              type: 'Point',
              coordinates: [faker.finance.amount(1, 100, 5), faker.finance.amount(1, 100, 5)],
              order: 2
            }
          ]
        : [])
    ],
    parcelDestinations: [
      {
        order: 0,
        receiverInfo: {
          fullName: faker.name.findName(),
          address: faker.address.streetAddress(),
          phoneNumber: `0912${String(faker.random.number({ min: 1000000, max: 9999999 }))}`
        },
        parcelsInfo: {
          numberOfParcels: faker.random.number({ min: 1, max: 10 }),
          parcelsWeight: mongoose.Types.ObjectId(),
          parcelsVolume: mongoose.Types.ObjectId(),
          parcelsValue: String,
          ParcelsDescription: faker.lorem.text()
        },
        signaturePhoto: [{ url: faker.image.imageUrl() }],
        delivered: faker.random.boolean(),
        orderingForSomeoneElse: {
          is: faker.random.boolean(),
          info: {
            fullName: faker.name.findName(),
            address: faker.address.streetAddress(),
            phoneNumber: `0912${String(faker.random.number({ min: 1000000, max: 9999999 }))}`
          }
        }
      }
    ],
    waitTimesInMinutes: [
      {
        title: faker.random.arrayElement([
          'AT_THE_ORIGIN_UNTIL_PICK_UP_THE_PASSENGER',
          'DURING_RIDE_HOLD_TIME',
          'DELIVERY_PICK_UP_PACKAGE_HOLD_TIME',
          'DELIVERY_DROP_PACKAGE_HOLD_TIME'
        ]),
        start: faker.date.past(),
        end: faker.date.past()
      }
    ],
    // Taxi more options
    inHurry: {
      is: faker.random.boolean(),
      givingMoney: faker.random.number({ min: 0, max: 20 }),
      costPercentage: faker.random.number({ min: 0, max: 60 })
    },
    bagsWithMe: {
      has: faker.random.boolean(),
      value: faker.random.words(3),
      weight: faker.random.number({ min: 0, max: 20 }),
      volume: faker.random.number({ min: 0, max: 20 })
    },
    withInfant: faker.random.boolean(),
    pet: {
      hasPet: faker.random.boolean(),
      hasCarrier: faker.random.boolean()
    },
    driverAssistant: faker.random.boolean(),
    welcomeSign: faker.random.boolean(),
    orderingForSomeoneElse: {
      is: faker.random.boolean(),
      info: {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        phoneNumber: `0912${String(faker.random.number({ min: 1000000, max: 9999999 }))}`
      }
    },
    airConditioner: faker.random.boolean(),
    reserved: {
      type: faker.random.boolean(),
      date: faker.date.past()
    },
    doorToDoorInBuilding: faker.random.boolean(),
    signatureNeeded: faker.random.boolean(),
    idNeeded: faker.random.boolean(),
    accompanyParcel: faker.random.boolean(),
    parcelPacked: faker.random.boolean(),
    //
    baseFare: faker.random.number({ min: 0, max: 20 }),
    cost: faker.random.number({ min: 0, max: 50 }),
    passedDestinationOrder: 1,
    returnToDestinationOrder: faker.random.number({ min: 0, max: 20 }),
    tipValue: faker.random.number({ min: 0, max: 20 }),
    other: faker.random.words(3),
    distancePrice: faker.finance.amount(1, 20, 2),
    waitTimePrice: faker.finance.amount(1, 10, 2),
    bookingFee: faker.finance.amount(1, 5, 2),
    reqCarTypePrice: faker.finance.amount(1, 5, 2),
    optionsPrice: faker.finance.amount(1, 5, 2)
  }
}

export default seederMaker(Model, getSeedData)
