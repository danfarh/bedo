/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable indent */
import mongoose, { Types, Document } from 'mongoose'
import _ from 'lodash'
import { ApolloError } from 'apollo-server-express'
import moment from 'moment'
import generateRandomString from 'crypto-random-string'
import service from './service'
import controllerBase from '../../utils/controllerBase'
import driverOrPassengerFilters from '../../utils/driverOrPassengerFilters'
import pubsub from '../../utils/pubsub'
import { UPDATE_ORDER, CREATE_ORDER } from '../../utils/pubsubKeys'
import cartService from '../cart/service'
import orderPromotionService from '../orderPromotion/service'
import { getConstantValue } from '../../utils/redis'
import calculateTimeAndDistance from '../../utils/calculateTimeAndDistance'
import categoryService from '../category/service'
import shopService from '../shop/service'
import sendReceiptByEmail from '../auth/controller'
import calculation, { PromotionFactory, PromotionFor } from '../../utils/calculation'
import paymentService from '../payment/service'
import tripPromotionUsedService from '../tripPromotionUsed/service'
import tripPromotionService from '../tripPromotion/service'
import tripController from '../trip/controller'
import paymentController from '../payment/controller'
import reqCarTypeService from '../reqCarType/service'
import regionController from '../region/controller'
import userService from '../user/service'
import parcelWeightService from '../parcelWeight/service'
import parcelVolumeService from '../parcelVolume/service'
import productService from '../product/service'
import transactionService from '../transaction/service'
import orderService from '../order/service'
import orderSchema from '../order/schema'
import Stripe from '../../utils/payment/gateways/Stripe'
import transaction from '../../utils/permissions/schema/transaction'
import trip from '../trip'
import errorService from '../errors/service'

