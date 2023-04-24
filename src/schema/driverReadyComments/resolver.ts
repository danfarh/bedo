import controller from './controller'
import service from './service'

const resolver = {
  Query: {
    getDriverReadyComments: async (_, { filters, pagination }, { language }): Promise<Object> => {
      return controller.getDriverReadyComments(filters, pagination, language)
    },
    getDriverReadyComment: async (_, { id }, { language }): Promise<Object> => {
      return controller.getDriverReadyComment(id, language)
    },
    getDriverReadyCommentsCount: async (_, { filters }, { language }): Promise<Number> => {
      return controller.getDriverReadyCommentsCount(filters, language)
    },
    getDriverReadyCommentsByAdmin: async (
      _,
      { filters, pagination, sort },
      { user }
    ): Promise<Object> => {
      return controller.getDriverReadyCommentsByAdmin(
        { ...filters, isDeleted: false },
        pagination,
        sort
      )
    },
    getDriverReadyCommentByAdmin: async (_, { id }) => {
      return service.findById(id)
    },
    getDriverReadyCommentsByAdminCount: async (parent, { filters }): Promise<Number> => {
      return controller.getDriverReadyCommentsByAdminCount({ ...filters, isDeleted: false })
    }
  },
  Mutation: {
    createDriverReadyCommentByAdmin: async (_, { input }, { user }): Promise<Object> => {
      return controller.createDriverReadyCommentByAdmin(input)
    },
    updateDriverReadyCommentByAdmin: async (_, { id, input }, { user }): Promise<Object> => {
      return controller.updateDriverReadyCommentByAdmin(id, input)
    },
    removeDriverReadyCommentByAdmin: async (_, { idSet }, { user }): Promise<Object> => {
      return controller.removeDriverReadyCommentByAdmin(idSet)
    }
  }
}

export default resolver
