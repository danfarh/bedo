import { Types } from 'mongoose'
import { ApolloError } from 'apollo-server-express'
import Model from './schema'
import orderPromotionModel from '../orderPromotion/schema'
import serviceBase from '../../utils/serviceBase'

export default new (class service extends serviceBase {
  async usedPromotionExist(promotion: any, user: Types.ObjectId, usedFor: Types.ObjectId) {
    if (promotion) {
      const usedOrderPromotion = await Model.findOne({
        promotion: promotion._id,
        user,
        ...(usedFor && { usedFor })
      })
      if (usedOrderPromotion) return true
      return false
    }
    throw new ApolloError('promotion not found', '404')
  }

  async usedPromotionCount(promotion: any, user: Types.ObjectId, usedFor: Types.ObjectId) {
    if (promotion) {
      const usedOrderPromotionCount = await Model.countDocuments({
        promotion: promotion._id,
        user,
        ...(usedFor && { usedFor })
      })
      return usedOrderPromotionCount
    }
    throw new ApolloError('promotion not found', '404')
  }
})(Model)
