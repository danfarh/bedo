import faker from 'faker'
import mongoose from 'mongoose'
import Model from './schema'
import seederMaker from '../../utils/seederMaker'

const getSeedData = async (): Promise<Object> => {
  return {
    driver: null,
    user: null,
    title: faker.lorem.words(3),
    body: faker.lorem.words(3),
    for: faker.random.arrayElement(['USER', 'DRIVER']),
    type: faker.random.arrayElement(['IMPORTANT', 'GENERAL', 'PRIVATE'])
  }
}

export default seederMaker(Model, getSeedData)
