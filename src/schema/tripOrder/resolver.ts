import controller from './controller'
import ResolverBase from '../../utils/resolverBase'
import userService from '../user/service'
import tripService from '../trip/service'
import paymentService from '../payment/service'

const resolverBase = new ResolverBase(controller)

const resolver: any = {
  Query: {
    getTripOrders: resolverBase.query.index,
    getLastTripOrder(parent, args, { user }) {
      return controller.getLastTripOrder(user)
    },
    getTripOrder: resolverBase.query.get,
    getTripOrdersCount: resolverBase.query.count,
    getTripOrdersHistory(parent, { filters, pagination }, { user }) {
      return controller.getHistory(user, filters, pagination)
    },
    getTripOrdersDetailByAdmin(parent, { filters, sort }, ctx, info) {
      return controller.getTripOrdersDetailByAdmin(filters, sort)
    }
  },
  Mutation: {
    createTripOrder: resolverBase.mutation.create,
    skipCommentOnTrip: async (_, { tripId }, { user }) => {
      return controller.skipCommentOnTrip(user, tripId)
    }
  },
  TripOrder: {
    user(parent, args, ctx, info) {
      return userService.findById(parent.user)
    },
    trip(parent, args, ctx, info) {
      return tripService.findById(parent.trip)
    },
    payment(parent, args, ctx, info) {
      return paymentService.findById(parent.payment)
    }
  }
}

export default resolver
