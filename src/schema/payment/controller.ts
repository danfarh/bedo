import { ApolloError } from 'apollo-server-express'
import moment from 'moment'
import { Types } from 'mongoose'
import * as _ from 'lodash'
import service from './service'
import controllerBase from '../../utils/controllerBase'
import driverOrPassengerFilters from '../../utils/driverOrPassengerFilters'
import sendSMS from '../../utils/sms'
import { sendNotificationToFCMToken } from '../../utils/notification'
import sendHtmlContentEmail from '../../utils/htmlContentEmail'
import tripService from '../trip/service'
import orderService from '../order/service'
import shopService from '../shop/service'
// import categoryService from '../category/service'
import driverService from '../driver/service'
import userService from '../user/service'
import userTokenService from '../userToken/service'
import transactionService from '../transaction/service'
import stripe from '../../utils/payment/gateways/Stripe'
import { convertAmount, readConstants } from '../../utils/calculation'
import { getConstantValue } from '../../utils/redis'

export default new (class Controller extends controllerBase {
  async getPaymentMethodStatus(user) {
    if (user.roles === 'SHOP_ADMIN') {
      const shop = await shopService.findOne({ shopAdmin: user.userId })
      const result = shop.stripeAccountId ? 'HAS_ACCOUNT' : 'DOES_NOT_HAVE_ACCOUNT'
      return result
    }
    if (user.roles === 'DRIVER') {
      const driver = await driverService.findOne({ _id: user.userId })
      const result = driver.stripeAccountId ? 'HAS_ACCOUNT' : 'DOES_NOT_HAVE_ACCOUNT'
      return result
    }
    throw new ApolloError('token is invalid', '400')
  }

  async getPayment(paymentId) {
    return this.service.findOne({ _id: paymentId })
  }

  async checkIfPaymentIsPaid(_id) {
    return this.service.findOne({ _id, status: 'PAID' })
  }

  async manualResolvePayment(paymentId) {
    const payment = await this.service.findById(paymentId)
    if (!payment) throw new ApolloError('Payment does not exists.', '400')
    if (payment.status === 'PAID') throw new ApolloError('Payment is already paid.', '400')
    const paid: any = await this.service.findOneAndUpdate({ _id: paymentId }, { status: 'PAID' })
    await transactionService.findOneAndUpdate({ _id: paid.transactionId }, { status: 'PAID' })
    return paid
  }

  async getPayments(userId, filters: any = {}, pagination) {
    if ('from' in filters && 'to' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.createdAt = {
        $gte: moment(new Date(filters.from))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.to))
          .utc()
          .endOf('date')
          .toDate()
      }
      // eslint-disable-next-line no-param-reassign
      filters = _.omit(filters, ['from', 'to'])
    }
    return this.service.find(
      {
        user: userId,
        type: 'PAY_FROM_USER_TO_BEDO',
        ...filters
      },
      pagination
    )
  }

  async getFailedPayments(userId, pagination) {
    return this.service.find(
      {
        user: userId,
        type: 'PAY_FROM_USER_TO_BEDO',
        status: 'FAILED',
        createdAt: {
          $lte: moment(new Date())
            .utc()
            .endOf('date')
            .toDate()
        }
      },
      pagination
    )
  }

  async UnpaidPaymentsToPaid(ids, transactionId) {
    ids.forEach(async _id => {
      const payment = await service.findOneAndUpdate({ _id }, { status: 'PAID' })
      await transactionService.findOneAndUpdate(
        { _id: payment.transactionId },
        { status: 'PAID', transactionId }
      )
    })
  }

  async createPunishmentPayment(role, userId, amount, isFor, description) {
    let obj: any = {}
    if (role === 'DRIVER') {
      obj = {
        for: isFor,
        description,
        amount: 0 - Math.trunc(amount),
        status: 'UNPAID',
        driver: userId,
        type: 'PAY_FROM_USER_TO_DRIVER'
      }
    }
    if (role === 'USER') {
      obj = {
        for: isFor,
        description,
        amount: Math.trunc(amount),
        status: 'UNPAID',
        user: userId,
        type: 'PAY_FROM_USER_TO_BEDO'
      }
    }
    if (role === 'SHOP') {
      obj = {
        for: isFor,
        description,
        amount: 0 - Math.trunc(amount),
        status: 'UNPAID',
        shop: userId,
        type: 'PAY_FROM_USER_TO_SHOP'
      }
    }
    return service.create(obj)
  }

  async createPaymentByUser(
    user,
    amount,
    isFor,
    order = null,
    trip = null,
    status = 'UNPAID',
    transactionId = null
  ) {
    return service.create({
      user,
      amount,
      for: isFor,
      order,
      trip,
      status,
      transactionId,
      type: 'PAY_FROM_USER_TO_BEDO'
    })
  }

  async createPaymentForShop(order, shop, amount, isFor, transactionId = null) {
    return service.create({
      order,
      shop,
      amount,
      for: isFor,
      transactionId,
      type: 'PAY_FROM_USER_TO_SHOP',
      status: 'UNPAID'
    })
  }

  async createPaymentForDriver(trip, driver, amount, isFor) {
    return service.create({
      trip,
      driver,
      amount,
      for: isFor,
      status: 'UNPAID',
      type: 'PAY_FROM_USER_TO_DRIVER'
    })
  }

  //! Payment at the end of trip using setup intent
  async payTrip(tripId) {
    const trip = await tripService.findById(tripId)
    if (!trip.isForShopDelivery) {
      //! Only if trip is not for shop delivery we should charge user
      const user: any = await userService.findById(trip.passenger)
      const userUnpaidPayments = await this.checkIfUserHasUnpaidPayment(user._id)
      let ids: String[] = []
      let amount: Number = 0
      console.log('trip paid by : ', user.fullName)
      const transactionId: any = Types.ObjectId()
      const payment: any = await this.createPaymentByUser(
        trip.passenger,
        trip.cost,
        trip.tripType,
        null,
        tripId,
        'UNPAID',
        transactionId
      )
      trip.payment = payment._id
      await trip.save()
      await transactionService.create({
        _id: transactionId,
        payments: [payment._id],
        status: 'UNPAID',
        type: 'PAY_FROM_USER_TO_BEDO',
        amount: trip.cost,
        user: trip.passenger
      })

      //! user payments from before
      if (userUnpaidPayments) {
        ids = userUnpaidPayments.ids
        amount = userUnpaidPayments.amount
      }
      //! charge the user
      try {
        console.log(
          'charge params: ',
          user.stripeCustomerId,
          trip.paymentMethod,
          (Number(amount) + trip.cost) * 100,
          'cad',
          { tripId, notPaidFromBefore: String([...ids]) }
        )
        const charge: any = await stripe.charge(
          user.stripeCustomerId,
          trip.paymentMethod,
          (Number(amount) + trip.cost) * 100,
          'cad',
          { tripId: String(tripId), notPaidFromBefore: String([...ids]) }
        )
        await service.findOneAndUpdate({ _id: payment._id }, { status: 'PAID' })
        await transactionService.findOneAndUpdate(
          { _id: transactionId },
          {
            status: 'PAID',
            transactionId: charge.id,
            paymentIntent: charge.id,
            paidAt: moment(new Date()).utc()
          }
        )
        //! change status of unpaid payments of user to paid
        if (ids) {
          await this.UnpaidPaymentsToPaid(ids, charge.id)
        }
      } catch (err) {
        console.log('error  pay trip: ', err)
        const subject = 'Unsuccessful Payment'
        const message = `Dear ${user.fullName}, your last payment was unsuccessful, please open BEDO app and follow the instructions to make the transaction  `
        const userToken: any = await userTokenService.findByUserId(user._id)
        await Promise.all([
          this.service.findOneAndUpdate({ _id: payment._id }, { status: 'FAILED' }),
          transactionService.findOneAndUpdate({ _id: transactionId }, { status: 'FAILED' }),
          sendSMS(user.phoneNumber, message),
          sendNotificationToFCMToken(userToken.FCM, subject, message),
          sendHtmlContentEmail(user.email, subject, 'general', { text: message }, message)
        ])
        return { error: err }
      }
    }
    //! create driver payment
    const driver: any = await driverService.findById(trip.driver)
    // const driverUnpaidPayments = await this.checkIfDriverHasUnpaidPayment(driver._id)
    // let ids: String[] = []
    // let amount: Number = 0
    const transactionId: any = Types.ObjectId()
    console.log('driver paid  : ', driver.fullName)
    const driverPayment: any = await service.create({
      transactionId,
      amount: trip.driverTotalPrice,
      driver: trip.driver,
      trip: tripId,
      for: trip.tripType,
      status: 'UNPAID',
      type: 'PAY_FROM_USER_TO_DRIVER'
    })
    console.log('driverPayment: ', driverPayment)
    trip.driverPayment = driverPayment._id
    await trip.save()
    // await transactionService.create({
    //   _id: transactionId,
    //   payments: [driverPayment._id],
    //   status: 'UNPAID',
    //   type: 'PAY_FROM_USER_TO_DRIVER',
    //   amount: trip.driverTotalPrice,
    //   driver: trip.driver
    // })

    // //! driver payments from before
    // if (driverUnpaidPayments) {
    //   ids = driverUnpaidPayments.ids
    //   amount = driverUnpaidPayments.amount
    // }
    // //! make transfer
    // try {
    //   const transfer: any = await stripe.transfer(
    //     driver.stripeAccountId,
    //     (Number(amount) + trip.driverTotalPrice) * 100,
    //     'cad',
    //     { tripId, notPaidFromBefore: String([...ids]) }
    //   )
    //   await service.findOneAndUpdate({ _id: driverPayment._id }, { status: 'PAID' })
    //   await transactionService.findOneAndUpdate(
    //     { _id: transactionId },
    //     { status: 'PAID', transactionId: transfer.id, paidAt: moment(new Date()).utc() }
    //   )
    //   //! change status of unpaid payments of driver to paid
    //   if (ids) {
    //     await this.UnpaidPaymentsToPaid(ids, transfer.id)
    //   }
    // } catch (err) {
    //   await Promise.all([
    //     this.service.findOneAndUpdate({ _id: driverPayment._id }, { status: 'FAILED' }),
    //     transactionService.findOneAndUpdate({ _id: transactionId }, { status: 'FAILED' })
    //   ])
    //   console.log('error in transfer to driver  : ', err)
    //   return { error: err }
    // }

    return true
  }

  async sumDriverDebtToBedo(driverId: any): Promise<any> {
    let sumDriverDebt: any = 0
    const payments: any = await service.find({
      type: 'PAY_FROM_USER_TO_DRIVER',
      driver: driverId
    })
    payments.forEach(payment => {
      sumDriverDebt += payment.amount
    })
    return sumDriverDebt
  }

  async payForTrip(tripId) {
    const trip = await tripService.findById(tripId)

    // payment
    const transactionId: any = Types.ObjectId()
    const paymentData: any = {
      user: trip.passenger,
      driver: trip.driver,
      trip: trip._id,
      transactionId,
      status: 'UNPAID',
      for: trip.tripType,
      type: 'PAY_FROM_USER_TO_DRIVER',
      amount: trip.cost
    }
    const newPayment: any = await service.create({ ...paymentData })
    trip.payment = newPayment._id
    await trip.save()
    // transaction
    const transactionData: any = {
      _id: transactionId,
      user: trip.passenger,
      driver: trip.driver,
      status: 'UNPAID',
      payments: [newPayment._id],
      paidAt: moment(new Date()).utc(),
      type: 'PAY_FROM_USER_TO_DRIVER',
      amount: trip.cost,
      transactionMethod: 'CASH'
    }
    await transactionService.create({ ...transactionData })

    // sum driver dept amount to bedo
    const driver: any = await driverService.findById(trip.driver)
    const sumDriverDebt: any = this.sumDriverDebtToBedo(driver._id)
    const maxDeptAmount: any = await getConstantValue('MAXIMUM_DEBT_AMOUNT_SUSPEND_DRIVER', 500)
    if (sumDriverDebt >= maxDeptAmount) {
      driver.state = 'SUSPENDED'
      await driver.save()
    }

    return true
  }

  // async payShop(orderId) {
  //   const order: any = await orderService.findById(orderId)
  //   const shop: any = await shopService.findById(order.shop)
  //   const shopPayment: any = await this.service.findById(order.shopPayment)
  //   const { amount } = shopPayment
  //   console.log('shop paid: ', shop.name)
  //   const transactionId: any = Types.ObjectId()
  //   await transactionService.create({
  //     _id: transactionId,
  //     payments: [shopPayment._id],
  //     status: 'UNPAID',
  //     type: 'PAY_FROM_USER_TO_SHOP',
  //     amount,
  //     shop: shop._id
  //   })
  //   try {
  //     const transfer: any = await stripe.transfer(shop.stripeAccountId, amount * 100, 'cad', {
  //       orderId
  //     })
  //     await transactionService.findOneAndUpdate(
  //       { _id: transactionId },
  //       { status: 'PAID', transactionId: transfer.id, paidAt: moment(new Date()).utc() }
  //     )
  //     return await this.service.findOneAndUpdate(
  //       { _id: shopPayment._id },
  //       { status: 'PAID', transactionId }
  //     )
  //   } catch (err) {
  //     await Promise.all([
  //       this.service.findOneAndUpdate({ _id: order.shopPayment }, { status: 'FAILED' }),
  //       transactionService.findOneAndUpdate({ _id: transactionId }, { status: 'FAILED' })
  //     ])
  //     console.log('shop pay error ', err)
  //     return { error: err }
  //   }
  // }

  async payOrder(orderId, paymentIntent) {
    const order: any = await orderService.findById(orderId)
    // const shop: any = await shopService.findById(order.shop)
    // const isFor: any = await categoryService.findById(shop.rootCategory)
    //! create payment and transaction for user : which are paid
    const transaction = await transactionService.create({
      transactionId: paymentIntent,
      paymentIntent,
      status: 'PAID',
      type: 'PAY_FROM_USER_TO_BEDO',
      amount: order.total,
      user: order.user,
      paidAt: moment(new Date()).utc()
    })
    console.log(' order.type : =>>>>>>>>>>>>>>>>>>>', order.type)
    const payment = await this.createPaymentByUser(
      order.user,
      order.total,
      order.type,
      order._id,
      null,
      'PAID',
      transaction._id
    )
    transaction.payments = [payment._id]
    //! create payment for shop :when food is delivered shop gets paid
    const shopPayment = await this.createPaymentForShop(
      order._id,
      order.shop,
      order.shopIncome,
      order.type
    )
    order.payment = payment._id
    order.shopPayment = shopPayment._id
    await Promise.all([transaction.save(), order.save()])
    return true
  }

  async payForOrder(trip, orderId) {
    const order: any = await orderService.findById(orderId)
    // transaction
    const transactionData: any = {
      status: 'UNPAID',
      paidAt: moment(new Date()).utc(),
      type: 'PAY_FROM_USER_TO_DRIVER',
      amount: order.total,
      user: order.user,
      shop: order.shop,
      transactionMethod: 'CASH'
    }
    const newTransaction: any = await transactionService.create({ ...transactionData })
    // payment
    const paymentData: any = {
      user: order.user,
      shop: order.shop,
      order: order._id,
      trip: trip._id,
      transactionId: newTransaction._id,
      status: 'UNPAID',
      type: 'PAY_FROM_USER_TO_DRIVER',
      for: trip.orderType,
      amount: order.total
    }
    const payment: any = await service.create({ ...paymentData })
    newTransaction.payments = [payment._id]
    order.payment = payment._id
    await Promise.all([newTransaction.save(), order.save()])
    return true
  }

  //! if trip payment using setup intent failed: user pays trip using payment intent so trip is paid
  async completeTripFailedPayment(tripId, paymentIntent) {
    const trip: any = await tripService.findById(tripId)
    const check: any = await service.findById(trip.payment)
    if (check.status === 'PAID') {
      return true
    }
    //! update user payment and transaction
    const payment: any = await service.findOneAndUpdate({ _id: trip.payment }, { status: 'PAID' })
    await transactionService.findOneAndUpdate(
      { _id: payment.transactionId },
      { status: 'PAID', paidAt: moment(new Date()).utc(), paymentIntent }
    )
    //! transfer to driver
    const driver: any = await driverService.findById(trip.driver)
    const driverPayment: any = await service.findById(trip.driverPayment)
    let transfer: any
    try {
      transfer = await stripe.transfer(driver.stripeAccountId, trip.driverTotalPrice * 100, 'cad', {
        tripId
      })
      await transactionService.findOneAndUpdate(
        { _id: driverPayment.transactionId },
        { status: 'PAID', paidAt: moment(new Date()).utc(), transactionId: transfer.id }
      )
      await service.findOneAndUpdate({ _id: trip.driverPayment }, { status: 'PAID' })
      console.log('driver paid  : ', driver.fullName)
    } catch (err) {
      await Promise.all([
        this.service.findOneAndUpdate({ _id: driverPayment._id }, { status: 'FAILED' }),
        transactionService.findOneAndUpdate(
          { _id: driverPayment.transactionId },
          { status: 'FAILED' }
        )
      ])
      console.log('error in transfer to driver  : ', err)
      return { error: err }
    }
    return true
  }

  async checkIfDriverHasUnpaidPayment(driverId) {
    const unpaidPayments: any = await this.service.find({
      driver: driverId,
      type: 'PAY_FROM_USER_TO_DRIVER',
      status: 'UNPAID'
    })
    if (unpaidPayments) {
      const ids: string[] = []
      let amount: Number = 0
      unpaidPayments.forEach(p => {
        ids.push(p._id)
        amount = Number(p.amount) + Number(amount)
      })
      return { ids, amount }
    }
    return false
  }

  async checkIfUserHasUnpaidPayment(userId) {
    const unpaidPayments: any = await this.service.find({
      user: userId,
      type: 'PAY_FROM_USER_TO_BEDO',
      status: 'UNPAID'
    })
    if (unpaidPayments) {
      const ids: string[] = []
      let amount: Number = 0
      unpaidPayments.forEach(p => {
        ids.push(p._id)
        amount = Number(p.amount) + Number(amount)
      })
      return { ids, amount }
    }
    return false
  }

  async getDriverPayments(driverId, pagination, filters: any = {}) {
    if ('from' in filters && 'to' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.createdAt = {
        $gte: moment(new Date(filters.from))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.to))
          .utc()
          .endOf('date')
          .toDate()
      }
      // eslint-disable-next-line no-param-reassign
      filters = _.omit(filters, ['from', 'to'])
    }
    return this.service.find(
      {
        driver: driverId,
        type: 'PAY_FROM_USER_TO_DRIVER',
        ...filters
      },
      pagination
    )
  }

  async getDriverPayment(_id, driverId) {
    return this.service.findOne({ _id, driver: driverId, type: 'PAY_FROM_USER_TO_DRIVER' })
  }

  async getShopPayments(shopId, filters: any = {}, pagination, sort) {
    if ('from' in filters && 'to' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.createdAt = {
        $gte: moment(new Date(filters.from))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.to))
          .utc()
          .endOf('date')
          .toDate()
      }
      // eslint-disable-next-line no-param-reassign
      filters = _.omit(filters, ['from', 'to'])
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

  async getShopPaymentsCount(shopId, filters: any = {}) {
    if ('from' in filters && 'to' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.createdAt = {
        $gte: moment(new Date(filters.from))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.to))
          .utc()
          .endOf('date')
          .toDate()
      }
      // eslint-disable-next-line no-param-reassign
      filters = _.omit(filters, ['from', 'to'])
    }
    return this.service.count({
      shop: shopId,
      type: 'PAY_FROM_USER_TO_SHOP',
      ...filters
    })
  }

  async getShopPayment(_id, shopId) {
    return this.service.findOne({ _id, shop: shopId, type: 'PAY_FROM_USER_TO_SHOP' })
  }

  async getPaymentsByAdmin(filters: any = {}, pagination, sort) {
    filters = await driverOrPassengerFilters(filters, true)

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

    if ('from' in filters && 'to' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.createdAt = {
        $gte: moment(new Date(filters.from))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.to))
          .utc()
          .endOf('date')
          .toDate()
      }
    }
    // eslint-disable-next-line no-param-reassign
    filters = _.omit(filters, ['from', 'to'])

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

  async getPaymentsByAdminCount(filters: any = {}) {
    filters = await driverOrPassengerFilters(filters, true)

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

    if ('from' in filters && 'to' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.createdAt = {
        $gte: moment(new Date(filters.from))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.to))
          .utc()
          .endOf('date')
          .toDate()
      }
    }
    // eslint-disable-next-line no-param-reassign
    filters = _.omit(filters, ['from', 'to'])

    return this.service.count(filters)
  }

  async getPaymentTakingsByAdmin(filters: any = {}, withDetail) {
    if ('from' in filters && 'to' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.createdAt = {
        $gte: moment(new Date(filters.from))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.to))
          .utc()
          .endOf('date')
          .toDate()
      }
      // eslint-disable-next-line no-param-reassign
      filters = _.omit(filters, ['from', 'to'])
    }
    const data = await service.findWithoutPagination({
      type: 'PAY_FROM_USER_TO_BEDO',
      ...filters
    })
    const allTakings = Number(
      data.reduce((prevVal, currVal) => prevVal + currVal.amount, 0).toFixed(2)
    )
    const paid = Number(
      data
        .filter(payment => payment.status === 'PAID')
        .reduce((prevVal, currVal) => prevVal + currVal.amount, 0)
        .toFixed(2)
    )
    const unPaid = Number(
      data
        .filter(payment => payment.status === 'UNPAID' || payment.status === 'FAILED')
        .reduce((prevVal, currVal) => prevVal + currVal.amount, 0)
        .toFixed(2)
    )
    return withDetail ? { details: data, allTakings, paid, unPaid } : { allTakings, paid, unPaid }
  }

  async getPaymentsDetailByAdmin(filters: any = {}, withDetail, type) {
    if ('from' in filters && 'to' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.createdAt = {
        $gte: moment(new Date(filters.from))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.to))
          .utc()
          .endOf('date')
          .toDate()
      }
      // eslint-disable-next-line no-param-reassign
      filters = _.omit(filters, ['from', 'to'])
    }
    const data = await service.findWithoutPagination({
      type,
      ...filters
    })
    const all = Number(data.reduce((prevVal, currVal) => prevVal + currVal.amount, 0).toFixed(2))
    const paid = Number(
      data
        .filter(payment => payment.status === 'PAID')
        .reduce((prevVal, currVal) => prevVal + currVal.amount, 0)
        .toFixed(2)
    )
    const shouldPay = Number(
      data
        .filter(payment => payment.status === 'UNPAID' || payment.status === 'FAILED')
        .reduce((prevVal, currVal) => prevVal + currVal.amount, 0)
        .toFixed(2)
    )
    return withDetail ? { details: data, all, paid, shouldPay } : { all, paid, shouldPay }
  }

  async checkLastPayment(user) {
    // let orderId: Types.ObjectId | string = ''
    let tripId: Types.ObjectId | string = ''
    let hasUnpaidTripPayment: boolean = false
    // let hasUnpaidOrderPayment: boolean = false

    const lastTrip = await tripService.find({ passenger: user.userId }, { limit: 1, skip: 0 })
    // const lastOrder = await orderService.find({ user: user.userId }, { limit: 1, skip: 0 })

    if (lastTrip[0]) {
      const lastTripPayment = await service.findById(lastTrip[0].payment)
      if (!lastTripPayment)
        return {
          tripId: lastTrip[0]._id,
          hasUnpaidTripPayment: false
        }
      if (lastTripPayment.status !== 'PAID') {
        tripId = lastTrip[0]._id
        hasUnpaidTripPayment = true
      }
    }
    // if (lastOrder[0]) {
    //   const lastOrderPayment = await service.findById(lastOrder[0].payment)

    //   if (!lastOrderPayment || lastOrderPayment.status !== 'PAID') {
    //     orderId = lastOrder[0]._id
    //     hasUnpaidOrderPayment = true
    //   }
    // }

    return {
      tripId,
      // orderId,
      // hasUnpaidOrderPayment,
      hasUnpaidTripPayment
    }
  }

  async calculateAndDivideRideTripPayments(payment: any) {
    // eslint-disable-next-line no-shadow
    const constants: Array<any> = await readConstants()
    const commissionIndex = _.findIndex(constants, o => o.attribute === 'TRIP_COMMISSION')
    const commission = constants[commissionIndex]
    if (payment.type === 'PAY_FROM_USER_TO_DRIVER') {
      const receiveMoneyByBedo: any = -convertAmount(
        Number(payment.amount) * (Number(commission.value) / 100)
      )
      return {
        payment,
        receiveMoneyByDriver: payment.amount,
        receiveMoneyByBedo
      }
    }
    if (payment.type === 'PAY_FROM_DRIVER_TO_BEDO') {
      const receiveMoneyByDriver: any = convertAmount(
        Number(payment.amount) * (1 - Number(commission.value / 100))
      )
      const receiveMoneyByBedo: any = convertAmount(
        Number(payment.amount) * (Number(commission.value) / 100)
      )
      return {
        payment,
        receiveMoneyByDriver,
        receiveMoneyByBedo
      }
    }
    return true
  }

  async calculateAndDivideDeliveryTripPayments(payment: any) {
    // eslint-disable-next-line no-shadow
    const constants: Array<any> = await readConstants()
    const tripCommissionIndex = _.findIndex(constants, o => o.attribute === 'TRIP_COMMISSION')
    const shopCommissionIndex = _.findIndex(constants, o => o.attribute === 'SHOP_COMMISSION')
    const tripCommission = constants[tripCommissionIndex]
    const shopCommission = constants[shopCommissionIndex]
    if (payment.type === 'PAY_FROM_USER_TO_DRIVER') {
      const receiveMoneyByBedo: any = -convertAmount(
        Number(payment.amount) * (Number(tripCommission.value) / 100)
      )
      const receiveMoneyByShop: any = -convertAmount(
        Number(payment.amount) * (Number(shopCommission.value) / 100)
      )
      return {
        payment,
        receiveMoneyByDriver: payment.amount,
        receiveMoneyByBedo,
        receiveMoneyByShop
      }
    }
    if (payment.type === 'PAY_FROM_DRIVER_TO_BEDO') {
      const receiveMoneyByDriver: any = convertAmount(
        Number(payment.amount) * (1 - 2 * Number(tripCommission.value / 100))
      )
      const receiveMoneyByBedo: any =
        convertAmount(Number(payment.amount) * (Number(tripCommission.value) / 100)) +
        convertAmount(Number(payment.amount) * (Number(shopCommission.value) / 100))
      const receiveMoneyByShop: any = -convertAmount(
        Number(payment.amount) * (Number(shopCommission.value) / 100)
      )
      return {
        payment,
        receiveMoneyByDriver,
        receiveMoneyByBedo,
        receiveMoneyByShop
      }
    }
    if (payment.type === 'PAY_FROM_BEDO_TO_SHOP') {
      const receiveMoneyByDriver: any = convertAmount(
        Number(payment.amount) * (1 - 2 * Number(tripCommission.value / 100))
      )
      const receiveMoneyByBedo: any = convertAmount(
        Number(payment.amount) * (Number(tripCommission.value) / 100)
      )
      const receiveMoneyByShop: any = convertAmount(
        Number(payment.amount) * (Number(shopCommission.value) / 100)
      )
      return {
        payment,
        receiveMoneyByDriver,
        receiveMoneyByBedo,
        receiveMoneyByShop
      }
    }
    return true
  }

  async paymentsInfoFilters(filters: any = {}) {
    filters = await driverOrPassengerFilters(filters, true)

    if ('tripCreatedAtTo' in filters || 'tripCreatedAtFrom' in filters) {
      const f: any = {}
      if ('tripCreatedAtTo' in filters && 'tripCreatedAtFrom' in filters) {
        f.createdAt = {
          $gte: moment(new Date(filters.tripCreatedAtFrom))
            .utc()
            .startOf('date')
            .toDate(),
          $lte: moment(new Date(filters.tripCreatedAtTo))
            .utc()
            .endOf('date')
            .toDate()
        }
        delete filters.tripCreatedAtFrom
        delete filters.tripCreatedAtTo
      } else if ('tripCreatedAtFrom' in filters) {
        f.createdAt = {
          $gte: moment(new Date(filters.tripCreatedAtFrom))
            .utc()
            .endOf('date')
            .toDate()
        }
        delete filters.tripCreatedAtFrom
      } else if ('tripCreatedAtTo' in filters) {
        f.createdAt = {
          $lte: moment(new Date(filters.tripCreatedAtTo))
            .utc()
            .startOf('date')
            .toDate()
        }
        delete filters.tripCreatedAtTo
      }
      const trips = await tripService.find(f)
      if (trips) {
        filters = _.omit(filters, 'trip')
        const ids = trips.map(p => Types.ObjectId(p._id))
        filters.trip = { $in: [...ids] }
      }
    }

    if ('amountTo' in filters && 'amountFrom' in filters) {
      filters.amount = {
        $gte: filters.amountFrom,
        $lte: filters.amountTo
      }
      delete filters.amountFrom
      delete filters.amountTo
    } else if ('amountFrom' in filters) {
      filters.amount = {
        $gte: filters.amountFrom
      }
      delete filters.amountFrom
      delete filters.amountTo
    } else if ('amountTo' in filters) {
      filters.amount = {
        $lte: filters.amountTo
      }
      delete filters.amountTo
    }

    return filters
  }

  // eslint-disable-next-line consistent-return
  async getPaymentInfoByAdmin(type, filters: any = {}, pagination) {
    const paymentsInfoArr: any = []
    if (type === 'RIDE_AND_DELIVERY') {
      const paymentsFound: any = await this.service.find(
        {
          type: ['PAY_FROM_USER_TO_DRIVER', 'PAY_FROM_DRIVER_TO_BEDO'],
          for: ['RIDE', 'DELIVERY'],
          ...(await this.paymentsInfoFilters(filters))
        },
        pagination
      )
      paymentsFound.forEach(payment => {
        paymentsInfoArr.push(this.calculateAndDivideRideTripPayments(payment))
      })
      return paymentsInfoArr
    }
    if (type === 'FOOD_AND_PURCHASE') {
      const paymentsFound: any = await this.service.find(
        {
          type: ['PAY_FROM_USER_TO_DRIVER', 'PAY_FROM_DRIVER_TO_BEDO', 'PAY_FROM_BEDO_TO_SHOP'],
          for: ['RESTAURANT', 'PURCHASE'],
          ...(await this.paymentsInfoFilters(filters))
        },
        pagination
      )
      paymentsFound.forEach(payment => {
        paymentsInfoArr.push(this.calculateAndDivideDeliveryTripPayments(payment))
      })
      return paymentsInfoArr
    }
    if (type === 'ALL') {
      const paymentsFound: any = await this.service.find(
        {
          type: ['PAY_FROM_USER_TO_DRIVER', 'PAY_FROM_DRIVER_TO_BEDO', 'PAY_FROM_BEDO_TO_SHOP'],
          ...(await this.paymentsInfoFilters(filters))
        },
        pagination
      )
      paymentsFound.forEach(payment => {
        if (payment.for === 'RIDE' || payment.for === 'DELIVERY') {
          paymentsInfoArr.push(this.calculateAndDivideRideTripPayments(payment))
        } else if (payment.for === 'RESTAURANT' || payment.for === 'PURCHASE') {
          paymentsInfoArr.push(this.calculateAndDivideDeliveryTripPayments(payment))
        }
      })
      return paymentsInfoArr
    }
  }

  async getPaymentInfoByAdminCountFilter(filters) {
    filters = await driverOrPassengerFilters(filters, true)

    if ('tripCreatedAtTo' in filters || 'tripCreatedAtFrom' in filters) {
      const f: any = {}
      if ('tripCreatedAtTo' in filters && 'tripCreatedAtFrom' in filters) {
        f.createdAt = {
          $gte: moment(new Date(filters.tripCreatedAtFrom))
            .utc()
            .startOf('date')
            .toDate(),
          $lte: moment(new Date(filters.tripCreatedAtTo))
            .utc()
            .endOf('date')
            .toDate()
        }
        delete filters.tripCreatedAtFrom
        delete filters.tripCreatedAtTo
      } else if ('tripCreatedAtFrom' in filters) {
        f.createdAt = {
          $gte: moment(new Date(filters.tripCreatedAtFrom))
            .utc()
            .endOf('date')
            .toDate()
        }
        delete filters.tripCreatedAtFrom
      } else if ('tripCreatedAtTo' in filters) {
        f.createdAt = {
          $lte: moment(new Date(filters.tripCreatedAtTo))
            .utc()
            .startOf('date')
            .toDate()
        }
        delete filters.tripCreatedAtTo
      }
      const trips = await tripService.find(f)
      if (trips) {
        filters = _.omit(filters, 'trip')
        const ids = trips.map(p => Types.ObjectId(p._id))
        filters.trip = { $in: [...ids] }
      }
    }

    if ('amountTo' in filters && 'amountFrom' in filters) {
      filters.amount = {
        $gte: filters.amountFrom,
        $lte: filters.amountTo
      }
      delete filters.amountFrom
      delete filters.amountTo
    } else if ('amountFrom' in filters) {
      filters.amount = {
        $gte: filters.amountFrom
      }
      delete filters.amountFrom
      delete filters.amountTo
    } else if ('amountTo' in filters) {
      filters.amount = {
        $lte: filters.amountTo
      }
      delete filters.amountTo
    }

    return filters
  }

  // eslint-disable-next-line consistent-return
  async getPaymentInfoByAdminCount(type, filters: any = {}) {
    if (type === 'RIDE_AND_DELIVERY') {
      return this.service.count({
        type: ['PAY_FROM_USER_TO_DRIVER', 'PAY_FROM_DRIVER_TO_BEDO'],
        for: 'RIDE',
        ...(await this.getPaymentInfoByAdminCountFilter(filters))
      })
    }
    if (type === 'FOOD_AND_PURCHASE') {
      return this.service.count({
        type: ['PAY_FROM_USER_TO_DRIVER', 'PAY_FROM_DRIVER_TO_BEDO', 'PAY_FROM_BEDO_TO_SHOP'],
        for: 'DELIVERY',
        ...(await this.getPaymentInfoByAdminCountFilter(filters))
      })
    }
    if (type === 'ALL') {
      return this.service.count({
        type: ['PAY_FROM_USER_TO_DRIVER', 'PAY_FROM_DRIVER_TO_BEDO', 'PAY_FROM_BEDO_TO_SHOP'],
        ...(await this.getPaymentInfoByAdminCountFilter(filters))
      })
    }
  }

  async getBedoTotalPaymentByAdmin() {
    let bedoTotalAmount: any = 0
    const constants: Array<any> = await readConstants()
    const tripCommissionIndex = _.findIndex(constants, o => o.attribute === 'TRIP_COMMISSION')
    const shopCommissionIndex = _.findIndex(constants, o => o.attribute === 'SHOP_COMMISSION')
    const tripCommission = constants[tripCommissionIndex]
    const shopCommission = constants[shopCommissionIndex]
    const payments: any = await service.find({
      type: ['PAY_FROM_USER_TO_DRIVER', 'PAY_FROM_DRIVER_TO_BEDO', 'PAY_FROM_BEDO_TO_SHOP']
    })
    if (payments.length) {
      payments.forEach(payment => {
        if (payment.type === 'PAY_FROM_USER_TO_DRIVER' && payment.for === 'RIDE') {
          const receiveMoneyByBedo: any = convertAmount(
            Number(payment.amount) * (Number(tripCommission.value) / 100)
          )
          bedoTotalAmount -= receiveMoneyByBedo
        } else if (payment.type === 'PAY_FROM_USER_TO_DRIVER' && payment.for === 'DELIVERY') {
          const receiveMoneyByBedo: any =
            convertAmount(Number(payment.amount) * (Number(tripCommission.value) / 100)) +
            convertAmount(Number(payment.amount) * (Number(shopCommission.value) / 100))
          bedoTotalAmount -= receiveMoneyByBedo
        } else if (payment.type === 'PAY_FROM_DRIVER_TO_BEDO' && payment.for === 'RIDE') {
          const receiveMoneyByBedo: any = convertAmount(
            Number(payment.amount) * (Number(tripCommission.value) / 100)
          )
          bedoTotalAmount += receiveMoneyByBedo
        } else if (payment.type === 'PAY_FROM_DRIVER_TO_BEDO' && payment.for === 'DELIVERY') {
          const receiveMoneyByBedo: any = convertAmount(
            Number(payment.amount) * (Number(tripCommission.value) / 100) +
              convertAmount(Number(payment.amount) * (Number(shopCommission.value) / 100))
          )
          bedoTotalAmount += receiveMoneyByBedo
        } else if (payment.type === 'PAY_FROM_BEDO_TO_SHOP') {
          const receiveMoneyByBedo: any = convertAmount(
            Number(payment.amount) * (Number(tripCommission.value) / 100)
          )
          bedoTotalAmount += receiveMoneyByBedo
        }
      })
    }
    return convertAmount(bedoTotalAmount)
  }
})(service)
