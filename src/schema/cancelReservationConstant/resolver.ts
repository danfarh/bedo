import controller from './controller'
import ResolverBase from '../../utils/resolverBase'

const resolverBase = new ResolverBase(controller)

const resolver = {
  Query: {
    getCancelReservationConstants: resolverBase.query.index,
    getCancelReservationConstant: async (parent, { _id }) => {
      return controller.getCancelReservationConstant(_id)
    },
    getCancelReservationConstantsCount: resolverBase.query.count,
    getCancelReservationConstantsByAdmin: async (parent, { filters, pagination, sort }) => {
      return controller.getCancelReservationConstantsByAdmin(filters, pagination, sort)
    },
    getCancelReservationConstantsByAdminCount: async (parent, { filters }) => {
      return controller.getCancelReservationConstantsByAdminCount(filters)
    }
  },
  Mutation: {
    updateCancelReservationConstantByAdmin: async (parent, { filters, data }) => {
      return controller.updateCancelReservationConstantByAdmin(filters, data)
    },
    createCancelReservationConstantByAdmin: async (parent, { data }, { user }, info) => {
      return controller.createCancelReservationConstantByAdmin(data)
    }
  }
}

export default resolver