export default new (class Controller extends controllerBase {
  rawConstants: any[] = []

  async getHistory(user: any, filters: any, pagination: any, sort: any) {
    return service.getHistory(user, filters, pagination, sort)
  }

  async getOrderByShopAdmin(user: any, _id: Types.ObjectId) {
    return service.findOne({ _id, shop: user.shop })
  }

  async getOrdersHistoryByShopAdmin(user: any, filters: any = {}, pagination: any, sort: any) {
    return service.getOrdersHistoryByShopAdmin(user, filters, pagination, sort)
  }

  async getOrdersHistoryByShopAdminCount(user: any, filters: any = {}) {
    return service.getOrdersHistoryByShopAdminCount(user, filters)
  }

  async getOrdersDetailByAdmin(filters: any = {}, sort = { createdAt: -1 }) {
    return service.getOrdersByDetail(filters, sort)
  }

  async finishedOrder(orderId) {
    return service.findOneAndUpdate({ _id: orderId }, { finished: true })
  }

  async getShopTotalOrdersAndTotalAmountByShopAdmin(filters, shopId) {
    return service.calculateOrdersCountAndAmount(filters, shopId)
  }

  async getLastShopOrder(user: any) {
    const lastShopOrder: any = await service.getLastShopOrder(user)
    if (lastShopOrder) {
      if (lastShopOrder.finished && lastShopOrder.commented === 'NOT_COMMENTED') {
        return {
          order: lastShopOrder,
          redirectToCommentSection: true
        }
      }
    }
    return {
      order: lastShopOrder,
      redirectToCommentSection: false
    }
  }

  async orderAcceptance(category: String, user: any) {
    return service.orderAcceptance(category, user.sub)
  }

  async orderRejection(category: String, user: any) {
    const response = await service.orderRejection(category, user)
    return {
      message: response
    }
  }

  async getOrdersByAdmin(filters: any = {}, pagination: any, sort: any) {
    return service.getOrdersByAdmin(filters, pagination, sort)
  }

  async getOrderByAdmin(id: Types.ObjectId) {
    return service.findById(id)
  }

  async getOrdersByAdminCount(filters: any = {}) {
    return service.getOrdersByAdminCount(filters)
  }

  protected async calculatePromotionDiscount(
    data,
    cart,
    onlyCalculate = false,
    forTrip: boolean = false
  ) {
    if (data.promotion && data.shop) {
      const orderPromotionCalculator = PromotionFactory.setCalculationFor(PromotionFor.order)

      let promotion

      if (forTrip) {
        promotion = await tripPromotionService.findOne({
          _id: data.promotion,
          for: { $ne: 'RIDE' },
          $or: [
            {
              'canUse.0': { $exists: true },
              canUse: data.user
            },
            {
              'canUse.0': { $exists: false },
              'canNotUse.0': { $exists: true },
              canNotUse: { $ne: data.user }
            },
            {
              'canUse.0': { $exists: false },
              'canNotUse.0': { $exists: false }
            }
          ]
        })
      } else {
        promotion = await orderPromotionService.findOne({
          shop: data.shop,
          _id: data.promotion
        })
      }

      if (!promotion) {
        return 0
      }
      const promotionDiscount = await orderPromotionCalculator.calculate(
        cart.afterDiscountPrice,
        promotion,
        {
          userId: data.user,
          usedFor: data._id
        },
        onlyCalculate,
        forTrip ? tripPromotionUsedService : null
      )

      return promotionDiscount || 0
    }
    return 0
  }

  protected async getEstimatedDelivery(data, shop) {
    const now = moment()
    const origin: any = {
      long: shop.location.coordinates[0],
      lat: shop.location.coordinates[1]
    }
    const orderBasePrepareTime =
      Number(shop.preparingTime) || (await getConstantValue('ORDER_BASE_PREPARE_TIME', 20))
    try {
      const timeAndDistance = await calculateTimeAndDistance(origin, [data.userLocation])
      if (timeAndDistance.length === 0)
        throw new ApolloError(
          'There is no routes between your address and your selected shop.',
          '400'
        )
      if (timeAndDistance && timeAndDistance[0] && timeAndDistance[0].duration) {
        return now.add(timeAndDistance[0].duration + orderBasePrepareTime, 'minutes')
      }
      return now.add(orderBasePrepareTime, 'minutes')
    } catch (e) {
      return now.add(orderBasePrepareTime, 'minutes')
    }
  }

  async generateTrackId() {
    const randomString = generateRandomString({
      length: 10
    })
    const duplicate = await service.findOne({
      'tracking.trackId': randomString
    })
    if (duplicate) {
      return this.generateTrackId()
    }
    return randomString
  }

  async getOrderShippingPrice(data, shop, reqCarTypeId, cart, language: any): Promise<number> {
    const error = await errorService.findOneFromView(
      { title: 'unable to calculate shipping price' },
      language
    )
    const [[parcelWeight], [parcelVolume]]: any = await Promise.all([
      parcelWeightService.find({}, { limit: 15, skip: 0 }, { order: 1 }),
      parcelVolumeService.find({}, { limit: 15, skip: 0 }, { order: 1 })
    ])
    // eslint-disable-next-line no-shadow
    const trip: any = await tripController.createTrip(
      {
        tripType: 'DELIVERY',
        tipValue: 0,
        origin: {
          long: shop.location.coordinates[0],
          lat: shop.location.coordinates[1]
        },
        radiusCoefficient: 1,
        passenger: data.user,
        destinations: [data.userLocation],
        reqCarType: mongoose.Types.ObjectId(),
        parcelDestinations: [
          {
            order: 1,
            receiverInfo: {},
            parcelsInfo: {
              numberOfParcels: cart.products.length,
              parcelsWeight: parcelWeight._id,
              parcelsVolume: parcelVolume._id,
              ParcelsDescription: 'shop delivery'
            },
            orderingForSomeoneElse: {
              is: false
            }
          }
        ]
      },
      true,
      { sub: data.user },
      true,
      language
    )
    if (!trip) {
      throw new ApolloError(error.text, '400')
    }
    const costObjectBasedOneReqCarType = trip.allCost.find(
      i => String(i.reqCarType.id) === String(reqCarTypeId)
    )
    if (costObjectBasedOneReqCarType) {
      return costObjectBasedOneReqCarType.cost
    }

    throw new ApolloError(error.text, '400')
  }

  protected async calculateExtraFieldsOfOrder(data, onlyCalculate = false, language: any) {
    let error: any = {}
    // shop and cart data
    const cart =
      data.cart && data.cart.finalPrice ? data.cart : await cartService.findById(data.cart)
    const shop = await shopService.findById(data.shop)
    if (!shop) {
      error = await errorService.findOneFromView({ title: 'shop not found' }, language)
      throw new ApolloError(error.text, '400')
    }
    if (!cart) {
      error = await errorService.findOneFromView({ title: 'cart not found' }, language)
      throw new ApolloError(error.text, '400')
    }

    // cart prices
    const { productsPrice } = cart
    const { discount } = cart
    const { afterDiscountPrice: priceAfterDiscount } = cart

    // promotion
    const promotionDiscount = await this.calculatePromotionDiscount(data, cart, onlyCalculate)
    const priceAfterPromotionDiscount = priceAfterDiscount - promotionDiscount
    // hst and commission
    const commissionPercent = await getConstantValue('SHOP_COMMISSION', 20)
    const HSTPercent = await getConstantValue('SHOP_HST', 13)

    // delivery price
    const deliveryWithoutPromotion = await this.getOrderShippingPrice(
      data,
      shop,
      await this.findReqCarTypeBasedOnCart(cart.products),
      cart,
      language
    )
    // to do promotion discount from spark!!!
    const deliveryPromotionDiscount =
      promotionDiscount > 0
        ? 0
        : await this.calculatePromotionDiscount(data, cart, onlyCalculate, true)
    const delivery = deliveryWithoutPromotion - deliveryPromotionDiscount
    // subtotal prices
    const subtotal = priceAfterPromotionDiscount
    const HST = calculation.convertAmount(0.01 * HSTPercent * subtotal)
    const shopInvoice = subtotal + HST

    // shop and spark share
    const commission = calculation.convertAmount(0.01 * commissionPercent * shopInvoice)
    const sparkShare = commission // alias for commission
    const shopShare = calculation.convertAmount(shopInvoice - sparkShare)
    const shopIncome = shopShare // alias for shopShare

    // final price
    const total = calculation.convertAmount(subtotal + HST + delivery)

    // estimated delivery
    const estimatedDelivery = await this.getEstimatedDelivery(data, shop)
    return {
      productsPrice,
      priceAfterDiscount,
      delivery,
      subtotal,
      total,
      finalPrice: total,
      shopIncome,
      discount,
      commissionPercent,
      commission,
      HSTPercent,
      HST,
      priceAfterPromotionDiscount,
      promotionDiscount,
      promotion: discount > 0 ? data.promotion : null,
      shopInvoice,
      sparkShare,
      shopShare,
      deliveryWithoutPromotion,
      deliveryPromotionDiscount,
      tracking: {
        trackId: await this.generateTrackId(),
        estimatedDelivery
      }
    }
  }

  async createOrder(user, data, onlyCalculate = false, language: any) {
    let error: any = {}
    const category = await categoryService.findById(data.rootCategory)
    if (!category) {
      error = await errorService.findOneFromView({ title: 'category not found' }, language)
      throw new ApolloError(error.text, '400')
    }
    if (!onlyCalculate) {
      await regionController.checkLocationIsInRegions(data.userLocation)
    }
    const { value: categoryTitle } = category.title.find(obj => obj.lang === 'en')
    const cart: any = await cartService.createCartFromRedis(
      `cart_${categoryTitle}_user-${user.sub}`
    )
    if (!cart || !cart.products.length) {
      error = await errorService.findOneFromView({ title: 'cart not found' }, language)
      throw new ApolloError(error.text, '400')
    }
    console.log(' data.rootCategory ', data.rootCategory)
    console.log(' category ', category)
    data.type = String(categoryTitle).toUpperCase()
    console.log(' data.type ', data.type)
    const basicOrderData = {
      ...data,
      user: user.sub,
      cart: cart._id,
      status: 'PENDING',
      finished: false,
      commented: 'NOT_COMMENTED'
    }

    const finalData = {
      ...basicOrderData,
      ...(await this.calculateExtraFieldsOfOrder(basicOrderData, onlyCalculate, language))
    }
    if (onlyCalculate) {
      return finalData
    }
    //! if any pending order, finish it
    await service.findOneAndUpdate(
      { user: user.sub, status: 'PENDING' },
      { status: 'FINISHED_DUE_TO_NOT_PAYING', finished: true }
    )
    const order: any = await super.create(user, { ...finalData })

    pubsub.publish(CREATE_ORDER, {
      createOrder: order
    })
    return order
  }

  async updateProductSetStock(cartId, state) {
    const cart = await cartService.findById(cartId)
    cart.products.forEach(async ({ product, quantity }) => {
      if (state === 'ACCEPTED')
        await productService.findOneAndUpdate(product, { $inc: { stock: -Number(quantity) } })
      if (state === 'REJECTED')
        await productService.findOneAndUpdate(product, { $inc: { stock: Number(quantity) } })
    })
  }

  async completeOrderPayment(orderId, paymentIntent) {
    const order = await this.service.findById(orderId)
    if (order.status === 'ACCEPTED') {
      return true
    }
    await this.updateProductSetStock(order.cart, 'ACCEPTED')
    await paymentController.payOrder(orderId, paymentIntent)
    const trip = await this.createOrderDelivery(order, true)
    const updatedOrder = await this.service.findOneAndUpdate(
      { _id: orderId },
      {
        status: 'ACCEPTED',
        trip: trip._id
      }
    )
    const user: any = await userService.findById(order.user)
    await sendReceiptByEmail.sendOrderReceiptEmail(
      { fullName: user.fullName, email: user.email },
      {
        Cart: order.productsPrice,
        Promotion: order.discount,
        SubTotal: order.subtotal,
        Delivery: order.delivery,
        HST: order.HST,
        Total: order.total,
        orderType: order.type
      }
    )
    pubsub.publish(CREATE_ORDER, {
      createOrder: updatedOrder
    })
    pubsub.publish(UPDATE_ORDER, {
      updateOrder: updatedOrder
    })
    return true
  }

  async applyPromotionToOrder(user, _id, { promotion, rootCategory }, language: any) {
    const order = await service.findOne({
      _id,
      user: user.sub
    })
    if (!order) {
      const error = await errorService.findOneFromView({ title: 'order not found!' }, language)
      throw new ApolloError(error.text, '404')
    }

    const newOrderData = {
      promotion,
      ...(await this.calculateExtraFieldsOfOrder(
        {
          rootCategory,
          ...order.toObject(),
          promotion
        },
        false,
        language
      ))
    }
    const updatedOrder = await this.service.findOneAndUpdate({ _id, user: user.sub }, newOrderData)

    pubsub.publish(UPDATE_ORDER, {
      updateOrder: updatedOrder
    })
    return updatedOrder
  }

  async createOrderDelivery(order: any, reserve = false) {
    // if order or shop are object ids
    if (!order._id) {
      order = await service.findById(order)
    }
    const [shop, receiverInfo, cart, [parcelWeight], [parcelVolume]]: any = await Promise.all([
      shopService.findById(order.shop),
      userService.findById(order.user),
      cartService.findById(order.cart),
      parcelWeightService.find({}, { limit: 15, skip: 0 }, { order: 1 }),
      parcelVolumeService.find({}, { limit: 15, skip: 0 }, { order: 1 })
    ])
    if (!shop) {
      throw new ApolloError('shop not found', '404')
    }

    if (!receiverInfo) {
      throw new ApolloError('order receiver not found', '404')
    }

    if (!cart) {
      throw new ApolloError('order cart not found', '404')
    }

    const deliveryUser: any = await userService.findById(shop.deliveryUser)

    if (!deliveryUser) {
      throw new ApolloError('shop user not found', '404')
    }

    const suggestedReqCarTypeId = await this.findReqCarTypeBasedOnCart(cart.products)
    if (!suggestedReqCarTypeId) {
      throw new ApolloError('no common req car type founded for order products')
    }
    const suggestedReqCarType = await reqCarTypeService.findById(suggestedReqCarTypeId)
    if (!suggestedReqCarType) {
      throw new ApolloError('no common req car type founded for order products')
    }
    // console.log('firstCommonReqCarType._id, ', firstCommonReqCarType)
    const trip = await tripController.createTrip(
      {
        tripType: 'DELIVERY',
        tipValue: 0,
        origin: {
          long: shop.location.coordinates[0],
          lat: shop.location.coordinates[1]
        },
        orderType: order.type,
        radiusCoefficient: 1,
        passenger: deliveryUser._id,
        destinations: [order.userLocation],
        reqCarType: suggestedReqCarType._id,
        isForShopDelivery: true,
        trackId: order.tracking.trackId,
        shopOrder: order._id,
        ...(reserve && {
          reserved: {
            type: true,
            date: moment(order.createdAt).add(
              shop.preparingTime || (await getConstantValue('ORDER_BASE_PREPARE_TIME', 20)),
              'minutes'
            )
          }
        }),
        parcelDestinations: [
          {
            order: 1,
            receiverInfo: {
              fullName: receiverInfo.fullName,
              phoneNumber: receiverInfo.phoneNumber,
              address: `${order.address}${order.description ? ` - ${order.description}` : ''}`
            },
            parcelsInfo: {
              numberOfParcels: cart.products.length,
              parcelsWeight: parcelWeight._id,
              parcelsVolume: parcelVolume._id,
              ParcelsDescription: 'shop delivery'
            },
            orderingForSomeoneElse: {
              is: false
            }
          }
        ]
      },
      false,
      { sub: order.user },
      'en',
      true
    )

    if (!trip) {
      throw new ApolloError('unable to create shop delivery', '400')
    }
    return trip
  }

  async findReqCarTypeBasedOnCart(products) {
    const requestReqCarTypes: any = []
    const reqCarTypes = await reqCarTypeService.find()
    const bike = reqCarTypes.find(element => element.name === 'BIKE_MOTORCYCLE')
    const car = reqCarTypes.find(element => element.name === 'CARS')
    const truk = reqCarTypes.find(element => element.name === 'TRUCK_TRAILER')
    const reqCarTypesEnum = {
      [bike._id]: 0,
      [car._id]: 1,
      [truk._id]: 2
    }
    for (let index = 0; index < products.length; index++) {
      const { reqCarTypes: productReqCarTypes } = await productService.findById(
        products[index].product
      )
      const reqCarTypeBasedOnEnum = productReqCarTypes.map(
        productReqCarType => reqCarTypesEnum[productReqCarType]
      )
      requestReqCarTypes.push(_.min(reqCarTypeBasedOnEnum))
    }
    const reqCarTypeValue = _.max(requestReqCarTypes)
    return Object.keys(reqCarTypesEnum).find(key => reqCarTypesEnum[key] === reqCarTypeValue)
  }

  async reCreateOrderDelivery(user, orderId, reserve = false) {
    const order = await service.findOne({
      _id: orderId,
      shop: user.shop
    })
    if (!order) {
      throw new ApolloError('order not found', '404')
    }

    const shop = await shopService.findOne({
      _id: order.shop
    })
    if (!shop) {
      throw new ApolloError('shop not found', '404')
    }

    if (shop.shopAdmin.toString() !== user.sub) {
      throw new ApolloError('this order is not yours', '400')
    }

    if (![...(reserve ? [] : ['ACCEPTED']), 'DELIVERY_NOT_ACCEPTED'].includes(order.status)) {
      throw new ApolloError(
        `can not send new delivery request when order is in '${order.status}' status`
      )
    }

    // reserve delivery
    const trip: any = await this.createOrderDelivery(order, reserve)

    // update order
    const updatedOrder = await this.service.findOneAndUpdate(
      { _id: order._id },
      {
        status: 'ACCEPTED',
        trip: trip._id
      }
    )

    pubsub.publish(UPDATE_ORDER, {
      updateOrder: updatedOrder
    })
    return updatedOrder
  }

  async rejectOrder(user, orderId, rejectedFor, checkShopAdmin = true) {
    const order = await service.findOne({
      _id: orderId
    })
    if (!order) {
      throw new ApolloError('order not found', '404')
    }

    if (checkShopAdmin) {
      const shop = await shopService.findOne({
        _id: order.shop
      })
      if (!shop) {
        throw new ApolloError('shop not found', '404')
      }
      if (shop.shopAdmin.toString() !== user.sub) {
        throw new ApolloError('this order is not yours', '400')
      }
    }

    if (!['PENDING'].includes(order.status)) {
      throw new ApolloError(`can not reject order when order is in ${order.status} status`, '400')
    }

    // const isRejectForDeliveryAcceptation = ['deliveryWasNotAccepted', 'noReceiver'].includes(
    //   rejectedFor
    // )

    // if (isRejectForDeliveryAcceptation && order.status !== 'DELIVERY_NOT_ACCEPTED') {
    //   // eslint-disable-next-line quotes
    //   throw new ApolloError("delivery status isn't 'DELIVERY_NOT_ACCEPTED'", '400')
    // }

    // update order
    const updatedOrder = await this.service.findOneAndUpdate(
      { _id: order._id },
      {
        status: 'REJECTED',
        rejectedFor,
        finished: true
      }
    )
    await this.updateProductSetStock(order.cart, 'REJECTED')
    pubsub.publish(UPDATE_ORDER, {
      updateOrder: updatedOrder
    })
    //! create punishment for shop as much as sparkShare
    // const penalty = await paymentController.createPunishmentPayment(
    //   'SHOP',
    //   order.shop,
    //   order.sparkShare,
    //   order.type,
    //   'penalty for rejecting order'
    // )
    // console.log('shop penalty: ', penalty)
    //! refund
    // await this.refundOrderPayment(order)
    return updatedOrder
  }

  async acceptOrder(inputs, orderId, user) {
    const order = await service.findOne({
      _id: orderId,
      shop: user.shop
    })
    if (!order) {
      throw new ApolloError('order not found or not ralated to your shop', '404')
    }
    const shop = await shopService.findOne({
      _id: order.shop
    })
    if (!shop) {
      throw new ApolloError('shop not found', '404')
    }
    if (inputs.shipmentModel === 'SHOP' && !inputs.driver)
      throw new ApolloError('You must select driver')
    // update order
    const updatedOrder = await this.service.findOneAndUpdate(
      { _id: order._id },
      {
        status: 'ACCEPTED',
        ...inputs
      }
    )
    pubsub.publish(UPDATE_ORDER, {
      updateOrder: updatedOrder
    })
    return updatedOrder
  }

  async updateOrderByAdmin(inputs, orderId) {
    const order = await service.findOne({
      _id: orderId
    })
    if (!order) {
      throw new ApolloError('order not found', '404')
    }
    const shop = await shopService.findOne({
      _id: order.shop
    })
    if (!shop) {
      throw new ApolloError('shop not found', '404')
    }
    // update order
    const updatedOrder = await this.service.findOneAndUpdate(
      { _id: order._id },
      {
        ...inputs
      }
    )
    pubsub.publish(UPDATE_ORDER, {
      updateOrder: updatedOrder
    })
    return updatedOrder
  }

  async deleteOrderByAdmin(orderId) {
    const order = await service.findOne({
      _id: orderId
    })
    if (!order) {
      throw new ApolloError('order not found', '404')
    }
    await order.remove()
    return {
      message: 'The order has been removed.'
    }
  }

  async refundOrderPayment(order) {
    const payment: any = await paymentService.findById(order.payment)
    const trs: any = await transactionService.findById(payment.transactionId)
    try {
      const refund: any = await Stripe.refund(trs.transactionId, trs.paymentIntent)
      console.log('order refunded : ', refund)
      return transactionService.findOneAndUpdate(payment.transactionId, {
        refundId: refund.id,
        reversed: true
      })
    } catch (err) {
      console.log(err)
      return err
    }
  }

  async changeStatusToShipping(_id) {
    const order = await service.findById(_id)
    if (!order) {
      throw new ApolloError('order not found', '404')
    }
    if (order.status !== 'ACCEPTED') {
      throw new ApolloError('order status is not preparing', '400')
    }

    const updatedOrder = await service.findOneAndUpdate(_id, {
      status: 'SHIPPING'
    })
    pubsub.publish(UPDATE_ORDER, {
      updateOrder: updatedOrder
    })
    return order
  }

  async changeStatusToDelivered(tripp: any) {
    const orderId: Types.ObjectId = tripp.shopOrder
    const order = await service.findById(orderId)
    if (!order) {
      throw new ApolloError('order not found', '404')
    }
    if (order.status !== 'SHIPPING') {
      throw new ApolloError('order status is not preparing', '400')
    }

    const updatedOrder = await service.findOneAndUpdate(orderId, {
      status: 'DELIVERED',
      finished: true
    })
    //! Payment of order
    await paymentController.payForOrder(tripp, order._id)

    pubsub.publish(UPDATE_ORDER, {
      updateOrder: updatedOrder
    })

    return order
  }

  // async cancelReservation(orderId, userId) {
  //   const order = await this.service.findById(orderId)
  //   if (!order) {
  //     throw new ApolloError('order not found!', '404')
  //   }
  //   if (order.user.toString() !== userId) {
  //     throw new ApolloError('order does not belong to this user.', '400')
  //   }
  //   if (order.type !== 'RESERVE') {
  //     throw new ApolloError('this order is not reserved.', '400')
  //   }
  //   if (order.reserveCanceled) {
  //     throw new ApolloError('this order is already canceled.', '400')
  //   }
  //   if (order.status.includes(['PREPARING', 'SHIPPING', 'DELIVERED', 'REJECTED'])) {
  //     throw new ApolloError('reservation cannot be canceled at this stage.', '400')
  //   }
  //   const shop = await shopService.findById(order.shop)
  //   const today = moment(new Date()).utc().format('ddd').toUpperCase()
  //   if (shop.notWorkingDays.map(el => el.type).includes(today)) {
  //     order.reserveCanceled = true
  //     await order.save()
  //     return {
  //       message: 'Reservation successfully canceled.'
  //     }
  //   }
  //   const shopTodayWorkingTimes = shop.workingHoursInMinutes
  //     .filter(el => el.type === today)
  //     .map(el => {
  //       const from = new Date(new Date().setHours(Math.floor(el.from / 60), el.from % 60, 0))
  //       const to = new Date(new Date().setHours(Math.floor(el.to / 60), el.to % 60, 0))
  //       return { from, to }
  //     })
  //   let canCancel = true
  //   const now = new Date()
  //   // eslint-disable-next-line no-restricted-syntax
  //   for (const time of shopTodayWorkingTimes) {
  //     if (time.from < now && now < time.to) {
  //       canCancel = false
  //       break
  //     }
  //   }
  //   if (!canCancel) {
  //     throw new ApolloError('you cannot cancel your reservation.', '400')
  //   }
  //   order.reserveCanceled = true
  //   await order.save()
  //   return {
  //     message: 'Reservation successfully canceled.'
  //   }
  // }

  async getFullReportByShopAdmin(user, pagination) {
    const shop: any = await shopService.findById(user.shop)
    if (!shop) {
      throw new ApolloError('shop not found', '404')
    }
    const orders = await service.find({ shop: shop._id }, pagination)

    return orders
  }

  async getOrdersStatisticsListByShopAdmin(user, filters: any = {}) {
    const shop: any = await shopService.findById(user.shop)
    if (!shop) {
      throw new ApolloError('shop not found', '404')
    }
    if ('to' in filters && 'from' in filters) {
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
      delete filters.from
      delete filters.to
    }

    const successfulOrders = await service.count({
      ...filters,
      shop: shop._id,
      status: 'DELIVERED'
    })
    const unSuccessfulOrders = await service.count({
      ...filters,
      shop: shop._id,
      status: ['REJECTED', 'DELIVERY_NOT_ACCEPTED', 'FINISHED_DUE_TO_NOT_PAYING']
    })
    const returnedOrders = await service.count({
      ...filters,
      shop: shop._id,
      status: 'REJECTED'
    })
    // all of the orders
    const receivedOrders = await service.count({
      ...filters,
      shop: shop._id
    })
    const cashDaySales = await transactionService.count({
      ...filters,
      shop: shop._id,
      transactionMethod: 'CASH'
    })
    const cardDaySales = await transactionService.count({
      ...filters,
      shop: shop._id,
      transactionMethod: 'ONLINE'
    })

    let companyCommission = 0
    let numberOfSales = 0
    const order: any = await service.find({
      ...filters,
      shop: shop._id,
      status: ['ACCEPTED', 'DELIVERED']
    })
    if (order.length) {
      for (let i = 0; i < order.length; i++) {
        if (order[i].commission) {
          companyCommission += order[i].commission
        }
        if (order[i].cart) {
          const cart: any = await cartService.findById(order[i].cart)
          if (cart && cart.products) {
            for (let j = 0; j < cart.products.length; j++) {
              numberOfSales += cart.products[j].quantity
            }
          }
        }
      }
    }

    return {
      successfulOrders,
      unSuccessfulOrders,
      returnedOrders,
      receivedOrders,
      numberOfSales,
      cashDaySales,
      cardDaySales,
      companyCommission
    }
  }

  addDays(date, days) {
    const copy = new Date(Number(date))
    copy.setDate(date.getDate() + days)
    return copy
  }

  addHours(date, h) {
    const copy = new Date(Number(date))
    copy.setTime(copy.getTime() + h * 60 * 60 * 1000)
    return copy
  }

  differenceDays(day1, day2) {
    const Day1: any = new Date(day1)
    const Day2: any = new Date(day2)
    const difference = Math.abs(Day2 - Day1)
    const days = difference / (1000 * 3600 * 24)
    return Math.floor(days)
  }

  async countOrdersInOneDay(shopId, filters: any = {}, days, createdFrom) {
    const successfulOrdersArr: any = []
    const unSuccessfulOrdersArr: any = []
    const returnedOrdersArr: any = []
    const receivedOrdersArr: any = []
    const cashDaySalesArr: any = []
    const cardDaySalesArr: any = []
    const companyCommissionArr: any = []
    const numberOfSalesArr: any = []
    const from = new Date(createdFrom)
    for (let i = 0; i <= days; i++) {
      const date = this.addDays(from, i)
      filters.createdAt = {
        $gte: moment(new Date(date))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(date))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.from
      delete filters.to
      delete filters.hour

      const successfulOrders = await orderService.count({
        ...filters,
        shop: shopId,
        status: 'DELIVERED'
      })
      const unSuccessfulOrders = await orderService.count({
        ...filters,
        shop: shopId,
        status: ['REJECTED', 'DELIVERY_NOT_ACCEPTED', 'FINISHED_DUE_TO_NOT_PAYING']
      })
      const returnedOrders = await orderService.count({
        ...filters,
        shop: shopId,
        status: 'REJECTED'
      })
      //all of the orders
      const receivedOrders = await orderService.count({
        ...filters,
        shop: shopId
      })
      const cashDaySales = await transactionService.count({
        ...filters,
        shop: shopId,
        transactionMethod: 'CASH'
      })
      const cardDaySales = await transactionService.count({
        ...filters,
        shop: shopId,
        transactionMethod: 'ONLINE'
      })

      let companyCommission = 0
      let numberOfSales = 0
      const order: any = await orderService.find({ ...filters, shop: shopId })
      if (order.length) {
        for (let i = 0; i < order.length; i++) {
          if (order[i].commission) {
            companyCommission += order[i].commission
          }
          if (order[i].cart) {
            const cart: any = await cartService.findById(order[i].cart)
            if (cart && cart.products) {
              for (let j = 0; j < cart.products.length; j++) {
                numberOfSales += cart.products[j].quantity
              }
            }
          }
        }
      }

      const successfulOrdersObj = {
        num: successfulOrders,
        date
      }
      const unSuccessfulOrdersObj = {
        num: unSuccessfulOrders,
        date
      }
      const returnedOrdersObj = {
        num: returnedOrders,
        date
      }
      const receivedOrdersObj = {
        num: receivedOrders,
        date
      }
      const cashDaySalesObj = {
        num: cashDaySales,
        date
      }
      const cardDaySalesObj = {
        num: cardDaySales,
        date
      }
      const companyCommissionObj = {
        num: companyCommission,
        date
      }
      const numberOfSalesObj = {
        num: numberOfSales,
        date
      }

      successfulOrdersArr.push(successfulOrdersObj)
      unSuccessfulOrdersArr.push(unSuccessfulOrdersObj)
      returnedOrdersArr.push(returnedOrdersObj)
      receivedOrdersArr.push(receivedOrdersObj)
      cashDaySalesArr.push(cashDaySalesObj)
      cardDaySalesArr.push(cardDaySalesObj)
      companyCommissionArr.push(companyCommissionObj)
      numberOfSalesArr.push(numberOfSalesObj)
    }

    return {
      successfulOrders: successfulOrdersArr,
      unSuccessfulOrders: unSuccessfulOrdersArr,
      returnedOrders: returnedOrdersArr,
      receivedOrders: receivedOrdersArr,
      cashDaySales: cashDaySalesArr,
      cardDaySales: cardDaySalesArr,
      companyCommission: companyCommissionArr,
      numberOfSales: numberOfSalesArr
    }
  }

  async countOrdersInHours(shopId, filters: any = {}) {
    const successfulOrdersArr: any = []
    const unSuccessfulOrdersArr: any = []
    const returnedOrdersArr: any = []
    const receivedOrdersArr: any = []
    const cashDaySalesArr: any = []
    const cardDaySalesArr: any = []
    const companyCommissionArr: any = []
    const numberOfSalesArr: any = []
    const d = filters.from
    const splitDate = d.split('T')[0]
    const date = new Date(splitDate)
    const today = this.addHours(date, 1)
    let from = this.addHours(date, 1)
    const hour = filters.hour
    for (let i = 0; i < 24; i += hour) {
      const to = this.addHours(today, i + hour - 1)
      filters.createdAt = {
        $gte: moment(new Date(from))
          .utc()
          .startOf('hour')
          .toDate(),
        $lte: moment(new Date(to))
          .utc()
          .endOf('hour')
          .toDate()
      }
      delete filters.from
      delete filters.to
      delete filters.hour

      const successfulOrders = await orderService.count({
        ...filters,
        shop: shopId,
        status: 'DELIVERED'
      })
      const unSuccessfulOrders = await orderService.count({
        ...filters,
        shop: shopId,
        status: ['REJECTED', 'DELIVERY_NOT_ACCEPTED', 'FINISHED_DUE_TO_NOT_PAYING']
      })
      const returnedOrders = await orderService.count({
        ...filters,
        shop: shopId,
        status: 'REJECTED'
      })
      //all of the orders
      const receivedOrders = await orderService.count({
        ...filters,
        shop: shopId
      })
      const cashDaySales = await transactionService.count({
        ...filters,
        shop: shopId,
        transactionMethod: 'CASH'
      })
      const cardDaySales = await transactionService.count({
        ...filters,
        shop: shopId,
        transactionMethod: 'ONLINE'
      })

      let companyCommission = 0
      let numberOfSales = 0
      const order: any = await orderService.find({ ...filters, shop: shopId })
      if (order.length) {
        for (let i = 0; i < order.length; i++) {
          if (order[i].commission) {
            companyCommission += order[i].commission
          }
          if (order[i].cart) {
            const cart: any = await cartService.findById(order[i].cart)
            if (cart && cart.products) {
              for (let j = 0; j < cart.products.length; j++) {
                numberOfSales += cart.products[j].quantity
              }
            }
          }
        }
      }

      const successfulOrdersObj = {
        num: successfulOrders,
        date: to
      }
      const unSuccessfulOrdersObj = {
        num: unSuccessfulOrders,
        date: to
      }
      const returnedOrdersObj = {
        num: returnedOrders,
        date: to
      }
      const receivedOrdersObj = {
        num: receivedOrders,
        date: to
      }
      const cashDaySalesObj = {
        num: cashDaySales,
        date: to
      }
      const cardDaySalesObj = {
        num: cardDaySales,
        date: to
      }
      const companyCommissionObj = {
        num: companyCommission,
        date: to
      }
      const numberOfSalesObj = {
        num: numberOfSales,
        date: to
      }

      successfulOrdersArr.push(successfulOrdersObj)
      unSuccessfulOrdersArr.push(unSuccessfulOrdersObj)
      returnedOrdersArr.push(returnedOrdersObj)
      receivedOrdersArr.push(receivedOrdersObj)
      cashDaySalesArr.push(cashDaySalesObj)
      cardDaySalesArr.push(cardDaySalesObj)
      companyCommissionArr.push(companyCommissionObj)
      numberOfSalesArr.push(numberOfSalesObj)
      from = to
    }

    return {
      successfulOrders: successfulOrdersArr,
      unSuccessfulOrders: unSuccessfulOrdersArr,
      returnedOrders: returnedOrdersArr,
      receivedOrders: receivedOrdersArr,
      cashDaySales: cashDaySalesArr,
      cardDaySales: cardDaySalesArr,
      companyCommission: companyCommissionArr,
      numberOfSales: numberOfSalesArr
    }
  }

  async getOrderStatisticsListCountValuesByShopAdmin(user, filters: any = {}) {
    const shop: any = await shopService.findById(user.shop)
    if (!shop) {
      throw new ApolloError('shop not found', '404')
    }
    //the last 3 days && the last 7 days && the last 30 days && TODAY
    if ('from' in filters && 'to' in filters) {
      const days = this.differenceDays(filters.to, filters.from)
      //TODAY
      if (days === 0 && 'hour' in filters) {
        const countOrdersInHours = this.countOrdersInHours(shop._id, filters)
        return countOrdersInHours
      }
      //the last 3 days && the last 7 days && the last 30 days
      else {
        const countOrders: any = this.countOrdersInOneDay(shop._id, filters, days, filters.from)
        return countOrders
      }
    }
    //all the time
    if (!filters.from && !filters.to) {
      const orders: any = await orderSchema.find({ shop: shop._id }).sort({
        createdAt: 1
      })
      if (!orders.length) {
        const countOrdersAllTheTime: any = []
        const obj = {
          num: 0,
          date: new Date(Date.now())
        }
        countOrdersAllTheTime.push(obj)
        return countOrdersAllTheTime
      }
      const from = orders[0].createdAt
      const to = new Date(Date.now())
      const days = this.differenceDays(to, from)
      const countOrders = this.countOrdersInOneDay(shop._id, filters, days, from)
      return countOrders
    }
  }

  async getOrdersByShopAdmin(user, filters, pagination, sort) {
    return service.getOrdersByShopAdmin(user, filters, pagination, sort)
  }

  async getOrdersByShopAdminCount(user, filters) {
    return service.getOrdersByShopAdminCount(user, filters)
  }

  async changeStatusToNotAccepted(orderId) {
    const order = await service.findOneAndUpdate(orderId, {
      status: 'DELIVERY_NOT_ACCEPTED',
      trip: null
    })

    if (!order) {
      throw new ApolloError('order not found', '404')
    }

    pubsub.publish(UPDATE_ORDER, {
      updateOrder: order
    })

    return order
  }

  // eslint-disable-next-line consistent-return
  async getOrderStatisticsListCountValuesByAdmin(shopId, filters: any = {}) {
    const shop: any = await shopService.findById(shopId)
    if (!shop) {
      throw new ApolloError('shop not found', '404')
    }
    // the last 3 days && the last 7 days && the last 30 days && TODAY
    if ('from' in filters && 'to' in filters) {
      const days = this.differenceDays(filters.to, filters.from)
      // TODAY
      if (days === 0 && 'hour' in filters) {
        const countOrdersInHours = this.countOrdersInHours(shop._id, filters)
        return countOrdersInHours
      }
      // the last 3 days && the last 7 days && the last 30 days
      else {
        const countOrders: any = this.countOrdersInOneDay(shop._id, filters, days, filters.from)
        return countOrders
      }
    }
    // all the time
    if (!filters.from && !filters.to) {
      const orders: any = await orderSchema.find({ shop: shop._id }).sort({
        createdAt: 1
      })
      if (!orders.length) {
        const countOrdersAllTheTime: any = []
        const obj = {
          num: 0,
          date: new Date(Date.now())
        }
        countOrdersAllTheTime.push(obj)
        return countOrdersAllTheTime
      }
      const from = orders[0].createdAt
      const to = new Date(Date.now())
      const days = this.differenceDays(to, from)
      const countOrders = this.countOrdersInOneDay(shop._id, filters, days, from)
      return countOrders
    }
  }

  async getFullReportByAdmin(shopId, pagination) {
    const shop: any = await shopService.findById(shopId)
    if (!shop) {
      throw new ApolloError('shop not found', '404')
    }
    const orders = await service.find({ shop: shop._id }, pagination)

    return orders
  }

  async getOrdersStatisticsListByAdmin(shopId, filters: any = {}) {
    const shop: any = await shopService.findById(shopId)
    if (!shop) {
      throw new ApolloError('shop not found', '404')
    }
    if ('to' in filters && 'from' in filters) {
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
      delete filters.from
      delete filters.to
    }

    const successfulOrders = await service.count({
      ...filters,
      shop: shop._id,
      status: 'DELIVERED'
    })
    const unSuccessfulOrders = await service.count({
      ...filters,
      shop: shop._id,
      status: ['REJECTED', 'DELIVERY_NOT_ACCEPTED', 'FINISHED_DUE_TO_NOT_PAYING']
    })
    const returnedOrders = await service.count({
      ...filters,
      shop: shop._id,
      status: 'REJECTED'
    })
    // all of the orders
    const receivedOrders = await service.count({
      ...filters,
      shop: shop._id
    })
    const cashDaySales = await transactionService.count({
      ...filters,
      shop: shop._id,
      transactionMethod: 'CASH'
    })
    const cardDaySales = await transactionService.count({
      ...filters,
      shop: shop._id,
      transactionMethod: 'ONLINE'
    })

    let companyCommission = 0
    let numberOfSales = 0
    const order: any = await service.find({
      ...filters,
      shop: shop._id,
      status: ['ACCEPTED', 'DELIVERED']
    })
    if (order.length) {
      for (let i = 0; i < order.length; i++) {
        if (order[i].commission) {
          companyCommission += order[i].commission
        }
        if (order[i].cart) {
          const cart: any = await cartService.findById(order[i].cart)
          if (cart && cart.products) {
            for (let j = 0; j < cart.products.length; j++) {
              numberOfSales += cart.products[j].quantity
            }
          }
        }
      }
    }

    return {
      successfulOrders,
      unSuccessfulOrders,
      returnedOrders,
      receivedOrders,
      numberOfSales,
      cashDaySales,
      cardDaySales,
      companyCommission
    }
  }
})(service)
