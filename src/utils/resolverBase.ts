// eslint-disable-next-line no-unused-vars
import { ApolloError } from 'apollo-server-express'
// eslint-disable-next-line no-unused-vars
import ControllerBase from './controllerBase'

const checkAdmin = user => {
  if (!user || user.roles !== 'SUPER_ADMIN') {
    throw new ApolloError('you do not have permission for this action', '400')
  }
}

export default class {
  controller: ControllerBase

  query = {
    index: (parent, { pagination, filters, sort = {} }, { user }) => {
      return this.controller.index(user, filters, pagination, sort)
    },
    count: (parent, { filters }, { user }) => {
      return this.controller.count(user, filters)
    },
    get: (parent, { id = '', _id = '' } = {}, { user }) => {
      const finalId = id || _id
      return this.controller.get(user, finalId)
    }
  }

  mutation = {
    create: (parent, { inputs }, { user }) => {
      return this.controller.create(user, inputs)
    },
    update: (parent, { inputs, _id }, { user }) => {
      return this.controller.update(user, _id, inputs)
    },
    delete: (parent, { _id }, { user }) => {
      return this.controller.delete(user, _id)
    }
  }

  constructor(controller: ControllerBase) {
    this.controller = controller
  }

  queryIfUserIdEqualsTo(key, fullControlForAdmin = false) {
    return {
      index: (parent, { pagination, filters, sort = {} }, { user }) => {
        if (fullControlForAdmin) {
          if (user && user.roles === 'SUPER_ADMIN') {
            return this.query.index(parent, { pagination, filters, sort }, { user })
          }
        }
        return this.controller.index(
          user,
          {
            ...filters,
            [key]: user ? user.userId : null
          },
          pagination
        )
      },
      count: (parent, { filters }, { user }) => {
        if (fullControlForAdmin) {
          if (user && user.roles === 'SUPER_ADMIN') {
            return this.query.count(parent, { filters }, { user })
          }
        }
        return this.controller.count(user, {
          ...filters,
          [key]: user ? user.userId : null
        })
      },
      get: (parent, { _id }, { user }) => {
        if (fullControlForAdmin) {
          if (user && user.roles === 'SUPER_ADMIN') {
            return this.query.get(parent, { id: _id }, { user })
          }
        }
        return this.controller.get(user, {
          _id,
          [key]: user ? user.userId : null
        })
      }
    }
  }

  mutationIfUserIdEqualsTo(key) {
    return {
      create: (parent, { inputs }, { user }) => {
        // eslint-disable-next-line no-param-reassign
        inputs[key] = user.userId
        return this.controller.create(user, inputs)
      },
      update: (parent, { inputs, _id }, { user }) => {
        return this.controller.update(
          user,
          {
            _id,
            [key]: user ? user.userId : null
          },
          inputs
        )
      },
      delete: (parent, { _id }, { user }) => {
        return this.controller.delete(user, {
          _id,
          [key]: user ? user.userId : null
        })
      }
    }
  }

  queryIfUserIsAdmin() {
    return {
      index: (parent, { pagination, filters }, { user }) => {
        checkAdmin(user)
        return this.controller.index(
          user,
          {
            ...filters
          },
          pagination
        )
      },
      count: (parent, { filters }, { user }) => {
        checkAdmin(user)
        return this.controller.count(user, {
          ...filters
        })
      },
      get: (parent, { _id }, { user }) => {
        checkAdmin(user)
        return this.controller.get(user, {
          _id
        })
      }
    }
  }

  mutationIfUserIsAdmin(custom: Object = {}) {
    return {
      create: (parent, { inputs }, { user }) => {
        checkAdmin(user)
        return this.controller.create(user, { ...inputs, ...custom })
      },
      update: (parent, { inputs, _id }, { user }) => {
        checkAdmin(user)
        return this.controller.update(
          user,
          {
            _id
          },
          { ...inputs, ...custom }
        )
      },
      delete: (parent, { _id }, { user }) => {
        checkAdmin(user)
        return this.controller.delete(user, {
          _id
        })
      }
    }
  }
}
