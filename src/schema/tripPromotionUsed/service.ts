// database request
import { ApolloError } from 'apollo-server-express'
import { Types } from 'mongoose'
import ServiceBase from '../../utils/serviceBase'
import UsedTripPromotion from './schema'

export default new (class service extends ServiceBase {
  async usedPromotionCount(promotion: any, user: Types.ObjectId) {
    if (promotion) {
      const usedTripPromotion = await UsedTripPromotion.find({
        promotion: promotion._id,
        user
      })
      if (usedTripPromotion) return usedTripPromotion.length
      return 0
    }
    throw new ApolloError('promotion not found', '404')
  }
})(UsedTripPromotion)
