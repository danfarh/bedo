import { ApolloError } from 'apollo-server-express'
import { Types } from 'mongoose'
import service from './service'
import ControllerBase from '../../utils/controllerBase'
import calculation from '../../utils/calculation'
import { RedisDelete, getConstantValue } from '../../utils/redis'

export default new (class Controller extends ControllerBase {
  async updateConstantByAdmin(filters: Object, data: Object) {
    const { value, description }: any = data
    const { attribute }: any = filters
    if (!value || !description || !attribute) {
      throw new ApolloError('inputs cannot be empty', '400')
    }
    const constantCheckCash = await getConstantValue('TRIP_PAYMENT_CASH')
    const constantCheckCredit = await getConstantValue('TRIP_PAYMENT_CREDIT')
    if (
      (constantCheckCash === false && constantCheckCredit === false) ||
      (value === 'false' && attribute === 'TRIP_PAYMENT_CASH' && constantCheckCredit === false) ||
      (value === 'false' && attribute === 'TRIP_PAYMENT_CREDIT' && constantCheckCash === false)
    ) {
      throw new ApolloError('constantCash and constantCredit can not be false', '403')
    }
    const constant = await service.findOneAndUpdate(filters, data)
    if (!constant) {
      throw new ApolloError('constant does not exists', '400')
    }
    await RedisDelete('constants')
    await calculation.insertConstantsToRedis()
    return constant
  }

  async getPaymentMethodsStatus() {
    const tripCashStatus: any = await getConstantValue('TRIP_PAYMENT_CASH')
    const tripCreditStatus: any = await getConstantValue('TRIP_PAYMENT_CREDIT')
    const result = {
      isCashMethodActive: tripCashStatus,
      isCreditMethodActive: tripCreditStatus
    }
    return result
  }

  async getConstantsByAdmin(filters: any = {}, pagination, sort) {
    if ('attribute' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.attribute = new RegExp(filters.attribute, 'gi')
    }

    if ('description' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.description = new RegExp(filters.description, 'gi')
    }
    return service.find(filters, pagination, sort)
  }

  async getConstantsByAdminCount(filters: any = {}) {
    if ('attribute' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.attribute = new RegExp(filters.attribute, 'gi')
    }
    if ('description' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.description = new RegExp(filters.description, 'gi')
    }

    return service.count(filters)
  }

  async getConstant(id: Types.ObjectId) {
    const constant = await service.findById(id)
    if (!constant) {
      throw new ApolloError('constant does not exists', '400')
    }
    return constant
  }
})(service)
