/* eslint-disable no-lonely-if */
import { ApolloError } from 'apollo-server-express'
import { Types } from 'mongoose'
import _ from 'lodash'
import service from './service'
import tripService from '../trip/service'
import tripPromotionService from '../tripPromotion/service'

export default new (class Controller {
  async use(
    trip: any,
    tripPromotion: any,
    usedFor: Types.ObjectId | null,
    user: any,
    onlyCalculate: Boolean,
    cost: number | null
  ) {
    if (tripPromotion.condition === 'TIMELY') {
      const currentTime = Date.now()
      const from = new Date(tripPromotion.from).getTime()
      const to = new Date(tripPromotion.to).getTime()
      if (currentTime >= from && currentTime <= to) {
        if (onlyCalculate) {
          if (tripPromotion.type === 'FIXED') {
            if (cost && tripPromotion.maximumPromotion >= cost) {
              return {
                tripPrice: 0
              }
            }
            return {
              tripPrice: Number(cost) - Number(tripPromotion.maximumPromotion)
            }
          }
          if (
            (Number(cost) * Number(tripPromotion.percent)) / 100 >=
            Number(tripPromotion.maximumPromotion)
          ) {
            if (cost && tripPromotion.maximumPromotion >= cost) {
              return {
                tripPrice: 0
              }
            }
            return {
              tripPrice: Number(cost) - Number(tripPromotion.maximumPromotion)
            }
          }
          return {
            tripPrice: Number(cost) * (1 - Number(tripPromotion.percent) / 100)
          }
        }
        if (user.userId && usedFor && trip.passenger === user.userId) {
          if (
            Number(await service.usedPromotionCount(tripPromotion, user.userId)) <
            Number(tripPromotion.useLimitCount)
          ) {
            const tripPromotionUsed = await service.create({
              promotion: tripPromotion._id,
              user: user.userId,
              usedFor
            })
            if (tripPromotionUsed) {
              if (tripPromotion.type === 'FIXED') {
                if (cost && tripPromotion.maximumPromotion >= cost) {
                  return {
                    tripPrice: 0
                  }
                }
                return {
                  tripPrice: Number(cost) - Number(tripPromotion.maximumPromotion)
                }
              }
              if (
                (Number(cost) * Number(tripPromotion.percent)) / 100 >=
                Number(tripPromotion.maximumPromotion)
              ) {
                if (cost && tripPromotion.maximumPromotion >= cost) {
                  return {
                    tripPrice: 0
                  }
                }
                return {
                  tripPrice: Number(cost) - Number(tripPromotion.maximumPromotion)
                }
              }
              return {
                tripPrice: Number(cost) * (1 - Number(tripPromotion.percent) / 100)
              }
            }
          } else {
            throw new ApolloError('this promotion is used for this trip.', '403')
          }
        } else {
          throw new ApolloError('this promotion is not for you.', '403')
        }
      } else {
        throw new ApolloError('time is out for this promotion', '403')
      }
    } else {
      if (onlyCalculate) {
        if (tripPromotion.type === 'FIXED') {
          if (cost && tripPromotion.maximumPromotion >= cost) {
            return {
              tripPrice: 0
            }
          }
          return {
            tripPrice: Number(cost) - Number(tripPromotion.maximumPromotion)
          }
        }
        if (
          (Number(cost) * Number(tripPromotion.percent)) / 100 >=
          Number(tripPromotion.maximumPromotion)
        ) {
          if (cost && tripPromotion.maximumPromotion >= cost) {
            return {
              tripPrice: 0
            }
          }
          return {
            tripPrice: Number(cost) - Number(tripPromotion.maximumPromotion)
          }
        }
        return {
          tripPrice: Number(cost) * (1 - Number(tripPromotion.percent) / 100)
        }
      }
      if (user.userId && usedFor && String(trip.passenger) === String(user.userId)) {
        if (
          Number(await service.usedPromotionCount(tripPromotion, user.userId)) <
          Number(tripPromotion.useLimitCount)
        ) {
          const tripPromotionUsed = await service.create({
            promotion: tripPromotion._id,
            user: user.userId,
            usedFor
          })
          if (tripPromotionUsed) {
            if (tripPromotion.type === 'FIXED') {
              if (cost && tripPromotion.maximumPromotion >= cost) {
                return {
                  tripPrice: 0
                }
              }
              return {
                tripPrice: Number(cost) - Number(tripPromotion.maximumPromotion)
              }
            }
            if (
              (Number(cost) * Number(tripPromotion.percent)) / 100 >=
              Number(tripPromotion.maximumPromotion)
            ) {
              if (cost && tripPromotion.maximumPromotion >= cost) {
                return {
                  tripPrice: 0
                }
              }
              return {
                tripPrice: Number(cost) - Number(tripPromotion.maximumPromotion)
              }
            }
            return {
              tripPrice: Number(cost) * (1 - Number(tripPromotion.percent) / 100)
            }
          }
        } else {
          throw new ApolloError('this promotion is used for this trip', '403')
        }
      } else {
        throw new ApolloError('this promotion is not for you.', '403')
      }
    }
  }

  async usePromotion(
    promotionCode: string,
    usedFor: any | null,
    user: any,
    onlyCalculate: Boolean,
    cost: number | null
  ): Promise<any> {
    const trip = usedFor || null
    let tripPromotion = await tripPromotionService.findOne({ promotionCode })
    if (!tripPromotion) tripPromotion = await tripPromotionService.findById(promotionCode)
    if (tripPromotion) {
      const { canUse, canNotUse } = tripPromotion
      const canUseIndex = _.findIndex(canUse, o => String(o) === String(user.userId))
      const canNotUseIndex = _.findIndex(canNotUse, o => String(o) === String(user.userId))
      if (canUse.length === 0 && canNotUse.length !== 0) {
        if (canNotUseIndex === -1) {
          if (trip) {
            if (trip.tripType === tripPromotion.for || tripPromotion.for === 'ALL') {
              return this.use(trip, tripPromotion, usedFor, user, onlyCalculate, cost)
            }
            throw new ApolloError('trip type and promotion type not match', '400')
          }
          if (onlyCalculate) {
            if (trip.tripType === tripPromotion.for || tripPromotion.for === 'ALL') {
              return this.use(trip, tripPromotion, usedFor, user, onlyCalculate, cost)
            }
            throw new ApolloError('trip type and promotion type not match', '400')
          }
          throw new ApolloError('trip not found', '404')
        } else {
          throw new ApolloError('this user can not use this promotion', '403')
        }
      } else if (canUse.length !== 0 && canNotUse.length === 0) {
        if (canUseIndex !== -1) {
          if (trip) {
            if (trip.tripType === tripPromotion.for || tripPromotion.for === 'ALL') {
              return this.use(trip, tripPromotion, usedFor, user, onlyCalculate, cost)
            }
            throw new ApolloError('trip type and promotion type not match', '400')
          }
          if (onlyCalculate) {
            if (trip.tripType === tripPromotion.for || tripPromotion.for === 'ALL') {
              return this.use(trip, tripPromotion, usedFor, user, onlyCalculate, cost)
            }
            throw new ApolloError('trip type and promotion type not match', '400')
          }
          throw new ApolloError('trip not found', '404')
        } else {
          throw new ApolloError('this user can not use this promotion', '403')
        }
      } else if (canUse.length !== 0 && canNotUse.length !== 0) {
        if (canUseIndex !== -1 && canNotUseIndex === -1) {
          if (trip) {
            if (trip.tripType === tripPromotion.for || tripPromotion.for === 'ALL') {
              return this.use(trip, tripPromotion, usedFor, user, onlyCalculate, cost)
            }
            throw new ApolloError('trip type and promotion type not match', '400')
          }
          if (onlyCalculate) {
            if (trip.tripType === tripPromotion.for || tripPromotion.for === 'ALL') {
              return this.use(trip, tripPromotion, usedFor, user, onlyCalculate, cost)
            }
            throw new ApolloError('trip type and promotion type not match', '400')
          }
          throw new ApolloError('trip not found', '404')
        } else {
          throw new ApolloError('this user can not use this promotion', '403')
        }
      } else {
        if (trip) {
          if (trip.tripType === tripPromotion.for || tripPromotion.for === 'ALL') {
            return this.use(trip, tripPromotion, usedFor, user, onlyCalculate, cost)
          }
          throw new ApolloError('trip type and promotion type not match', '400')
        }
        if (onlyCalculate) {
          if (trip.tripType === tripPromotion.for || tripPromotion.for === 'ALL') {
            return this.use(trip, tripPromotion, usedFor, user, onlyCalculate, cost)
          }
          throw new ApolloError('trip type and promotion type not match', '400')
        }
        throw new ApolloError('trip not found', '404')
      }
    } else {
      throw new ApolloError('this promotion does not exist', '404')
    }
  }

  async calculatePromotionDiscount(promotion, userId, checkOnly = true, price) {
    let discount = 0
    if (promotion) {
      const usedPromotionsCount = await service.usedPromotionCount(promotion, userId)
      if (promotion.condition === 'TIMELY' || promotion.condition === 'PERCENTAGE') {
        const currentTime = Date.now()
        const from = new Date(promotion.from).getTime()
        const to = new Date(promotion.to).getTime()

        if (currentTime >= from && currentTime <= to) {
          if (promotion.useLimitCount && usedPromotionsCount < promotion.useLimitCount) {
            let orderPromotionUsed

            if (checkOnly || orderPromotionUsed) {
              if (promotion.type === 'FIXED') {
                discount = Number(promotion.maximumPromotion)
              } else {
                discount = price * 0.01 * Number(promotion.percent)
                if (discount > promotion.maximumPromotion) {
                  discount = Number(promotion.maximumPromotion)
                }
              }
              if (discount >= price) discount = price
            }
          } else {
            throw new ApolloError('this promotion is used for this trip', '403')
          }
        }
      } else if (promotion.condition === 'FIRST_ORDER') {
        const userHasAnyOrder = await tripService.findOne({
          ...(promotion.shop && { shop: promotion.shop }),
          user: userId
        })
        if (
          !userHasAnyOrder &&
          promotion.useLimitCount &&
          usedPromotionsCount < promotion.useLimitCount
        ) {
          let orderPromotionUsed

          if (checkOnly || orderPromotionUsed) {
            if (promotion.type === 'FIXED') {
              discount = Number(promotion.maximumPromotion)
            } else {
              discount = price * 0.01 * Number(promotion.percent)
              if (discount > promotion.maximumPromotion) {
                discount = Number(promotion.maximumPromotion)
              }
            }
            if (discount >= price) discount = price
          }
        } else {
          throw new ApolloError('this promotion is used for this trip', '403')
        }
      }
    }
    return discount
  }

  async checkPromotion(promotionCode: string, tripType: String, user: any, totalPrice) {
    const tripPromotion = await tripPromotionService.findOne({ promotionCode })
    const returnTripPromotion = _.pick(
      tripPromotion,
      '_id',
      'condition',
      'type',
      'percent',
      'for',
      'maximumPromotion',
      'promotionCode'
    )
    if (tripPromotion) {
      if (tripType !== tripPromotion.for && tripPromotion.for !== 'ALL') {
        throw new ApolloError('trip type and promotion type not match', '400')
      }
      const promotionDiscount = await this.calculatePromotionDiscount(
        tripPromotion,
        user.userId,
        true,
        totalPrice
      )
      returnTripPromotion.promotionDiscount = promotionDiscount
      returnTripPromotion.priceAfterDiscount = totalPrice - promotionDiscount
      const { canUse, canNotUse } = tripPromotion
      const canUseIndex = _.findIndex(canUse, o => String(o) === String(user.userId))
      const canNotUseIndex = _.findIndex(canNotUse, o => String(o) === String(user.userId))
      if (tripPromotion.maximumPromotion) {
        if (tripPromotion.condition === 'TIMELY') {
          const currentTime = Date.now()
          const from = new Date(tripPromotion.from).getTime()
          const to = new Date(tripPromotion.to).getTime()
          if (currentTime >= from && currentTime <= to) {
            if (
              Number(await service.usedPromotionCount(tripPromotion, user.userId)) <
              Number(tripPromotion.useLimitCount)
            ) {
              if (canUse.length === 0 && canNotUse.length === 0) {
                return returnTripPromotion
              }
              if (canUse.length === 0 && canNotUse.length !== 0) {
                if (canNotUseIndex === -1) {
                  return returnTripPromotion
                }
                throw new ApolloError('this promotion is not for you.', '403')
              }
              if (canUse.length !== 0 && canNotUse.length === 0) {
                if (canUseIndex !== -1) {
                  return returnTripPromotion
                }
                throw new ApolloError('this promotion is not for you.', '403')
              }
              if (canNotUseIndex === -1 && canUseIndex !== -1) {
                return returnTripPromotion
              }
              throw new ApolloError('this promotion is not for you.', '403')
            }
            throw new ApolloError('this promotion has been used before.', '403')
          }
          throw new ApolloError('time is out for this promotion.', '403')
        } else {
          if (
            Number(await service.usedPromotionCount(tripPromotion, user.userId)) <
            Number(tripPromotion.useLimitCount)
          ) {
            if (canUse.length === 0 && canNotUse.length === 0) {
              return returnTripPromotion
            }
            if (canUse.length === 0 && canNotUse.length !== 0) {
              if (canNotUseIndex === -1) {
                return returnTripPromotion
              }
              throw new ApolloError('this promotion is not for you.', '403')
            }
            if (canUse.length !== 0 && canNotUse.length === 0) {
              if (canUseIndex !== -1) {
                return returnTripPromotion
              }
              throw new ApolloError('this promotion is not for you.', '403')
            }
            if (canNotUseIndex === -1 && canUseIndex !== -1) {
              return returnTripPromotion
            }
            throw new ApolloError('this promotion is not for you.', '403')
          } else {
            throw new ApolloError('this promotion has been used before.', '403')
          }
        }
      } else {
        if (tripPromotion.condition === 'TIMELY') {
          const currentTime = Date.now()
          const from = new Date(tripPromotion.from).getTime()
          const to = new Date(tripPromotion.to).getTime()
          if (currentTime >= from && currentTime <= to) {
            if (
              Number(await service.usedPromotionCount(tripPromotion, user.userId)) <
              Number(tripPromotion.useLimitCount)
            ) {
              if (canUse.length === 0 && canNotUse.length === 0) {
                return returnTripPromotion
              }
              if (canUse.length === 0 && canNotUse.length !== 0) {
                if (canNotUseIndex === -1) {
                  return returnTripPromotion
                }
                throw new ApolloError('this promotion is  not for you.', '403')
              }
              if (canUse.length !== 0 && canNotUse.length === 0) {
                if (canUseIndex !== -1) {
                  return returnTripPromotion
                }
                throw new ApolloError('this promotion is not for you.', '403')
              }
              if (canNotUseIndex === -1 && canUseIndex !== -1) {
                return returnTripPromotion
              }
              throw new ApolloError('this promotion is not for you.', '403')
            } else {
              throw new ApolloError('this promotion has been used before.', '403')
            }
          } else {
            throw new ApolloError('time is out for this promotion.', '403')
          }
        } else {
          console.log({
            usedPromotion: await service.usedPromotionCount(tripPromotion, user.userId),
            limitCount: tripPromotion.useLimitCount
          })
          if (
            Number(await service.usedPromotionCount(tripPromotion, user.userId)) <
            Number(tripPromotion.useLimitCount)
          ) {
            if (canUse.length === 0 && canNotUse.length === 0) {
              return returnTripPromotion
            }
            if (canUse.length === 0 && canNotUse.length !== 0) {
              if (canNotUseIndex === -1) {
                return returnTripPromotion
              }
              throw new ApolloError('this promotion is not for you.', '403')
            }
            if (canUse.length !== 0 && canNotUse.length === 0) {
              if (canUseIndex !== -1) {
                return returnTripPromotion
              }
              throw new ApolloError('this promotion is not for you.', '403')
            }
            if (canNotUseIndex === -1 && canUseIndex !== -1) {
              return returnTripPromotion
            }
            throw new ApolloError('this promotion is not for you.', '403')
          } else {
            throw new ApolloError('this promotion has been used before.', '403')
          }
        }
      }
    }
    throw new ApolloError('this promotion not found.', '404')
  }
})()
