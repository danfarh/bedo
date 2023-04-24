// database request
import { Types } from 'mongoose'
import * as _ from 'lodash'
import bcrypt from 'bcryptjs'
import moment from 'moment'
import ServiceBase from '../../utils/serviceBase'
import Driver from './schema'
import { HASH_SALT } from '../../config'
import { Pagination } from '../../utils/interfaces'
import driver from '.'

export default new (class service extends ServiceBase {
  async find(
    filters: Object = {},
    pagination: Pagination = {
      skip: 0,
      limit: 15
    },
    sort: Object = { createdAt: -1 }
  ) {
    return Driver.aggregate([
      { $match: { ...filters } },
      { $sort: { ...sort } },
      { $skip: pagination.skip },
      { $limit: pagination.limit }
    ]).allowDiskUse(true)
  }

  async findById(id) {
    return Driver.findById(id).exec()
  }

  async findOneWithCars(whereCondition: Object) {
    return Driver.findOne(whereCondition)
      .populate('car')
      .exec()
  }

  async findOneByPhoneNumber(phoneNumber: String) {
    const driver = await Driver.findOne({ phoneNumber }).exec()
    return driver
  }

  async findByEmail(email: String) {
    const driver = await Driver.findOne({ email: String(email).toLowerCase() }).exec()
    return driver
  }

  async changePassword(value: String, password: String, type: String) {
    const passwordHash = await bcrypt.hash(String(password), HASH_SALT)
    if (type === 'phoneNumber') {
      const driver = await Driver.findOneAndUpdate(
        { phoneNumber: value },
        {
          $set: { passwordHash }
        },
        {
          new: true
        }
      ).exec()
      return driver
    }
    const driver = await Driver.findOneAndUpdate(
      { email: value },
      {
        $set: { passwordHash }
      },
      {
        new: true
      }
    ).exec()
    return driver
  }

  async setWorkDriverStatus(id: Types.ObjectId, status: string) {
    return Driver.findOneAndUpdate(
      {
        _id: id
      },
      {
        $set: { workStatus: status }
      },
      {
        new: true
      }
    ).exec()
  }

  async update(_id: Types.ObjectId, data: object) {
    const driver = await Driver.findOneAndUpdate({ _id }, data, { new: true })
    return driver
  }

  async addCar(_id: Types.ObjectId, carId: Types.ObjectId) {
    await Driver.findOneAndUpdate(
      { _id },
      {
        $push: {
          car: carId
        }
      },
      {
        new: true
      }
    )
  }

  async removeCar(_id, carId) {
    const driver = await Driver.findOneAndUpdate(
      { _id },
      {
        $pull: {
          car: carId
        }
      },
      {
        new: true
      }
    )
    return driver
  }

  async getDriversVerificationRequestsByAdmin(
    filters: any = {},
    pagination: any = { skip: 0, limit: 15 },
    sort: any = { createdAt: -1 }
  ) {
    if (filters.status) {
      filters['lastVerificationRequest.status'] = filters.status
      filters = _.omit(filters, 'status')
    }
    if (filters.phoneNumber) {
      filters.phoneNumber = new RegExp(filters.phoneNumber, 'gi')
      filters = _.omit(filters, 'phoneNumber')
    }
    if (filters.fullName) {
      filters.fullName = new RegExp(filters.fullName, 'gi')
      filters = _.omit(filters, 'fullName')
    }
    if (filters.rejectionMessage) {
      filters['lastVerificationRequest.rejectionMessage'] = new RegExp(
        filters.rejectionMessage,
        'gi'
      )
      filters = _.omit(filters, 'rejectionMessage')
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

    if (filters._id) {
      filters._id = Types.ObjectId(filters._id)
    }

    if (sort.submitDate) {
      sort = {
        'lastVerificationRequest.submitDate': sort.submitDate
      }
    }
    if (sort.responseDate) {
      sort = {
        'lastVerificationRequest.responseDate': sort.responseDate
      }
    }
    filters.verificationRequests = { $exists: true, $ne: [] }
    return Driver.aggregate([
      { $addFields: { lastVerificationRequest: { $arrayElemAt: ['$verificationRequests', -1] } } },
      { $match: { isVerified: false, ...filters } },
      { $sort: sort },
      { $skip: pagination && pagination.skip ? pagination.skip : 0 },
      { $limit: pagination && pagination.limit ? pagination.limit : 15 }
    ])
  }

  async getDriversVerificationRequestsCountByAdmin(filters: any = {}) {
    if (filters.status) {
      filters['lastVerificationRequest.status'] = filters.status
      filters = _.omit(filters, 'status')
    }
    if (filters.rejectionMessage) {
      filters['lastVerificationRequest.rejectionMessage'] = new RegExp(
        filters.rejectionMessage,
        'gi'
      )
      filters = _.omit(filters, 'rejectionMessage')
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
    filters.verificationRequests = { $exists: true, $ne: [] }
    const result = await Driver.aggregate([
      { $addFields: { lastVerificationRequest: { $arrayElemAt: ['$verificationRequests', -1] } } },
      { $match: { isVerified: false, ...filters } }
    ])
    return result.length
  }
})(Driver)
