import { UserInputError } from 'apollo-server-express'
import controller from './controller'

const resolver = {
  Query: {
    user50(id) {
      return 'test'
    },
    getNotificationsStatus(parent, args, { user }) {
      const role = user.roles.includes('ADMIN') ? 'admin' : user.roles.toLocaleLowerCase()
      return controller.getNotificationsStatus(user.sub, role)
    }
  },
  Mutation: {
    example50(id) {
      return 'test'
    },
    updateNotificationsStatus(parent, { inputs }, { user }) {
      const role = user.roles.includes('ADMIN') ? 'admin' : user.roles.toLocaleLowerCase()
      return controller.updateNotificationsStatus(inputs, user.sub, role)
    }
  }
}

export default resolver
