import controller from './controller'
import ResolverBase from '../../utils/resolverBase'

const resolverBase = new ResolverBase(controller)

const resolver = {
  Query: {
    getParcelWeights: async (_, { filters, pagination, sort }, { user }): Promise<Object> => {
      return controller.getParcelWeights({ ...filters, isDeleted: false }, pagination, sort)
    },
    getParcelWeight: resolverBase.query.get,
    getParcelWeightsCount: resolverBase.query.count,
    getParcelWeightsByAdmin: async (
      _,
      { filters, pagination, sort },
      { user }
    ): Promise<Object> => {
      return controller.getParcelWeights({ ...filters, isDeleted: false }, pagination, sort)
    },
    getParcelWeightsByAdminCount: async (parent, { filters }) => {
      return controller.getParcelWeightsByAdminCount({ ...filters, isDeleted: false })
    }
  },
  Mutation: {
    createParcelWeightByAdmin: async (_, { input }, { user }): Promise<Object> => {
      return controller.createParcelWeightByAdmin(input)
    },
    updateParcelWeightByAdmin: async (_, { id, input }, { user }): Promise<Object> => {
      return controller.updateParcelWeightByAdmin(id, input)
    },
    removeParcelWeightByAdmin: async (_, { idSet }, { user }): Promise<Object> => {
      return controller.removeParcelWeightByAdmin(idSet)
    }
  }
}

export default resolver
