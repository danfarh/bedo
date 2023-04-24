import faker from 'faker'
import Model from './schema'
import seederMaker from '../../utils/seederMaker'

const getSeedData = async (): Promise<Object> => {
  return {
    plate: faker.lorem.words(3),
    color: null,
    carType: null,
    pictures: {
      inner: [{ url: faker.image.imageUrl() }, { url: faker.image.imageUrl() }],
      outer: [{ url: faker.image.imageUrl() }, { url: faker.image.imageUrl() }]
    },
    insurance: {
      insuranceImageUrl: faker.random.words(15),
      expireDate: new Date().getFullYear() + 10
    },
    carOptions: {
      inHurry: false,
      orderingForSomeoneElse: false,
      pet: false,
      bagsWithMe: false,
      reserved: false,
      airConditioner: false,
      welcomeSign: true,
      driverAssistant: false,
      withInfant: false,
      waitTimesInMinutes: false,
      tipValue: false
    },
    ride: true,
    delivery: true,
    description: faker.lorem.words(8),
    brand: null,
    model: null,
    manufacturingYear: new Date().getFullYear(),
    isInTrip: false,
    registrationDocumentUrl: faker.lorem.words(8)
  }
}

export default seederMaker(Model, getSeedData)
