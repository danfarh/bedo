import ResolverBase from '../../utils/resolverBase'
import controller from './controller'
import service from './service'

const resolverBase = new ResolverBase(controller)

export default {
  Query: {
    getReadyMessage: (parent, { id }, { language }) => {
      return service.findOneFromView({ _id: id, isDeleted: false }, language)
    },
    getReadyMessages: (_, { filters, pagination }, { language }) =>
      service.findFromView({ ...filters, isDeleted: false }, pagination, {}, language),
    getReadyMessagesByAdmin: (parent, { filters, pagination, sort }, { user }) => {
      return controller.getReadyMessagesByAdmin({ ...filters, isDeleted: false }, pagination, sort)
    },
    getReadyMessagesByAdminCount: async (parent, { filters }) => {
      return controller.getReadyMessagesByAdminCount({ ...filters, isDeleted: false })
    }
  },
  Mutation: {
    createReadyMessageByAdmin: (parent, { input }, { user }) => {
      return controller.createReadyMessageByAdmin(input)
    },
    updateReadyMessageByAdmin: (parent, { id, input }, { user }) => {
      return controller.updateReadyMessageByAdmin(id, input)
    },
    removeReadyMessageByAdmin: (parent, { idSet }, { user }) => {
      return controller.removeReadyMessageByAdmin(idSet)
    }
  }
}
