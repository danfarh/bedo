import controller from './controller'
import ResolverBase from '../../utils/resolverBase'
import service from './service'

const resolverBase = new ResolverBase(controller)

const resolver = {
  Query: {
    getCarTypes: async (_, { pagination, filters, sort }, { language }): Promise<Object> => {
      return service.findFromView(filters, pagination, sort, language)
    },
    getCarType: async (_, { _id }, { language }): Promise<Object> => {
      return service.findOneFromView({ _id }, language)
    },
    getCarTypesCount: async (parent, { filters }, { language }) => {
      return service.countFromView(filters, language)
    },
    getCarTypesByAdmin: resolverBase.query.index,
    getCarTypeByAdmin: resolverBase.query.get,
    getCarTypesCountByAdmin: resolverBase.query.count
  }
}

export default resolver
