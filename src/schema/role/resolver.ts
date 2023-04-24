import Controller from './controller'

export default {
  Query: {
    async roles(parent, args, ctx, info) {
      return Controller.getAllRoles({
        skip: args.skip || 0,
        limit: args.limit || 10
      })
    },
    async role(parent, { id }, ctx, info) {
      return Controller.getOneRole(id)
    }
  },
  Mutation: {
    async createRoleByAdmin(parent, { data }, ctx, info) {
      return Controller.createRole(data.name, data.permissions, data.description)
    },
    async updateRoleByAdmin(parent, { data, whereId }, ctx, info) {
      const { name, permissions, description } = data
      const result = await Controller.updateRole(name, permissions, description, whereId)
      return result
    }
  },
  Role: {
    permissions: async (role, args, { req }, info) => {
      return (await role.populate('permissions').execPopulate()).permissions
    }
  }
}
