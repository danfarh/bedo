import { Types } from 'mongoose'
import Model from './schema'
import tripModel from '../trip/schema'
import serviceBase from '../../utils/serviceBase'
import user from '../user'

export default new (class service extends serviceBase {
  async getHistory(user: any, filters: any, pagination: any) {
    return true // TODO
    //   return cartModel.aggregate([
    //     {
    //       $lookup: {
    //         from: 'orders',
    //         let: { cart_id: '$_id' },
    //         pipeline: [{ $match: { $expr: { $eq: ['$$cart_id', '$cart'] } } }],
    //         as: 'orders'
    //       }
    //     },
    //     {
    //       $match: {
    //         ...filters,
    //         user: Types.ObjectId(user.sub),
    //         rootCategory: Types.ObjectId(filters.category)
    //       }
    //     },
    //     { $unwind: { path: '$orders' } },
    //     { $replaceRoot: { newRoot: '$orders' } },
    //     { $skip: pagination.$skip },
    //     { $limit: pagination.$limit }
    //   ])
  }

  async getLastTripOrder(passenger: any) {
    return Model.findOne({ user: passenger.userId })
      .sort('-createdAt')
      .limit(1)
      .exec()
  }

  async getTripOrdersDetail(filters: Object, sort) {
    const tripOrders = await this.model.aggregate([
      {
        $lookup: {
          from: 'trips',
          localField: 'trip',
          foreignField: '_id',
          as: 'trip'
        }
      },
      { $unwind: '$trip' },
      {
        $match: {
          'trip.driver': {
            $exists: true
          }
        }
      },
      { $match: { ...filters } },
      { $sort: sort }
    ])
    const report = {
      commissionForSpark: 0,
      userTakings: 0,
      driversIncome: 0,
      numberOfTrips: tripOrders.length
    }
    // eslint-disable-next-line no-restricted-syntax
    for (const order of tripOrders) {
      report.commissionForSpark = +(report.commissionForSpark + order.commission).toFixed(2)
      report.userTakings = +(report.userTakings + order.trip.cost).toFixed(2)
      report.driversIncome = +(report.driversIncome + order.trip.driverTotalPrice).toFixed(2)
      order.trip = order.trip._id
    }
    return {
      tripOrders,
      ...report
    }
  }
})(Model)
