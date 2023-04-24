import controller from './controller'
import ResolverBase from '../../utils/resolverBase'

const resolverBase = new ResolverBase(controller)

const resolver = {
  Query: {
    getParcelVolumes: async (parent, { filters, pagination, sort }, { user }): Promise<Object> => {
      return controller.getParcelVolumes({ ...filters, isDeleted: false }, pagination, sort)
    },
    getParcelVolume: resolverBase.query.get,
    getParcelVolumesCount: resolverBase.query.count,
    getParcelVolumesByAdmin: async (
      _,
      { filters, pagination, sort },
      { user }
    ): Promise<Object> => {
      return controller.getParcelVolumes({ ...filters, isDeleted: false }, pagination, sort)
    },
    getParcelVolumesByAdminCount: async (parent, { filters }) => {
      return controller.getParcelVolumesByAdminCount({ ...filters, isDeleted: false })
    }
  },
  Mutation: {
    createParcelVolumeByAdmin: async (_, { input }, { user }): Promise<Object> => {
      return controller.createParcelVolumeByAdmin(input)
    },
    updateParcelVolumeByAdmin: async (_, { id, input }, { user }): Promise<Object> => {
      return controller.updateParcelVolumeByAdmin(id, input)
    },
    removeParcelVolumeByAdmin: async (_, { idSet }, { user }): Promise<Object> => {
      return controller.removeParcelVolumeByAdmin(idSet)
    }
  }
}

export default resolver
