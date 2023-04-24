import controller from './controller'
import ResolverBase from '../../utils/resolverBase'

const resolverBase = new ResolverBase(controller)

const resolver = {
  Query: {
    getConstants: resolverBase.query.index,
    getConstant: async (parent, { _id }) => {
      return controller.getConstant(_id)
    },
    getConstantsCount: resolverBase.query.count,
    getConstantsByAdmin: async (parent, { filters, pagination, sort }) => {
      return controller.getConstantsByAdmin(filters, pagination, sort)
    },
    getConstantsByAdminCount: async (parent, { filters }) => {
      return controller.getConstantsByAdminCount(filters)
    },
    getPaymentMethodsStatus: async (parent, args) => {
      return controller.getPaymentMethodsStatus()
    }
  },
  Mutation: {
    updateConstantByAdmin: async (parent, { filters, data }) => {
      return controller.updateConstantByAdmin(filters, data)
    }
  }
}

export default resolver
