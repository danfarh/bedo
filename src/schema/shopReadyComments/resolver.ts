import controller from './controller'
import ResolverBase from '../../utils/resolverBase'
import service from './service'

const resolver: any = {
  Query: {
    getShopReadyComment: async (_, { id }, { language }): Promise<Object> => {
      return controller.getShopReadyComment(id, language)
    },
    getShopReadyComments: async (
      _,
      { pagination, filters, sort },
      { language }
    ): Promise<Object> => {
      return controller.getShopReadyComments(
        pagination,
        { ...filters, isDeleted: false },
        sort,
        language
      )
    },
    getShopReadyCommentsCount: async (parent, { filters }, { language }) => {
      return controller.getShopReadyCommentsCount(filters, language)
    },
    getShopReadyCommentByAdmin: async (_, { id }): Promise<Object> => {
      return controller.getShopReadyCommentByAdmin(id)
    },
    getShopReadyCommentsByAdmin: async (_, { pagination, filters, sort }): Promise<Object> => {
      return controller.getShopReadyCommentsByAdmin(
        pagination,
        { ...filters, isDeleted: false },
        sort
      )
    },
    getShopReadyCommentsByAdminCount: async (parent, { filters }) => {
      return controller.getShopReadyCommentsCountByAdmin(filters)
    }
  },
  Mutation: {
    createShopReadyCommentByAdmin: async (_, { input }, { user }): Promise<Object> => {
      return controller.createShopReadyCommentsByAdmin(input, user.sub)
    },
    updateShopReadyCommentByAdmin: async (_, { id, input }, { user }): Promise<Object> => {
      return controller.updateShopReadyCommentsByAdmin(id, input)
    },
    removeShopReadyCommentByAdmin: async (_, { idSet }, { user }): Promise<Object> => {
      return controller.removeShopReadyCommentsByAdmin(idSet)
    }
  }
}

export default resolver
