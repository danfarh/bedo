import { Types } from 'mongoose'
import { ApolloError } from 'apollo-server-express'
import service from './service'
import tripService from '../trip/service'
import userService from '../user/service'
import passengerReadyCommentsService from '../passengerReadyComments/service'

export default new (class Controller {
  async getCommentsOnPassenger(driver: any, filters: Object, pagination: any) {
    return service.find(
      {
        ...filters,
        driver: driver.userId
      },
      pagination
    )
  }

  async getCommentOnPassenger(driver: any, _id: String) {
    const commentOnPassenger = await service.findOne({
      _id,
      driver: driver.userId
    })

    if (!commentOnPassenger) {
      throw new ApolloError('comments on passenger not found', '400')
    }
    return commentOnPassenger
  }

  async getTotalCommentsOnPassenger(driver: any, filters: Object) {
    return service.count({
      ...filters,
      driver: driver.userId
    })
  }

  async createCommentOnPassenger(driver: any, input: any) {
    if (!input.readyComments && !input.driverComment) {
      throw new ApolloError('invalid input', '400')
    }

    if (input.readyComments) {
      if (!input.readyComments.length) {
        throw new ApolloError('invalid input', '400')
      }
    }

    const trip = await tripService.findOne({
      driver: driver.userId,
      _id: input.trip
    })
    if (!trip) {
      throw new ApolloError('trip does not exists', '400')
    }
    if (!trip.ended) {
      throw new ApolloError('trip is not ended', '400')
    }

    const user: any = await userService.findById(trip.passenger)

    if (!user) {
      throw new ApolloError('user not found', '400')
    }

    const alreadyExistingCommentForThisTrip = await service.findOne({
      trip: trip._id
    })

    if (alreadyExistingCommentForThisTrip) {
      throw new ApolloError('you already submitted a comment for this trip', '400')
    }

    if (input.readyComments && input.readyComments.length) {
      const dbReadyCommentsCount = await passengerReadyCommentsService.count({
        _id: { $in: input.readyComments.map(i => i.readyComment) }
      })
      if (dbReadyCommentsCount !== input.readyComments.length) {
        throw new ApolloError('some of ready comments not found', '400')
      }
    }

    const commentOnPassenger = await service.create({
      trip: trip._id,
      driver: trip.driver,
      passenger: trip.passenger,
      readyComments: input.readyComments,
      driverComment: input.driverComment
    })
    if (input.readyComments && input.readyComments.length) {
      const allRates = input.readyComments
      const ratesLength = allRates.length
      const avgRate = allRates.reduce((sum, item) => sum + item.rate, 0) / ratesLength
      const averageRate = (user.sumRate + avgRate) / (user.numberOfRates + 1)

      await userService.findOneAndUpdate(trip.passenger, {
        averageRate,
        $inc: {
          sumRate: avgRate,
          numberOfRates: 1
        }
      })
    }
    return commentOnPassenger
  }

  async getCommentsOnPassengerByAdmin(filters: any, pagination: any, sort: any) {
    return service.getCommentsOnPassengerByAdmin(filters, pagination, sort)
  }

  async getCommentOnPassengerByAdmin(id: Types.ObjectId) {
    return service.findById(id)
  }

  async getCommentsOnPassengerByAdminCount(filters: any) {
    return service.getCommentsOnPassengerByAdminCount(filters)
  }

  async removeCommentOnPassengerByAdmin(_id: Types.ObjectId) {
    const comment: any = await service.findOneAndRemove({ _id })
    if (!comment) {
      throw new ApolloError('your comment does not exists', '400')
    }
    const user: any = await userService.findById(comment.passenger)

    if (user) {
      if (comment.readyComments && comment.readyComments.length) {
        if (Number(user.numberOfRates) > 0 && Number(user.numberOfRates) !== 1) {
          const allRates = comment.readyComments
          const ratesLength = allRates.length
          const avgRate = allRates.reduce((sum, item) => sum + item.rate, 0) / ratesLength
          const averageRate = (user.sumRate - avgRate) / (user.numberOfRates - 1)
          if (Number(user.sumRate) >= Number(avgRate)) {
            await userService.findOneAndUpdate(
              { _id: user._id },
              {
                averageRate,
                $inc: {
                  sumRate: -avgRate,
                  numberOfRates: -1
                }
              }
            )
          }
        } else if (Number(user.numberOfRates) === 1) {
          await userService.findOneAndUpdate(
            { _id: user._id },
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
})()
