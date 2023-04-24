import controller from './controller'
import ResolverBase from '../../utils/resolverBase'
import CarTypeService from '../carType/service'

const resolverBase = new ResolverBase(controller)

const resolver = {
  Query: {
    getReqCarTypes: resolverBase.query.index,
    getReqCarType: async (parent, { _id }) => {
      return controller.getReqCarType(_id)
    },
    getReqCarTypesCount: resolverBase.query.count,
    getReqCarTypesByAdmin: async (parent, { filters, pagination, sort }) => {
      return controller.getReqCarTypesByAdmin(filters, pagination, sort)
    },
    getReqCarTypesByAdminCount: async (parent, { filters }) => {
      return controller.getReqCarTypesByAdminCount(filters)
    }
  },
  Mutation: {
    updateReqCarTypeByAdmin: async (parent, { filters, input }) => {
      return controller.updateReqCarTypeByAdmin(filters, input)
    }
  },
  ReqCarType: {
    async carTypes(parent) {
      return parent.carTypes
        ? Promise.all(parent.carTypes.map(async i => CarTypeService.findById(i)))
        : []
    }
  }
}

export default resolver
