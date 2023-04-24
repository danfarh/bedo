import controller from './controller'
import userService from '../user/service'
import shopService from '../shop/service'
import driverService from '../driver/service'
import paymentService from '../payment/service'
import service from './service'

const resolver = {
  Query: {
    getTransactions: async (parent, { filters, pagination, sort }, { user }) => {
      return controller.getTransactions(user.sub, filters, pagination, sort)
    },
    getDriverTransactions: async (parent, { filters, pagination, sort }, { user }) => {
      return controller.getDriverTransactions(user.sub, filters, pagination, sort)
    },
    getShopTransactions: async (parent, { filters, pagination, sort }, { user }) => {
      return controller.getShopTransactions(user.shop, filters, pagination, sort)
    },
    getShopTransactionsCount: async (parent, { filters }, { user }) => {
      return controller.getShopTransactionsCount(user.shop, filters)
    },
    getTransactionsByAdmin: async (parent, { filters, pagination, sort }) => {
      return controller.getTransactionsByAdmin(filters, pagination, sort)
    },
    getTransactionsByAdminCount: async (parent, { filters }) => {
      return controller.getTransactionsByAdminCount(filters)
    },
    getTransactionsByShopAdmin: async (parent, { filters, pagination }, { user }) => {
      return controller.getTransactionsByShopAdmin(user, filters, pagination)
    },
    getTotalTransactionsAmountByShopAdmin: async (parent, { info }, { user }) => {
      return controller.getTotalTransactionsAmountByShopAdmin(user)
    }
  },
  Mutation: {
    createTransactionByDriver: async (parent, { payments }, { user }) => {
      return controller.createTransactionByDriver(payments, user.sub)
    },
    createTransactionByShop: async (parent, { payments }, { user }) => {
      return controller.createTransactionByShop(payments, user.shop)
    },
    createTransactionByAdmin: async (parent, { input }) => {
      return controller.createTransactionByAdmin(input)
    },
    refundTransactionByAdmin: async (parent, { _id }) => {
      return controller.refundTransactionByAdmin(_id)
    },
    createTransactionFromDriverToBedo: async (parent, { payments }, { user }) => {
      return controller.createTransactionFromDriverToBedo(payments, user.sub)
    },
    createTransactionFromShopToBedo: async (parent, { payments }, { user }) => {
      return controller.createTransactionFromShopToBedo(payments, user.shop)
    }
  },
  Transaction: {
    user: async parent => {
      return userService.findById(parent.user)
    },
    shop: async parent => {
      return shopService.findById(parent.shop)
    },
    payments: async parent => {
      return parent.payments.map(p => {
        return paymentService.findById(p)
      })
    },
    driver: async parent => {
      return driverService.findById(parent.driver)
    }
  }
}

export default resolver
