import controller from './controller'
import ResolverBase from '../../utils/resolverBase'
import service from './service'

const resolver: any = {
  Query: {
    getPassengerReadyComment: async (_, { id }, { language }): Promise<Object> => {
      return controller.getPassengerReadyComment(id, language)
    },
    getPassengerReadyComments: async (
      _,
      { pagination, filters, sort },
      { language }
    ): Promise<Object> => {
      return controller.getPassengerReadyComments(
        pagination,
        { ...filters, isDeleted: false },
        sort,
        language
      )
    },
    getPassengerReadyCommentsCount: async (parent, { filters }, { language }) => {
      return controller.getPassengerReadyCommentsCount(filters, language)
    },
    getPassengerReadyCommentByAdmin: async (_, { id }): Promise<Object> => {
      return controller.getPassengerReadyCommentByAdmin(id)
    },
    getPassengerReadyCommentsByAdmin: async (_, { pagination, filters, sort }): Promise<Object> => {
      return controller.getPassengerReadyCommentsByAdmin(
        pagination,
        { ...filters, isDeleted: false },
        sort
      )
    },
    getPassengerReadyCommentsByAdminCount: async (parent, { filters }) => {
      return controller.getPassengerReadyCommentsCountByAdmin(filters)
    }
  },
  Mutation: {
    createPassengerReadyCommentByAdmin: async (_, { input }, { user }): Promise<Object> => {
      return controller.createPassengerReadyCommentsByAdmin(input, user.sub)
    },
    updatePassengerReadyCommentByAdmin: async (_, { id, input }, { user }): Promise<Object> => {
      return controller.updatePassengerReadyCommentsByAdmin(id, input)
    },
    removePassengerReadyCommentByAdmin: async (_, { idSet }, { user }): Promise<Object> => {
      return controller.removePassengerReadyCommentsByAdmin(idSet)
    }
  }
}

export default resolver
