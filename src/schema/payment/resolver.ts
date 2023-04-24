import controller from './controller'
import ResolverBase from '../../utils/resolverBase'
import userService from '../user/service'
import shopService from '../shop/service'
import tripService from '../trip/service'
import orderService from '../order/service'
import driverService from '../driver/service'
import transactionService from '../transaction/service'

const resolverBase = new ResolverBase(controller)

const resolver = {
  Query: {
    getPaymentMethodStatus: async (parent, _, { user }) => {
      return controller.getPaymentMethodStatus(user)
    },
    getPayments: async (parent, { filters, pagination }, { user }) => {
      return controller.getPayments(user.sub, filters, pagination)
    },
    getFailedPayments: async (parent, { pagination }, { user }) => {
      return controller.getFailedPayments(user.sub, pagination)
    },
    getPayment: async (parent, { _id }, { user }) => {
      return controller.getPayment(_id)
    },
    getPaymentsCount: resolverBase.queryIfUserIdEqualsTo('user', true).count,
    getDriverPayments: async (parent, { pagination, filters }, { user }) => {
      return controller.getDriverPayments(user.sub, pagination, filters)
    },
    getDriverPayment: async (parent, { _id }, { user }) => {
      return controller.getDriverPayment(_id, user.sub)
    },
    getShopPayments: async (parent, { filters, pagination, sort }, { user }) => {
      return controller.getShopPayments(user.shop, filters, pagination, sort)
    },
    getShopPaymentsCount: async (parent, { filters }, { user }) => {
      return controller.getShopPaymentsCount(user.shop, filters)
    },
    getShopPayment: async (parent, { _id }, { user }) => {
      return controller.getShopPayment(_id, user.shop)
    },
    getPaymentsByAdmin: async (parent, { filters, pagination, sort }) => {
      return controller.getPaymentsByAdmin(filters, pagination, sort)
    },
    getPaymentsByAdminCount: async (parent, { filters }) => {
      return controller.getPaymentsByAdminCount(filters)
    },
    getPaymentTakingsByAdmin: async (parent, { filters, withDetail }) => {
      return controller.getPaymentTakingsByAdmin(filters, withDetail)
    },
    getDriverPaymentDetailByAdmin: async (parent, { filters, withDetail }) => {
      return controller.getPaymentsDetailByAdmin(filters, withDetail, 'PAY_FROM_USER_TO_DRIVER')
    },
    getShopPaymentDetailByAdmin: async (parent, { filters, withDetail }) => {
      return controller.getPaymentsDetailByAdmin(filters, withDetail, 'PAY_FROM_BEDO_TO_SHOP')
    },
    checkLastPayment: async (parent, args, { user }, info) => {
      return controller.checkLastPayment(user)
    },
    getPaymentInfoByAdmin: async (parent, { type, filters, pagination }, { user }) => {
      return controller.getPaymentInfoByAdmin(type, filters, pagination)
    },
    getPaymentInfoByAdminCount: async (parent, { type, filters }) => {
      return controller.getPaymentInfoByAdminCount(type, filters)
    },
    getBedoTotalPaymentByAdmin: async (parent, { user }) => {
      return controller.getBedoTotalPaymentByAdmin()
    }
  },
  Mutation: {
    createPayment: resolverBase.mutationIfUserIsAdmin().create,
    updatePayment: resolverBase.mutationIfUserIsAdmin().update,
    deletePayment: resolverBase.mutationIfUserIsAdmin().delete,
    manualResolvePayment: async (parent, { _id }, { user }) => {
      return controller.manualResolvePayment(_id)
    },
    updatePaymentTypeByAdmin: resolverBase.mutationIfUserIsAdmin().update
  },
  Payment: {
    user: async (parent, args, context, info) => {
      return userService.findById(parent.user)
    },
    shop: async parent => {
      return shopService.findById(parent.shop)
    },
    order: async parent => {
      return orderService.findById(parent.order)
    },
    trip: async parent => {
      return tripService.findById(parent.trip)
    },
    transactionId: async parent => {
      return transactionService.findById(parent.transactionId)
    },
    driver: async parent => {
      return driverService.findById(parent.driver)
    }
  }
}

export default resolver
