import { Types } from 'mongoose'
import * as _ from 'lodash'
import moment from 'moment'
import CommentOnPassenger from './schema'
import ServiceBase from '../../utils/serviceBase'
import driverOrPassengerFilters from '../../utils/driverOrPassengerFilters'

export default new (class service extends ServiceBase {
  // future methods
  async getCommentsOnPassengerByAdmin(
    filters: any = {},
    pagination: any = { skip: 0, limit: 15 },
    sort: any = { createdAt: -1 }
  ) {
    if ('driverComment' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.driverComment = new RegExp(filters.driverComment, 'gi')
    }
    if ('_id' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters._id = Types.ObjectId(filters._id)
    }

    if ('car' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['trip.car'] = Types.ObjectId(filters.car)
      // eslint-disable-next-line no-param-reassign
      filters = _.omit(filters, 'car')
    }

    if ('readyComments' in filters) {
      if (filters.readyComments.readyComment) {
        // eslint-disable-next-line no-param-reassign
        filters.readyComments.readyComment = Types.ObjectId(filters.readyComments.readyComment)
      }
      // eslint-disable-next-line no-param-reassign
      filters.readyComments = {
        $elemMatch: { ...filters.readyComments }
      }
    }
    if ('trip' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['trip._id'] = Types.ObjectId(filters.trip)
      // eslint-disable-next-line no-param-reassign
      filters = _.omit(filters, 'trip')
    }
    if ('passenger' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['passenger._id'] = Types.ObjectId(filters.passenger)
      filters = _.omit(filters, 'passenger')
    }
    if ('driver' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['driver._id'] = Types.ObjectId(filters.driver)
      filters = _.omit(filters, 'driver')
    }
    if ('passengerPhoneNumber' in filters) {
      filters['passenger.phoneNumber'] = new RegExp(filters.passengerPhoneNumber, 'gi')
      filters = _.omit(filters, 'passengerPhoneNumber')
    }
    if ('passengerName' in filters) {
      filters['passenger.fullName'] = new RegExp(filters.passengerName, 'gi')
      filters = _.omit(filters, 'passengerName')
    }
    if ('driverPhoneNumber' in filters) {
      filters['driver.phoneNumber'] = new RegExp(filters.driverPhoneNumber, 'gi')
      filters = _.omit(filters, 'driverPhoneNumber')
    }
    if ('driverName' in filters) {
      filters['driver.fullName'] = new RegExp(filters.driverName, 'gi')
      filters = _.omit(filters, 'driverName')
    }
    if ('createdAt' in filters && 'createdAtFrom' in filters) {
      filters.createdAt = {
        $gte: moment(new Date(filters.createdAtFrom))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.createdAt))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.createdAtFrom
    } else if ('createdAtFrom' in filters) {
      filters.createdAt = {
        $gte: moment(new Date(filters.createdAtFrom))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.createdAtFrom
    } else if ('createdAt' in filters) {
      filters.createdAt = {
        $lte: moment(new Date(filters.createdAt))
          .utc()
          .startOf('date')
          .toDate()
      }
    }
    if ('updatedAt' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.updatedAt = {
        $gte: moment(new Date(filters.updatedAt))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.updatedAt))
          .utc()
          .endOf('date')
          .toDate()
      }
    }
    return CommentOnPassenger.aggregate([
      {
        $lookup: {
          from: 'trips',
          localField: 'trip',
          foreignField: '_id',
          as: 'trip'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'passenger',
          foreignField: '_id',
          as: 'passenger'
        }
      },
      {
        $lookup: {
          from: 'drivers',
          localField: 'driver',
          foreignField: '_id',
          as: 'driver'
        }
      },
      { $unwind: '$trip' },
      { $unwind: '$passenger' },
      { $unwind: '$driver' },
      { $match: { ...filters } },
      { $sort: { ...sort } },
      { $skip: pagination.skip },
      { $limit: pagination.limit }
    ])
  }

  async getCommentsOnPassengerByAdminCount(filters: any = {}) {
    if ('driverComment' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.driverComment = new RegExp(filters.driverComment, 'gi')
    }

    if ('car' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['trip.car'] = Types.ObjectId(filters.car)
      // eslint-disable-next-line no-param-reassign
      filters = _.omit(filters, 'car')
    }

    if ('_id' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters._id = Types.ObjectId(filters._id)
    }
    if ('trip' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['trip._id'] = Types.ObjectId(filters.trip)
      // eslint-disable-next-line no-param-reassign
      filters = _.omit(filters, 'trip')
    }
    if ('passenger' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['passenger._id'] = Types.ObjectId(filters.passenger)
      filters = _.omit(filters, 'passenger')
    }
    if ('driver' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['driver._id'] = Types.ObjectId(filters.driver)
      filters = _.omit(filters, 'driver')
    }
    if ('passengerPhoneNumber' in filters) {
      filters['passenger.phoneNumber'] = new RegExp(filters.passengerPhoneNumber, 'gi')
      filters = _.omit(filters, 'passengerPhoneNumber')
    }
    if ('passengerName' in filters) {
      filters['passenger.fullName'] = new RegExp(filters.passengerName, 'gi')
      filters = _.omit(filters, 'passengerName')
    }
    if ('driverPhoneNumber' in filters) {
      filters['driver.phoneNumber'] = new RegExp(filters.driverPhoneNumber, 'gi')
      filters = _.omit(filters, 'driverPhoneNumber')
    }
    if ('driverName' in filters) {
      filters['driver.fullName'] = new RegExp(filters.driverName, 'gi')
      filters = _.omit(filters, 'driverName')
    }

    if ('readyComments' in filters) {
      if (filters.readyComments.readyComment) {
        // eslint-disable-next-line no-param-reassign
        filters.readyComments.readyComment = Types.ObjectId(filters.readyComments.readyComment)
      }
      // eslint-disable-next-line no-param-reassign
      filters.readyComments = {
        $elemMatch: { ...filters.readyComments }
      }
    }
    if ('createdAt' in filters && 'createdAtFrom' in filters) {
      filters.createdAt = {
        $gte: moment(new Date(filters.createdAtFrom))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.createdAt))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.createdAtFrom
    } else if ('createdAtFrom' in filters) {
      filters.createdAt = {
        $gte: moment(new Date(filters.createdAtFrom))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.createdAtFrom
    } else if ('createdAt' in filters) {
      filters.createdAt = {
        $lte: moment(new Date(filters.createdAt))
          .utc()
          .startOf('date')
          .toDate()
      }
    }
    if ('updatedAt' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.updatedAt = {
        $gte: moment(new Date(filters.updatedAt))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.updatedAt))
          .utc()
          .endOf('date')
          .toDate()
      }
    }
    const result = await CommentOnPassenger.aggregate([
      {
        $lookup: {
          from: 'trips',
          localField: 'trip',
          foreignField: '_id',
          as: 'trip'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'passenger',
          foreignField: '_id',
          as: 'passenger'
        }
      },
      {
        $lookup: {
          from: 'drivers',
          localField: 'driver',
          foreignField: '_id',
          as: 'driver'
        }
      },
      { $unwind: '$trip' },
      { $unwind: '$passenger' },
      { $unwind: '$driver' },
      { $match: { ...filters } }
    ])
    return result.length
  }
})(CommentOnPassenger)
