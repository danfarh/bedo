import controller from './controller'
import service from './service'
import ResolverBase from '../../utils/resolverBase'

const resolverBase = new ResolverBase(controller)

const resolver = {
  Query: {
    getCanceledTripReasons: (_, { filters, pagination }, { language }) =>
      service.findFromView({ ...filters, isDeleted: false }, pagination, {}, language),
    getCanceledTripReason: (_, { _id }, { language }) => service.findOneFromView({ _id }, language),
    getCanceledTripReasonsCount: (_, { filters }, { language }) =>
      service.countFromView({ ...filters, isDeleted: false }, language),
    getCanceledTripReasonsByAdmin: async (
      _,
      { filters, pagination, sort },
      { user }
    ): Promise<Object> => {
      return controller.getCanceledTripReasonsByAdmin(
        { ...filters, isDeleted: false },
        pagination,
        sort
      )
    },
    getCanceledTripReasonsByAdminCount: async (parent, { filters }) => {
      return controller.getCanceledTripReasonsByAdminCount({ ...filters, isDeleted: false })
    }
  },
  Mutation: {
    createCanceledTripReasonByAdmin: async (_, { input }, { user }): Promise<Object> => {
      return controller.createCanceledTripReasonByAdmin(input)
    },
    updateCanceledTripReasonByAdmin: async (_, { id, input }, { user }): Promise<Object> => {
      return controller.updateCanceledTripReasonByAdmin(id, input)
    },
    removeCanceledTripReasonByAdmin: async (_, { idSet }, { user }): Promise<Object> => {
      return controller.removeCanceledTripReasonByAdmin(idSet)
    }
  }
}

export default resolver
