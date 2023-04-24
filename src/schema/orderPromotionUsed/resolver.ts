import controller from './controller'

const resolver = {
  Query: {
    user19(id) {
      return 'test'
    }
  },
  Mutation: {
    example19(id) {
      return 'test'
    }
  }
}

export default resolver
