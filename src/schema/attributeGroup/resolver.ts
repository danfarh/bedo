import controller from './controller'
import ResolverBase from '../../utils/resolverBase'
import categoryService from '../category/service'
import attributeService from '../attribute/service'

const resolverBase = new ResolverBase(controller)

const resolver = {
  Query: {
    getAttributeGroups: async (parent, { filters, pagination }) => {
      return controller.getAttributeGroups(filters, pagination)
    },
    getAttributeGroup: async (parent, { _id }) => {
      return controller.getAttributeGroup(_id)
    },
    getAttributeGroupsCount: async (parent, { filters }) => {
      return controller.getAttributeGroupsCount(filters)
    },
    getAttributeGroupsByAdmin: async (parent, { filters, pagination, sort }) => {
      return controller.getAttributeGroupsByAdmin(filters, pagination, sort)
    },
    getAttributeGroupByAdmin: async (parent, { _id }) => {
      return controller.getAttributeGroupByAdmin(_id)
    },
    getAttributeGroupsByAdminCount: async (parent, { filters }) => {
      return controller.getAttributeGroupsByAdminCount(filters)
    }
  },
  Mutation: {
    createAttributeGroupByAdmin: async (parent, { input, attributes }) => {
      return controller.createAttributeGroupByAdmin(input, attributes)
    },
    updateAttributeGroupByAdmin: async (parent, { input, _id }) => {
      return controller.updateAttributeGroupByAdmin(_id, input)
    },
    addAttributesToAttributeGroupByAdmin: async (parent, { _id, attributes }) => {
      return controller.addAttributesToAttributeGroup(_id, attributes)
    },
    removeAttributesFromAttributeGroupByAdmin: async (parent, { _id, attributes }) => {
      return controller.removeAttributesFromAttributeGroup(_id, attributes)
    },
    deleteAttributeGroupByAdmin: async (parent, { idSet }, { user }) => {
      return controller.deleteAttributeGroupByAdmin(idSet)
    }
  },
  AttributeGroup: {
    rootCategory: async (parent, args, { language }, info) => {
      return categoryService.findOneFromView({ _id: parent.rootCategory }, language)
    },
    attributes: async (parent, args, ctx, info) => {
      return attributeService.find({ attributeGroup: parent._id })
    }
  }
}

export default resolver
