import controller from './controller'
import ResolverBase from '../../utils/resolverBase'

const resolverBase = new ResolverBase(controller)

const resolver = {
  Query: {
    getDriverCanceledTrips: resolverBase.queryIfUserIdEqualsTo('driver').index,
    getDriverCanceledTrip: resolverBase.queryIfUserIdEqualsTo('driver').get,
    getDriverCanceledTripsCount: resolverBase.queryIfUserIdEqualsTo('driver').count
  }
}

export default resolver
