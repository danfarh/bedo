import moment from 'moment'
import { Types } from 'mongoose'
import { ApolloError } from 'apollo-server-express'
import service from './service'
import controllerBase from '../../utils/controllerBase'
import driverOrPassengerFilters from '../../utils/driverOrPassengerFilters'
import paymentService from '../payment/service'
import driverService from '../driver/service'
import shopService from '../shop/service'
import stripe from '../../utils/payment/gateways/Stripe'
import transactionService from '../transaction/service'

export default new (class Controller extends controllerBase {
  async payShopPayments() {
    console.log('paying shops')
    const payments = new Map()
    const shopPayment = await paymentService.getUnpaidOrFailedPayToShop()
    if (!shopPayment) {
      return false
    }
    //! sum up all payments for all shops
    shopPayment.forEach(p => {
      if (payments.has(p.shop)) {
        payments.set(p.shop, {
          amount: Number(p.amount) + Number(payments.get(p.shop).amount),
          ids: [...payments.get(p.shop).ids, p._id]
        })
      } else {
        payments.set(p.shop, { amount: Number(p.amount), ids: [p._id] })
      }
    })
    console.log('shop Payments Map: ', shopPayment)
    //! pay each shop
    try {
      payments.forEach(async (value, shop) => {
        await this.paySingleShop(shop, value.amount, value.ids)
      })
      return true
    } catch (err) {
      return { err }
    }
  }

  async paySingleShop(shopId, amount, ids) {
    const shop: any = await shopService.findById(shopId)
    const transactionId: any = Types.ObjectId()
    try {
      const transfer: any = await stripe.transfer(shop.stripeAccountId, amount * 100, 'cad', {
        payments: String([...ids])
      })
      await service.create({
        _id: transactionId,
        payments: [...ids],
        status: 'PAID',
        type: 'PAY_FROM_USER_TO_SHOP',
        amount,
        shop: shop._id,
        transactionId: transfer.id,
        paidAt: moment(new Date()).utc()
      })
      console.log('shop  ', shop.name, 'paid: ', amount)
      return await paymentService.multiplePaymentsChange(ids, transactionId, 'PAID')
    } catch (err) {
      await Promise.all([paymentService.multiplePaymentsChange(ids, transactionId, 'UNPAID')])
      console.log('shop  ', shop.name, 'paying error ', err)
      return { error: err }
    }
  }

  async payDriverPayments() {
    console.log('paying drivers')
    const payments = new Map()
    const driverPayment = await paymentService.getUnpaidOrFailedPayToDriver()
    if (!driverPayment) {
      return false
    }
    //! sum up all payments for all drivers
    driverPayment.forEach(p => {
      if (payments.has(p.driver)) {
        payments.set(p.driver, {
          amount: Number(p.amount) + Number(payments.get(p.driver).amount),
          ids: [...payments.get(p.driver).ids, p._id]
        })
      } else {
        payments.set(p.driver, { amount: Number(p.amount), ids: [p._id] })
      }
    })
    // console.log('driver Payments Map: ', driverPayment)
    //! pay each driver
    try {
      payments.forEach(async (value, driver) => {
        await this.paySingleDriver(driver, value.amount, value.ids)
      })
      return true
    } catch (err) {
      return { err }
    }
  }

  async paySingleDriver(driverId, amount, ids) {
    const driver: any = await driverService.findById(driverId)
    const transactionId: any = Types.ObjectId()
    try {
      const transfer: any = await stripe.transfer(driver.stripeAccountId, amount * 100, 'cad', {
        payments: String([...ids])
      })
      await service.create({
        _id: transactionId,
        payments: [...ids],
        status: 'PAID',
        type: 'PAY_FROM_USER_TO_DRIVER',
        amount,
        driver: driver._id,
        transactionId: transfer.id,
        paidAt: moment(new Date()).utc()
      })
      console.log('driver  ', driver.fullName, 'paid: ', amount)
      return await paymentService.multiplePaymentsChange(ids, transactionId, 'PAID')
    } catch (err) {
      await Promise.all([paymentService.multiplePaymentsChange(ids, transactionId, 'UNPAID')])
      console.log('driver  ', driver.fullName, 'paying error ', err)
      return { error: err }
    }
  }

  async getTransactions(userId, filters: any = {}, pagination, sort) {
    if ('paidAt' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.paidAt = {
        $gte: moment(new Date(filters.paidAt))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.paidAt))
          .utc()
          .endOf('date')
          .toDate()
      }
    }
    return this.service.find(
      {
        user: userId,
        type: 'PAY_FROM_USER_TO_BEDO',
        ...filters
      },
      pagination,
      sort
    )
  }

  // eslint-disable-next-line consistent-return
  async getTransactionsByShopAdmin(user, filters: any = {}, pagination) {
    if ('type' in filters) {
      if (filters.type === 'INPUT') {
        return this.service.find(
          {
            shop: user.shop,
            type: [
              'PAY_FROM_BEDO_TO_SHOP',
              'PAY_FROM_BEDO_TO_DRIVER',
              'PAY_FROM_BEDO_TO_USER',
              'PAY_FROM_USER_TO_SHOP',
              'PAY_FROM_USER_TO_DRIVER'
            ]
          },
          pagination
        )
      } else if (filters.type === 'OUTPUT') {
        return this.service.find(
          {
            shop: user.shop,
            type: [
              'PAY_FROM_USER_TO_BEDO',
              'PAY_FROM_SHOP_TO_BEDO',
              'PAY_FROM_DRIVER_TO_BEDO',
              'PAY_FROM_SHOP_TO_DRIVER'
            ]
          },
          pagination
        )
      } else if (filters.type === 'TOTAL') {
        return this.service.find(
          {
            shop: user.shop
          },
          pagination
        )
      }
    }
  }

  async getTotalTransactionsAmountByShopAdmin(user) {
    if (!user.shop) {
      throw new ApolloError('shop not found', '404')
    }
    const inputTransactions: any = await transactionService.find({
      shop: user.shop,
      type: ['PAY_FROM_BEDO_TO_SHOP', 'PAY_FROM_USER_TO_SHOP']
    })
    const outputTransactions: any = await transactionService.find({
      shop: user.shop,
      type: ['PAY_FROM_SHOP_TO_BEDO', 'PAY_FROM_SHOP_TO_DRIVER']
    })

    let input = 0
    let output = 0
    if (inputTransactions.length) {
      for (let i = 0; i < inputTransactions.length; i++) {
        input += inputTransactions[i].amount
      }
    }
    if (outputTransactions.length) {
      for (let i = 0; i < outputTransactions.length; i++) {
        output += outputTransactions[i].amount
      }
    }
    const totalAmount = input - output
    return totalAmount
  }

  async getDriverTransactions(driverId, filters: any = {}, pagination, sort) {
    if ('paidAt' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.paidAt = {
        $gte: moment(new Date(filters.paidAt))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.paidAt))
          .utc()
          .endOf('date')
          .toDate()
      }
    }
    return this.service.find(
      {
        driver: driverId,
        type: 'PAY_FROM_USER_TO_DRIVER',
        ...filters
      },
      pagination,
      sort
    )
  }

  async getShopTransactions(shopId, filters: any = {}, pagination, sort) {
    if ('createdAt' in filters && 'createdAtFrom' in filters) {
      filters.createdAt = {
        $gte: moment(new Date(filters.createdAtFrom))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.createdAt))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.createdAtFrom
    } else if ('createdAtFrom' in filters) {
      filters.createdAt = {
        $gte: moment(new Date(filters.createdAtFrom))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.createdAtFrom
    } else if ('createdAt' in filters) {
      filters.createdAt = {
        $lte: moment(new Date(filters.createdAt))
          .utc()
          .startOf('date')
          .toDate()
      }
    }
    if ('paidAt' in filters && 'paidAtFrom' in filters) {
      filters.paidAt = {
        $gte: moment(new Date(filters.paidAtFrom))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.paidAt))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.paidAtFrom
    } else if ('paidAtFrom' in filters) {
      filters.paidAt = {
        $gte: moment(new Date(filters.paidAtFrom))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.paidAtFrom
    } else if ('paidAt' in filters) {
      filters.paidAt = {
        $lte: moment(new Date(filters.paidAt))
          .utc()
          .startOf('date')
          .toDate()
      }
    }
    if ('amount' in filters && 'amountFrom' in filters) {
      filters.amount = {
        $gte: filters.amountFrom,
        $lte: filters.amount
      }
      delete filters.amountFrom
    } else if ('amountFrom' in filters) {
      filters.amount = {
        $gte: filters.amountFrom
      }
      delete filters.amountFrom
    } else if ('amount' in filters) {
      filters.amount = {
        $lte: filters.amount
      }
    }
    return this.service.find(
      {
        shop: shopId,
        type: 'PAY_FROM_USER_TO_SHOP',
        ...filters
      },
      pagination,
      sort
    )
  }

  async getShopTransactionsCount(shopId, filters: any = {}) {
    if ('createdAt' in filters && 'createdAtFrom' in filters) {
      filters.createdAt = {
        $gte: moment(new Date(filters.createdAtFrom))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.createdAt))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.createdAtFrom
    } else if ('createdAtFrom' in filters) {
      filters.createdAt = {
        $gte: moment(new Date(filters.createdAtFrom))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.createdAtFrom
    } else if ('createdAt' in filters) {
      filters.createdAt = {
        $lte: moment(new Date(filters.createdAt))
          .utc()
          .startOf('date')
          .toDate()
      }
    }
    if ('paidAt' in filters && 'paidAtFrom' in filters) {
      filters.paidAt = {
        $gte: moment(new Date(filters.paidAtFrom))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.paidAt))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.paidAtFrom
    } else if ('paidAtFrom' in filters) {
      filters.paidAt = {
        $gte: moment(new Date(filters.paidAtFrom))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.paidAtFrom
    } else if ('paidAt' in filters) {
      filters.paidAt = {
        $lte: moment(new Date(filters.paidAt))
          .utc()
          .startOf('date')
          .toDate()
      }
    }
    if ('amount' in filters && 'amountFrom' in filters) {
      filters.amount = {
        $gte: filters.amountFrom,
        $lte: filters.amount
      }
      delete filters.amountFrom
    } else if ('amountFrom' in filters) {
      filters.amount = {
        $gte: filters.amountFrom
      }
      delete filters.amountFrom
    } else if ('amount' in filters) {
      filters.amount = {
        $lte: filters.amount
      }
    }
    return this.service.count({
      shop: shopId,
      type: 'PAY_FROM_USER_TO_SHOP',
      ...filters
    })
  }

  async getTransactionsByAdmin(filters: any = {}, pagination, sort) {
    filters = await driverOrPassengerFilters(filters, true)
    if ('paidAt' in filters && 'paidAtFrom' in filters) {
      filters.paidAt = {
        $gte: moment(new Date(filters.paidAtFrom))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.paidAt))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.paidAtFrom
    } else if ('paidAtFrom' in filters) {
      filters.paidAt = {
        $gte: moment(new Date(filters.paidAtFrom))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.paidAtFrom
    } else if ('paidAt' in filters) {
      filters.paidAt = {
        $lte: moment(new Date(filters.paidAt))
          .utc()
          .startOf('date')
          .toDate()
      }
    }

    if ('createdAt' in filters && 'createdAtFrom' in filters) {
      filters.createdAt = {
        $gte: moment(new Date(filters.createdAtFrom))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.createdAt))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.createdAtFrom
    } else if ('createdAtFrom' in filters) {
      filters.createdAt = {
        $gte: moment(new Date(filters.createdAtFrom))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.createdAtFrom
    } else if ('createdAt' in filters) {
      filters.createdAt = {
        $lte: moment(new Date(filters.createdAt))
          .utc()
          .startOf('date')
          .toDate()
      }
    }
    if ('amount' in filters && 'amountFrom' in filters) {
      filters.amount = {
        $gte: filters.amountFrom,
        $lte: filters.amount
      }
      delete filters.amountFrom
    } else if ('amountFrom' in filters) {
      filters.amount = {
        $gte: filters.amountFrom
      }
      delete filters.amountFrom
    } else if ('amount' in filters) {
      filters.amount = {
        $lte: filters.amount
      }
    }

    if ('updatedAt' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.updatedAt = {
        $gte: moment(new Date(filters.updatedAt))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.updatedAt))
          .utc()
          .endOf('date')
          .toDate()
      }
    }

    return this.service.find(filters, pagination, sort)
  }

  async getTransactionsByAdminCount(filters: any = {}) {
    filters = await driverOrPassengerFilters(filters, true)
    if ('paidAt' in filters && 'paidAtFrom' in filters) {
      filters.paidAt = {
        $gte: moment(new Date(filters.paidAtFrom))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.paidAt))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.paidAtFrom
    } else if ('paidAtFrom' in filters) {
      filters.paidAt = {
        $gte: moment(new Date(filters.paidAtFrom))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.paidAtFrom
    } else if ('paidAt' in filters) {
      filters.paidAt = {
        $lte: moment(new Date(filters.paidAt))
          .utc()
          .startOf('date')
          .toDate()
      }
    }

    if ('createdAt' in filters && 'createdAtFrom' in filters) {
      filters.createdAt = {
        $gte: moment(new Date(filters.createdAtFrom))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.createdAt))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.createdAtFrom
    } else if ('createdAtFrom' in filters) {
      filters.createdAt = {
        $gte: moment(new Date(filters.createdAtFrom))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.createdAtFrom
    } else if ('createdAt' in filters) {
      filters.createdAt = {
        $lte: moment(new Date(filters.createdAt))
          .utc()
          .startOf('date')
          .toDate()
      }
    }
    if ('updatedAt' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.updatedAt = {
        $gte: moment(new Date(filters.updatedAt))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.updatedAt))
          .utc()
          .endOf('date')
          .toDate()
      }
    }
    if ('amount' in filters && 'amountFrom' in filters) {
      filters.amount = {
        $gte: filters.amountFrom,
        $lte: filters.amount
      }
      delete filters.amountFrom
    } else if ('amountFrom' in filters) {
      filters.amount = {
        $gte: filters.amountFrom
      }
      delete filters.amountFrom
    } else if ('amount' in filters) {
      filters.amount = {
        $lte: filters.amount
      }
    }
    return this.service.count(filters)
  }

  async createTransactionByDriver(paymentsIDs: any[], driverId) {
    let payments = (
      await Promise.all(
        // eslint-disable-next-line no-return-await
        paymentsIDs.map(async pID => await paymentService.findById(pID))
      )
    ).map((p, index) => {
      if (!p) {
        throw new ApolloError(`Payment with id ${paymentsIDs[index]} not found.`, '404')
      }
      return p
    })
    const isUnPaid = payments.every(p => p.status === 'UNPAID')
    if (!isUnPaid) {
      throw new ApolloError('all payments should be UNPAID state.', '400')
    }
    const isDriverPayments = payments.every(
      p => p.type === 'PAY_FROM_USER_TO_DRIVER' && p.driver.toString() === driverId.toString()
    )
    if (!isDriverPayments) {
      throw new ApolloError('all payments should belong to driver.', '400')
    }
    const finalAmount = Number(
      payments
        .map(p => p.amount)
        .reduce((acc, currentVal) => acc + currentVal)
        .toFixed(2)
    )
    payments = await Promise.all(
      payments.map(async payment => {
        // eslint-disable-next-line no-param-reassign
        payment.status = 'PAID'
        await payment.save()
        return payment
      })
    )
    const transaction = await this.service.create({
      payments,
      driver: driverId,
      type: 'PAY_FROM_USER_TO_DRIVER',
      status: 'UNPAID',
      amount: finalAmount
    })

    // TODO call for payment gate and it will set PaidAt and isPaid properties of transaction after payment
    return transaction
  }

  async createTransactionByShop(paymentsIDs: any[], shopId) {
    let payments = (
      await Promise.all(
        // eslint-disable-next-line no-return-await
        paymentsIDs.map(async pID => await paymentService.findById(pID))
      )
    ).map((p, index) => {
      if (!p) {
        throw new ApolloError(`Payment with id ${paymentsIDs[index]} not found.`, '404')
      }
      return p
    })
    const isUnPaid = payments.every(p => p.status === 'UNPAID')
    if (!isUnPaid) {
      throw new ApolloError('all payments should be UNPAID state.', '400')
    }
    const isDriverPayments = payments.every(
      p => p.type === 'PAY_FROM_USER_TO_SHOP' && p.shop.toString() === shopId.toString()
    )
    if (!isDriverPayments) {
      throw new ApolloError('all payments should belongs to shop.', '400')
    }
    const finalAmount = Number(
      payments
        .map(p => p.amount)
        .reduce((acc, currentVal) => acc + currentVal)
        .toFixed(2)
    )
    payments = await Promise.all(
      payments.map(async payment => {
        // eslint-disable-next-line no-param-reassign
        payment.status = 'PAID'
        await payment.save()
        return payment
      })
    )
    const transaction = await this.service.create({
      payments,
      shop: shopId,
      type: 'PAY_FROM_USER_TO_SHOP',
      status: 'UNPAID',
      amount: finalAmount
    })
    // TODO call for payment gate and it will set PaidAt and isPaid properties of transaction after payment
    return transaction
  }

  async createTransactionByAdmin(input) {
    if (input.data.for === 'driver') {
      const driver: any = await driverService.findById(input.data.id)
      if (!driver) {
        throw new ApolloError('driver not found!', '404')
      }
      const payments = (
        await Promise.all(
          // eslint-disable-next-line no-return-await
          input.payments.map(async pID => await paymentService.findById(pID))
        )
      ).map((p, index) => {
        if (!p) {
          throw new ApolloError(`Payment with id ${input.payments[index]} not found.`, '404')
        }
        return p
      })
      // @ts-ignore
      const isUnPaid = payments.every(p => p.status === 'UNPAID')
      if (!isUnPaid) {
        throw new ApolloError('all payments should be UNPAID state.', '400')
      }
      const isDriverPayments = payments.every(
        // @ts-ignore
        p => p.type === 'PAY_FROM_USER_TO_DRIVER' && p.driver.toString() === driver._id.toString()
      )
      if (!isDriverPayments) {
        throw new ApolloError('all payments should belong to driver.', '400')
      }
      const finalAmount = Number(
        payments
          // @ts-ignore
          .map(p => p.amount)
          .reduce((acc, currentVal) => acc + currentVal)
          .toFixed(2)
      )

      let updatedTransaction
      try {
        const transfer: any = await stripe.transfer(
          driver.stripeAccountId,
          finalAmount * 100,
          'cad',
          {
            role: 'DRIVER',
            payments: String(payments)
          }
        )
        console.log('transfer', transfer)
        const transaction = await this.service.create({
          payments,
          driver: driver._id,
          type: 'PAY_FROM_USER_TO_DRIVER',
          amount: finalAmount,
          status: 'PAID',
          transactionId: transfer.id,
          paidAt: moment(new Date()).format()
        })
        await payments.forEach(paymentId =>
          paymentService.findOneAndUpdate(
            { _id: paymentId },
            { transactionId: transaction._id, status: 'PAID' }
          )
        )
      } catch (err) {
        throw new ApolloError(err.message, '400')
      }
      return updatedTransaction
    }
    if (input.data.for === 'shop') {
      const shop = await shopService.findById(input.data.id)
      if (!shop) {
        throw new ApolloError('shop not found!', '404')
      }
      const payments = (
        await Promise.all(
          // eslint-disable-next-line no-return-await
          input.payments.map(async pID => await paymentService.findById(pID))
        )
      ).map((p, index) => {
        if (!p) {
          throw new ApolloError(`Payment with id ${input.payments[index]} not found.`, '404')
        }
        return p
      })
      // @ts-ignore
      const isUnPaid = payments.every(p => p.status === 'UNPAID')
      if (!isUnPaid) {
        throw new ApolloError('all payments should be UNPAID state.', '400')
      }
      const isDriverPayments = payments.every(
        // @ts-ignore
        p => p.type === 'PAY_FROM_USER_TO_SHOP' && p.shop.toString() === shop._id.toString()
      )
      if (!isDriverPayments) {
        throw new ApolloError('all payments should belongs to shop.', '400')
      }
      const finalAmount = Number(
        payments
          // @ts-ignore
          .map(p => p.amount)
          .reduce((acc, currentVal) => acc + currentVal)
          .toFixed(2)
      )

      let updatedTransaction
      try {
        const transfer: any = await stripe.transfer(
          shop.stripeAccountId,
          finalAmount * 100,
          'cad',
          {
            role: 'SHOP',
            payments: String(payments)
          }
        )
        console.log('transfer', transfer)
        const transaction = await this.service.create({
          payments,
          shop: shop._id,
          type: 'PAY_FROM_USER_TO_SHOP',
          amount: finalAmount,
          status: 'PAID',
          transactionId: transfer.id,
          paidAt: moment(new Date()).format()
        })
        await payments.forEach(paymentId =>
          paymentService.findOneAndUpdate(
            { _id: paymentId },
            { transactionId: transaction._id, status: 'PAID' }
          )
        )
      } catch (err) {
        throw new ApolloError(err.message, '400')
      }
      return updatedTransaction
    }
  }

  async createTransactionFromDriverToBedo(paymentsIDs: any[], driverId) {
    let payments = (
      await Promise.all(paymentsIDs.map(async pID => await paymentService.findById(pID)))
    ).map((p, index) => {
      if (!p) {
        throw new ApolloError(`Payment with id ${paymentsIDs[index]} not found.`, '404')
      }
      return p
    })
    const isUnPaid = payments.every(p => p.status === 'UNPAID')
    if (!isUnPaid) {
      throw new ApolloError('all payments should be UNPAID state.', '400')
    }
    const isDriverPayments = payments.every(
      p => p.type === 'PAY_FROM_DRIVER_TO_BEDO' && p.driver.toString() === driverId.toString()
    )
    if (!isDriverPayments) {
      throw new ApolloError('all payments should belong to driver.', '400')
    }
    const finalAmount = Number(
      payments
        .map(p => p.amount)
        .reduce((acc, currentVal) => acc + currentVal)
        .toFixed(2)
    )
    payments = await Promise.all(
      payments.map(async payment => {
        payment.status = 'PAID'
        await payment.save()
        return payment
      })
    )
    const transaction = await this.service.create({
      payments,
      driver: driverId,
      type: 'PAY_FROM_DRIVER_TO_BEDO',
      status: 'PAID',
      amount: finalAmount
    })

    return transaction
  }
  async createTransactionFromShopToBedo(paymentsIDs: any[], shopId) {
    let payments = (
      await Promise.all(paymentsIDs.map(async pID => await paymentService.findById(pID)))
    ).map((p, index) => {
      if (!p) {
        throw new ApolloError(`Payment with id ${paymentsIDs[index]} not found.`, '404')
      }
      return p
    })
    const isUnPaid = payments.every(p => p.status === 'UNPAID')
    if (!isUnPaid) {
      throw new ApolloError('all payments should be UNPAID state.', '400')
    }
    const isDriverPayments = payments.every(
      p => p.type === 'PAY_FROM_SHOP_TO_BEDO' && p.shop.toString() === shopId.toString()
    )
    if (!isDriverPayments) {
      throw new ApolloError('all payments should belongs to shop.', '400')
    }
    const finalAmount = Number(
      payments
        .map(p => p.amount)
        .reduce((acc, currentVal) => acc + currentVal)
        .toFixed(2)
    )
    payments = await Promise.all(
      payments.map(async payment => {
        payment.status = 'PAID'
        await payment.save()
        return payment
      })
    )
    const transaction = await this.service.create({
      payments,
      shop: shopId,
      type: 'PAY_FROM_SHOP_TO_BEDO',
      status: 'PAID',
      amount: finalAmount
    })

    return transaction
  }

  /*
  Doc: 
  https://stripe.com/docs/api/transfer_reversals/create
  https://stripe.com/docs/api/refunds/create

  */
  async refundTransactionByAdmin(_id) {
    const transaction: any = await service.findById(_id)
    let updatedTransaction
    if (transaction.reversed) {
      throw new ApolloError('transaction has already been refunded', '400')
    }
    if (transaction.type === 'PAY_FROM_USER_TO_BEDO') {
      try {
        const undo: any = await stripe.refund(transaction.transactionId, transaction.paymentIntent)
        console.log({ undo })
        if (String(undo.id).startsWith('trr_')) {
          updatedTransaction = await this.service.findOneAndUpdate(
            { _id },
            { reversalId: undo.id, reversed: true }
          )
        } else {
          updatedTransaction = await this.service.findOneAndUpdate(
            { _id },
            { refundId: undo.id, reversed: true }
          )
        }
      } catch (err) {
        throw new ApolloError(`refund unsuccessful : ${err.raw.message}`, '400')
      }
    } else {
      try {
        const undo: any = await stripe.reverseTransfer(transaction.transactionId)
        console.log({ undo })
        updatedTransaction = await this.service.findOneAndUpdate(
          { _id },
          { reversalId: undo.id, reversed: true }
        )
        return updatedTransaction
      } catch (err) {
        throw new ApolloError(`refund unsuccessful : ${err.raw.message}`, '400')
      }
    }
    return updatedTransaction
  }
})(service)
