import controller from './controller'
// const { AuthenticationError } = require('apollo-server-express')

const resolver: any = {
  Mutation: {
    uploadFile: async (_, args, { user }) => {
      return controller.uploadFile({ args, user })
    }
  }
}

export default resolver
