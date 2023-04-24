import controller from './controller'

const resolver = {
  Query: {
    getLogs() {
      return controller.getAll()
    }
  }
}

export default resolver
