import Controller from './controller'

export default {
  Query: {
    async permissions(parent, args, ctx, info) {
      return Controller.getAllPermissions({
        skip: args.skip || 0,
        limit: args.limit || 10
      })
    },
    async permission(parent, { _id }, ctx, info) {
      return Controller.getOnePermission(_id)
    },
    getAllpermissionsByAdmin: async (parent, { filters, pagination }) => {
      return Controller.getAllpermissionsByAdmin(filters, pagination)
    },
    getAllpermissionsByAdminCount: async (parent, { filters }) => {
      return Controller.getAllpermissionsByAdminCount(filters)
    }
  },
  Mutation: {
    async createPermissionByAdmin(parent, { data }, { user }, info) {
      return Controller.createPermission(data.name, data.description)
    },
    async updatePermissionByAdmin(parent, { data, whereId }, { user }, info) {
      const { name, description } = data
      return Controller.updatePermission(name, description, whereId)
    }
  }
}
