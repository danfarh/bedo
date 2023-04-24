import { or, rule } from 'graphql-shield'
import { ApolloError } from 'apollo-server-express'
import Shop from '../../schema/shop/schema'
import User from '../../schema/user/schema'
import Driver from '../../schema/driver/schema'
import Admin from '../../schema/admin/schema'

export const isUser = rule({ cache: 'no_cache' })(async (parent, args, { user }, info) => {
  if (!user) {
    return new ApolloError('authentication is required fo this action', '401')
  }
  const findedUser: any = await User.findById(user.sub)
  if (findedUser && findedUser.state !== 'SUSPENDED') {
    // switch (user.phoneNumber) {
    return true
    // default:
  }
  return new ApolloError('you are not a user', '401')
})

// export const isShop = rule({ cache: 'no_cache' })(async (parent, args, { user }, info) => {
//   const shop: any = await Shop.findById(user.sub)
//   if (shop && shop.state !== 'SUSPENDED') {
//     return true
//   }
//   return new ApolloError('you are not a shop', '401')
// })
export const isShopAdmin = rule({ cache: 'no_cache' })(async (parent, args, { user }, info) => {
  if (!user) {
    return new ApolloError('authentication is required fo this action', '401')
  }

  const shopAdmin: any = await Admin.findById(user.userId)
  if (shopAdmin && shopAdmin.type === 'SHOP-ADMIN' && shopAdmin.state !== 'SUSPENDED') {
    return true
  }
  return new ApolloError('you are not a shop admin', '401')
})

export const isDriver = rule({ cache: 'no_cache' })(async (parent, args, { user }, info) => {
  if (!user) {
    return new ApolloError('authentication is required fo this route', '401')
  }
  const driver: any = await Driver.findById(user.sub)
  if (driver && driver.state !== 'SUSPENDED') {
    // switch (user.phoneNumber) {
    return true
    // default:
  }
  return new ApolloError('you are not a driver', '401')
})

// TODO: => add Admin Schema for Admin rule

export const isAdmin = rule({ cache: 'no_cache' })(async (parent, args, { user }, info: any) => {
  if (!user) {
    return new ApolloError('authentication is required for this action', '401')
  }
  const admin = <any>await Admin.findById(user.userId).populate({
    path: 'roles',
    populate: {
      path: 'permissions'
    }
  })
  if (admin) {
    const havePer = admin.roles
      .map(role => {
        return role.permissions.some(per => {
          return per.name === info.fieldName
        })
      })
      .some(roleRes => roleRes)
    if (havePer) return true
    return new ApolloError('you do not have the permission for this action', '403')
  }
  return new ApolloError('unauthorized', '401')
})

export const isUserAuthorized = rule({ cache: 'no_cache' })(
  async (parent, args, { user }, info: any) => {
    if (!user) {
      return new ApolloError('authentication is required fo this action', '401')
    }
    const foundUser: any = await User.findById(user.sub)
    return foundUser ? true : new ApolloError('you are not a user', '401')
  }
)

export const isDriverAuthorized = rule({ cache: 'no_cache' })(
  async (parent, args, { user }, info: any) => {
    if (!user) {
      return new ApolloError('authentication is required fo this action', '401')
    }
    const foundDriver: any = await Driver.findById(user.sub)
    return foundDriver ? true : new ApolloError('you are not a driver', '401')
  }
)

export const isAuthenticated = or(isAdmin, isShopAdmin, isUser, isDriver)
