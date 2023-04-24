import controller from './controller'
import ResolverBase from '../../utils/resolverBase'
import attributeGroupService from '../attributeGroup/service'

const resolverBase = new ResolverBase(controller)

const resolver = {
  Query: {
    getAttributes: resolverBase.query.index,
    getAttribute: resolverBase.query.get,
    getAttributesCount: resolverBase.query.count
  },
  Mutation: {
    createAttributeByAdmin: async (_, { inputs }, { user }): Promise<Object> => {
      return controller.createAttributeByAdmin(inputs)
    },
    updateAttributeByAdmin: async (_, { id, inputs }, { user }): Promise<Object> => {
      return controller.updateAttributeByAdmin(id, inputs)
    },
    deleteAttributeByAdmin: async (_, { idSet }, { user }): Promise<Object> => {
      return controller.deleteAttributeByAdmin(idSet)
    }
  },
  Attribute: {
    attributeGroup(parent, args, ctx, info) {
      return attributeGroupService.findById(parent.attributeGroup)
    }
  }
}

export default resolver
