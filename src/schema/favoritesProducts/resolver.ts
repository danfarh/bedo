import controller from './controller'
import ResolverBase from '../../utils/resolverBase'

const resolverBase = new ResolverBase(controller)

const resolver = {
  Query: {
    getFavoritesProducts: resolverBase.queryIfUserIdEqualsTo('user').index,
    getFavoritesProduct: resolverBase.queryIfUserIdEqualsTo('user').get,
    getFavoritesProductsCount: resolverBase.queryIfUserIdEqualsTo('user').count
  }
}

export default resolver
