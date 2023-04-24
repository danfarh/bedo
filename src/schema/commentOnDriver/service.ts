import { Types } from 'mongoose'
import _ from 'lodash'
import moment from 'moment'
import CommentOnDriver from './schema'
import driverOrPassengerFilters from '../../utils/driverOrPassengerFilters'
import ServiceBase from '../../utils/serviceBase'
import { Pagination } from '../../utils/interfaces'

export default new (class service extends ServiceBase {
  async getCommentsOnDriverByAdmin(
    filters: any = {},
    pagination: Pagination = { skip: 0, limit: 15 },
    sort: { createdAt?: Number; updatedAt?: Number; userComment?: Number } = { createdAt: -1 }
  ) {
    if ('_id' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters._id = Types.ObjectId(filters._id)
    }

    if ('userComment' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.userComment = new RegExp(filters.userComment, 'gi')
    }

    if ('car' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['trip.car'] = Types.ObjectId(filters.car)
      // eslint-disable-next-line no-param-reassign
      filters = _.omit(filters, 'car')
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

    return CommentOnDriver.aggregate([
      {
        $lookup: {
          from: 'trips',
          let: { trip_id: '$trip' },
          pipeline: [{ $match: { $expr: { $eq: ['$$trip_id', '$_id'] } } }],
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
      {
        $project: {
          _id: 1,
          userComment: 1,
          readyComments: 1,
          trip: '$trip._id',
          driver: 1,
          passenger: 1,
          createdAt: 1,
          updatedAt: 1
        }
      },
      { $sort: { ...sort } },
      { $skip: pagination.skip },
      { $limit: pagination.limit }
    ])
  }

  async getCommentsOnDriverByAdminCount(filters: any = {}) {
    if ('_id' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters._id = Types.ObjectId(filters._id)
    }

    if ('userComment' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.userComment = new RegExp(filters.userComment, 'gi')
    }

    if ('car' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['trip.car'] = Types.ObjectId(filters.car)
      // eslint-disable-next-line no-param-reassign
      filters = _.omit(filters, 'car')
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

    const result = await CommentOnDriver.aggregate([
      {
        $lookup: {
          from: 'trips',
          let: { trip_id: '$trip' },
          pipeline: [{ $match: { $expr: { $eq: ['$$trip_id', '$_id'] } } }],
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
})(CommentOnDriver)
