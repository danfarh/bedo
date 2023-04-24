import controller from './controller'
import ResolverBase from '../../utils/resolverBase'

const resolverBase = new ResolverBase(controller)

const resolver = {
  Query: {
    getCurrencies: resolverBase.query.index,
    getCurrency: resolverBase.query.get,
    getCurrenciesCount: resolverBase.query.count
  }
}

export default resolver
