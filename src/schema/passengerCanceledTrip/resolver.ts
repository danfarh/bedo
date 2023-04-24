import controller from './controller'
import ResolverBase from '../../utils/resolverBase'

const resolverBase = new ResolverBase(controller)

const resolver = {
  Query: {
    getPassengerCanceledTrips: resolverBase.queryIfUserIdEqualsTo('passenger').index,
    getPassengerCanceledTrip: resolverBase.queryIfUserIdEqualsTo('passenger').get,
    getPassengerCanceledTripsCount: resolverBase.queryIfUserIdEqualsTo('passenger').count
  }
}

export default resolver
