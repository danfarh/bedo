const { MockList } = require('apollo-server-express')

const mocks: any = {
  Query: () => ({
    user: () => new MockList(0)
  }),
  Date: () => new Date()
}

export { mocks }
