import controller from './controller'

const resolver = {
  Query: {
    user8(id) {
      return 'test'
    }
  },
  Mutation: {
    example8(id) {
      return 'test'
    }
  }
}

export default resolver
