import { Types } from 'mongoose'
import { ApolloError } from 'apollo-server-express'
import commentOnDriverService from './service'
import tripService from '../trip/service'
import checkThatUserExists from '../../utils/checkIfUserExists'
import driverService from '../driver/service'
import driverReadyCommentsService from '../driverReadyComments/service'
import tripOrderService from '../tripOrder/service'
import { Pagination } from '../../utils/interfaces'

export default new (class Controller {
  async getCommentsOnDriver(user: any, filters: Object, pagination: any) {
    checkThatUserExists(user)
    return commentOnDriverService.find(
      {
        ...filters,
        passenger: user.sub
      },
      pagination
    )
  }

  async getCommentOnDriver(user: any, _id: String) {
    checkThatUserExists(user)
    const commentOnDriver = await commentOnDriverService.findOne({
      _id,
      passenger: user.sub
    })

    if (!commentOnDriver) {
      throw new ApolloError('commentOnDriver not found', '400')
    }
    return commentOnDriver
  }

  async getTotalCommentsOnDriver(user: any, filters: Object) {
    checkThatUserExists(user)
    return commentOnDriverService.count({
      ...filters,
      passenger: user.sub
    })
  }

  async createCommentOnDriver(user: any, inputs: any) {
    checkThatUserExists(user)
    if (!inputs.readyComments && !inputs.userComment) {
      throw new ApolloError('invalid input', '400')
    }
    if (inputs.readyComments) {
      if (!inputs.readyComments.length) {
        throw new ApolloError('invalid input', '400')
      }
    }
    const trip = await tripService.findOne({
      passenger: user.userId,
      _id: inputs.trip
    })
    if (!trip) {
      throw new ApolloError('trip  does not exists', '400')
    }
    if (!trip.ended) {
      throw new ApolloError('trip is not ended', '400')
    }

    const driver: any = await driverService.findById(trip.driver)

    if (!driver) {
      throw new ApolloError('driver not found', '400')
    }

    const alreadyExistingCommentForThisTrip = await commentOnDriverService.findOne({
      trip: trip._id
    })

    if (alreadyExistingCommentForThisTrip) {
      throw new ApolloError('you already submitted a comment for this trip', '400')
    }

    if (inputs.readyComments && inputs.readyComments.length) {
      const dbReadyCommentsCount = await driverReadyCommentsService.count({
        _id: { $in: inputs.readyComments.map(i => i.readyComment) }
      })
      if (dbReadyCommentsCount !== inputs.readyComments.length) {
        throw new ApolloError('some of ready comments not found', '400')
      }
    }
    const tripOrder = await tripOrderService.findOneAndUpdate(
      {
        commented: { $eq: 'NOT_COMMENTED' },
        // finished: true,
        trip: trip._id
      },
      { commented: 'COMMENTED' }
    )

    if (!tripOrder) {
      throw new ApolloError('trip does not exists')
    }

    const commentOnDriver = await commentOnDriverService.create({
      trip: trip._id,
      driver: trip.driver,
      passenger: trip.passenger,
      readyComments: inputs.readyComments,
      userComment: inputs.userComment
    })

    if (inputs.readyComments && inputs.readyComments.length) {
      const allRates = inputs.readyComments
      const ratesLength = allRates.length
      const avgRate = allRates.reduce((sum, item) => sum + item.rate, 0) / ratesLength
      const averageRate = (driver.sumRate + avgRate) / (driver.numberOfRates + 1)

      await tripService.findOneAndUpdate({ _id: trip._id }, { rate: avgRate })
      await driverService.findOneAndUpdate(trip.driver, {
        averageRate,
        $inc: {
          sumRate: avgRate,
          numberOfRates: 1
        }
      })
    }
    return commentOnDriver
  }

  async skipCommentOnDriver(user: any, inputs: any) {
    checkThatUserExists(user)
    const trip = await tripService.findOne({
      passenger: user.sub,
      _id: inputs.trip
    })
    if (!trip) {
      throw new ApolloError('trip  does not exists', '400')
    }
    if (!trip.ended) {
      throw new ApolloError('trip is not ended', '400')
    }

    const driver: any = await driverService.findById(trip.driver)

    if (!driver) {
      throw new ApolloError('driver not found', '400')
    }

    const alreadyExistingCommentForThisTrip = await commentOnDriverService.findOne({
      trip: trip._id
    })

    if (alreadyExistingCommentForThisTrip) {
      throw new ApolloError('you already submitted a comment for this trip', '400')
    }

    const tripOrder = await tripOrderService.findOneAndUpdate(
      {
        commented: { $eq: 'NOT_COMMENTED' },
        // finished: true,
        trip: trip._id
      },
      { commented: 'SKIPPED' }
    )

    if (!tripOrder) {
      throw new ApolloError('trip does not exists')
    }

    return true
  }

  async getCommentsOnDriverByAdmin(filters: Object, pagination: Pagination, sort: Object) {
    return commentOnDriverService.getCommentsOnDriverByAdmin(filters, pagination, sort)
  }

  async removeCommentOnDriverByAdmin(_id: Types.ObjectId) {
    const comment: any = await commentOnDriverService.findOneAndRemove({ _id })
    if (!comment) {
      throw new ApolloError('your comment does not exists', '400')
    }
    const driver: any = await driverService.findById(comment.driver)

    if (driver) {
      if (comment.readyComments && comment.readyComments.length) {
        if (Number(driver.numberOfRates) > 0 && Number(driver.numberOfRates) !== 1) {
          const allRates = comment.readyComments
          const ratesLength = allRates.length
          const avgRate = allRates.reduce((sum, item) => sum + item.rate, 0) / ratesLength
          const averageRate = (driver.sumRate - avgRate) / (driver.numberOfRates - 1)
          if (Number(driver.sumRate) >= Number(avgRate)) {
            await driverService.findOneAndUpdate(
              { _id: driver._id },
              {
                averageRate,
                $inc: {
                  sumRate: -avgRate,
                  numberOfRates: -1
                }
              }
            )
          }
        } else if (Number(driver.numberOfRates) === 1) {
          await driverService.findOneAndUpdate(
            { _id: driver._id },
            {
              averageRate: 0,
              sumRate: 0,
              numberOfRates: 0
            }
          )
        }
      }
    }
    return {
      message: 'Your comment has been removed'
    }
  }

  async getCommentsOnDriverByAdminCount(filters) {
    return commentOnDriverService.getCommentsOnDriverByAdminCount(filters)
  }

  async getCommentOnDriverByAdmin(id: Types.ObjectId) {
    return commentOnDriverService.findById(id)
  }
})()
