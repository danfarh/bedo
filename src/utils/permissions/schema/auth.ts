import * as rules from '../rules'

const permissions = {
  Mutation: {
    getNewEmailVerificationCode: rules.isAuthenticated
  }
}

export default permissions
