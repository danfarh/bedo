import * as rules from '../rules'

export default {
  Mutation: {
    uploadFile: rules.isAuthenticated
  }
}
