import { Types } from 'mongoose'
import _ from 'lodash'
import moment from 'moment'
import service from './service'
import controllerBase from '../../utils/controllerBase'

export default new (class Controller extends controllerBase {
  async getHistory(user: any, filters: any, pagination: any) {
    return service.getHistory(user, filters, pagination)
  }

  async getLastTripOrder(user) {
    const lastTripOrder: any = await service.getLastTripOrder(user)
    if (lastTripOrder) {
      if (lastTripOrder.finished && lastTripOrder.commented === 'NOT_COMMENTED') {
        return {
          tripOrder: lastTripOrder,
          redirectToCommentSection: true
        }
      }
    }
    return {
      tripOrder: lastTripOrder,
      redirectToCommentSection: false
    }
  }

  async getTripOrdersDetailByAdmin(filters: any = {}, sort = { createdAt: -1 }) {
    // eslint-disable-next-line no-param-reassign
    filters.createdAt = {
      $gte: moment(new Date(filters.from))
        .utc()
        .startOf('date')
        .toDate(),
      $lte: moment(new Date(filters.to))
        .utc()
        .endOf('date')
        .toDate()
    }
    // eslint-disable-next-line no-param-reassign
    filters = _.omit(filters, ['from', 'to'])
    if ('_id' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters._id = Types.ObjectId(filters._id)
    }
    if ('user' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.user = Types.ObjectId(filters.user)
    }
    if ('state' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['trip.state'] = filters.state
      // eslint-disable-next-line no-param-reassign
      filters = _.omit(filters, 'state')
    }
    if ('ended' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['trip.ended'] = filters.ended
      // eslint-disable-next-line no-param-reassign
      filters = _.omit(filters, 'ended')
    }
    if ('driver' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['trip.driver'] = Types.ObjectId(filters.driver)
      // eslint-disable-next-line no-param-reassign
      filters = _.omit(filters, 'driver')
    }
    if ('car' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['trip.car'] = Types.ObjectId(filters.car)
      // eslint-disable-next-line no-param-reassign
      filters = _.omit(filters, 'car')
    }
    if ('tripType' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['trip.tripType'] = filters.tripType
      // eslint-disable-next-line no-param-reassign
      filters = _.omit(filters, 'tripType')
    }
    return service.getTripOrdersDetail(filters, sort)
  }

  async skipCommentOnTrip(user: any, tripId: Types.ObjectId) {
    // Todo should be removed : we have skipCommentOnDriver
    return service.findOneAndUpdate(
      { user: user.userId, trip: tripId, finished: true },
      { commented: 'SKIPPED' }
    )
  }
})(service)
