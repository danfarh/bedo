import controller from './controller'
import ResolverBase from '../../utils/resolverBase'
import service from '../transaction/service'

const resolverBase = new ResolverBase(controller)

const resolver = {
  Query: {
    getRegions: (parent, { pagination, sort }, { user }) => {
      return controller.getRegions(pagination, sort)
    },
    getRegionsCount: resolverBase.query.count
  },
  Mutation: {
    addRegion: (parent, { RegionInput }, { user }) => {
      return controller.addRegion(RegionInput)
    },
    updateRegion: (parent, { id, name }, { user }) => {
      return controller.updateRegion(id, name)
    },
    removeRegion: (parent, { id }, { user }) => {
      return service.findOneAndRemove(id)
    }
  }
}
export default resolver
