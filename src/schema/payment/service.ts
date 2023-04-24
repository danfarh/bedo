import { Types } from 'mongoose'
import moment from 'moment'
import Model from './schema'
import serviceBase from '../../utils/serviceBase'
import { getConstantValue } from '../../utils/redis'

export default new (class service extends serviceBase {
  async findWithoutPagination(filters = {}) {
    return this.model.find(filters)
  }

  async multiplePaymentsChange(ids, transactionId, status = 'PAID') {
    ids.forEach(async _id => {
      await this.findOneAndUpdate({ _id }, { status, transactionId })
    })
  }

  async getUnpaidOrFailedPayToShop() {
    const PAYMENT_INTERVAL_IN_HOURS = await getConstantValue('PAYMENT_INTERVAL_IN_HOURS', 12)
    const type = 'PAY_FROM_USER_TO_SHOP'
    return this.find({
      createdAt: {
        $lte: moment()
          .subtract(PAYMENT_INTERVAL_IN_HOURS, 'hours')
          // .subtract(5, 'minutes')
          .utc()
          .toDate()
      },
      type,
      status: {
        $in: ['FAILED', 'UNPAID']
      }
    })
  }

  async getUnpaidOrFailedPayToDriver() {
    const PAYMENT_INTERVAL_IN_HOURS = await getConstantValue('PAYMENT_INTERVAL_IN_HOURS', 12)
    const type = 'PAY_FROM_USER_TO_DRIVER'
    return this.find({
      createdAt: {
        $lte: moment()
          .subtract(PAYMENT_INTERVAL_IN_HOURS, 'hours')
          // .subtract(5, 'minutes')
          .utc()
          .toDate()
      },
      type,
      status: {
        $in: ['FAILED', 'UNPAID']
      }
    })
  }
})(Model)
