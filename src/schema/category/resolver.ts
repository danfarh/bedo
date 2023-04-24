import controller from './controller'
import ResolverBase from '../../utils/resolverBase'
import service from './service'
import schema from '../car/schema'

const resolverBase = new ResolverBase(controller)

const resolver = {
  Query: {
    getCategories: async (_, { filters, pagination, sort }, { language }) => {
      const result = await service.findFromView(
        { ...filters, isDeleted: false },
        pagination,
        sort,
        language
      )
      return result
    },
    getCategory: (_, { filters }, { language }) =>
      service.findOneFromView({ ...filters, isDeleted: false }, language),
    getCategoriesCount: (_, { filters }, { language }) =>
      service.countFromView({ ...filters, isDeleted: false }, language),
    getCategoriesByAdmin: resolverBase.query.index,
    getCategoryByAdmin: resolverBase.query.get,
    getCategoriesCountByAdmin: (_, { filters }) => service.count({ ...filters, isDeleted: false })
  },
  Mutation: {
    createCategoryByAdmin: async (parent, { data }) => {
      return controller.createCategoryByAdmin(data)
    },
    updateCategoryByAdmin: async (parent, { _id, data }) => {
      return controller.updateCategoryByAdmin(_id, data)
    },
    deleteCategoryByAdmin: async (parent, { idSet }) => {
      return controller.deleteCategoryByAdmin(idSet)
    }
  },
  Category: {
    parent: async (parent, args, { language }, info) => {
      return service.findOneFromView({ _id: parent.parent }, language)
    }
  },
  MultiLanguageCategory: {
    parent: async (parent, args, info) => {
      return service.findOne({ _id: parent.parent })
    }
  }
}

export default resolver
