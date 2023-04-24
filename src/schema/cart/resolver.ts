import controller from './controller'
import ResolverBase from '../../utils/resolverBase'
import productService from '../product/service'
import userService from '../user/service'
import categoryService from '../category/service'

const resolverBase = new ResolverBase(controller)

const resolver = {
  Query: {
    getCart: resolverBase.query.get,
    getUserCart(parent, { category }, { user }) {
      return controller.getUserCart(user, category)
    }
  },
  Mutation: {
    async updateCart(parent, { shop, product, category, userLocation }, { user }) {
      return controller.updateCart(shop, product, category, userLocation, user)
    },
    async resetCart(parent, { shop, category, userLocation }, { user }) {
      return controller.resetCart(shop, category, user)
    },
    async cartVerification(parent, { category }, { user }, info) {
      return controller.cartVerification(category, user)
    }
  },
  Cart: {
    user(parent, args, { user }, info) {
      return userService.findById(parent.user)
    },
    rootCategory(parent, args, { user }, info) {
      return categoryService.findById(parent.rootCategory)
    }
  }
}

export default resolver
