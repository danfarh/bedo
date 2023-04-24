/* eslint-disable indent */
/* eslint-disable no-multi-assign */
/* eslint-disable no-unused-expressions */
import { Types } from 'mongoose'
import productSchema from '../product/schema'
import { ApolloError } from 'apollo-server-express'
import Model from './schema'
import shopService from '../shop/service'
import productService from '../product/service'
import categoryService from '../category/service'
import serviceBase from '../../utils/serviceBase'
import {
  PromotionFactory,
  PromotionFor,
  calculateShipmentCost,
  calculateOrder
} from '../../utils/calculation'
import { RedisSetObject, RedisGetObject, RedisDelete, RedisGet, RedisSet } from '../../utils/redis'
import { couldStartTrivia } from 'typescript'
import moment from 'moment'

export default new (class service extends serviceBase {
  emptyCart() {
    return {
      products: [],
      productsPrice: 0,
      shipmentCost: 0,
      finalPrice: 0,
      afterDiscountPrice: 0,
      discount: 0
    }
  }

  async getUserCart(cartId: String) {
    const cartInRedis = await RedisGet(cartId)
    if (!cartInRedis) {
      return this.emptyCart()
    }
    const cart: any = JSON.parse(cartInRedis)
    return cart
  }

  async calculateCartAmount(products, cart) {
    let afterDiscountPrice = 0
    let finalPrice = 0
    // for all the products from database that are in cart
    for (let i = 0; i < products.length; i++) {
      // product from cart
      const cartProduct = cart.products.find(p => p.product === products[i]._id.toString())
      // for all sizes in product [SMALL, MEDIUM, LARGE]
      for (let j = 0; j < products[i].productDetails.length; j++) {
        const productDetail = products[i].productDetails[j]
        const productSize = productDetail.size.toLowerCase()
        if (
          productDetail.stock < cartProduct.quantity[`quantity_${productSize}`] ||
          cartProduct.quantity[`quantity_${productSize}`] < 0
        ) {
          throw new ApolloError(
            'quantity should be less than stock and greater than or equals to zero',
            '404'
          )
        }
        const isExpire = this.expireProduct(products[i])
        const price = productDetail.price * cartProduct.quantity[`quantity_${productSize}`]
        if (!isExpire) {
          // we have discount on product
          afterDiscountPrice +=
            productDetail.afterDiscountPrice * cartProduct.quantity[`quantity_${productSize}`]
          finalPrice += price
        } else {
          afterDiscountPrice += price
          finalPrice += price
        }
      }
    }
    return {
      afterDiscountPrice,
      finalPrice
    }
  }

  async updateCart(
    shop: string,
    product: {
      id: string
      detailId: string
      // eslint-disable-next-line camelcase
      quantity: { quantity_small: number; quantity_medium: number; quantity_large: number }
    },
    category: string,
    userLocation: any,
    userId: Types.ObjectId | string,
    onlyCalculate: boolean,
    reset = false
  ): Promise<any> {
    // eslint-disable-next-line no-param-reassign
    const storedCart = JSON.parse(await RedisGet(`cart_${category}_user-${userId}`))
    let cart: any = { products: [] }
    if (reset) {
      cart.products = []
    } else if (!storedCart || !cart.products) {
      cart.products = [
        {
          product: product.id,
          detailId: product.detailId,
          quantity: {
            quantity_small: product.quantity.quantity_small,
            quantity_medium: product.quantity.quantity_medium,
            quantity_large: product.quantity.quantity_large
          }
        }
      ]
    } else {
      cart = storedCart
      const index = cart.products.findIndex(i => i.product == product.id)
      if (index === -1) {
        // this is a new product, so add the product in cart
        cart.products.push({
          product: product.id,
          detailId: product.detailId,
          quantity: {
            quantity_small: product.quantity.quantity_small,
            quantity_medium: product.quantity.quantity_medium,
            quantity_large: product.quantity.quantity_large
          }
        })
      } else {
        // this product is in cart, so update the product in cart
        if (
          product.quantity.quantity_small == 0 &&
          product.quantity.quantity_medium == 0 &&
          product.quantity.quantity_large == 0
        ) {
          // if all quantities are zero then remove the product from cart
          cart.products.splice(index, 1)
        } else {
          cart.products[index].quantity.quantity_small = product.quantity.quantity_small
          cart.products[index].quantity.quantity_medium = product.quantity.quantity_medium
          cart.products[index].quantity.quantity_large = product.quantity.quantity_large
        }
      }
      // cart.products = cart.products.filter(
      //   i =>
      //     i.quantity.quantity_small > 0 &&
      //     i.quantity.quantity_medium > 0 &&
      //     i.quantity.quantity_large > 0
      // )
    }
    const hasProduct = !!cart.products.length
    const products = hasProduct
      ? await productService.find({
          _id: { $in: cart.products.map(i => i.product) }
        })
      : []
    // if (hasProduct) {
    //   if (!products.length || products.length !== cart.products.length) {
    //     throw new ApolloError('some products were not found')
    //   }
    // }
    const obj = await this.calculateCartAmount(products, cart)

    //  // calculate discounts according to date
    // cart.productsPrice = hasProduct
    //   ? products
    //       .map(i => i.price * cart.products.find(p => p.product === i._id.toString()).quantity)
    //       .reduce((total, price) => total + price)
    //   : 0

    // cart.discount = hasProduct
    //   ? products
    //       .map(
    //         i =>
    //           (i.price - i.afterDiscountPrice) *
    //           cart.products.find(p => p.product === i._id.toString()).quantity
    //       )
    //       .reduce((total, discount) => total + discount)
    //   : 0

    cart.afterDiscountPrice = obj.afterDiscountPrice
    cart.finalPrice = obj.finalPrice

    cart.shop = shop

    const cartShop = await shopService.findById(shop)

    cart.rootCategory = (
      await categoryService.findOne({ title: { $elemMatch: { value: category } }, parent: null })
    )._id.toString()

    cart.shipmentCost = hasProduct ? calculateShipmentCost(userLocation, cartShop.location) : 0 // calculate shipment cost

    await RedisSet(`cart_${category}_user-${userId}`, cart)

    if (!hasProduct) {
      delete cart.products
    }
    cart.products = cart.products || []

    if (!onlyCalculate) {
      return super.create(cart)
    }
    return cart
  }

  expireProduct(product: any) {
    let isExpire = true
    if (
      product &&
      product.promotion &&
      product.promotion.discountTo &&
      product.promotion.discountFrom
    ) {
      const now = moment(new Date())
        .utc()
        .unix()
      const discountTo = moment(product.promotion.discountTo).unix()
      const discountFrom = moment(product.promotion.discountFrom).unix()

      if (Number(discountFrom) <= now && Number(discountTo) >= now) {
        isExpire = false
      } else {
        isExpire = true
      }
      // product.afterDiscountPrice = product.price
    }
    return isExpire
  }

  async createCartFromRedis(cartId) {
    const cart: any = await this.getUserCart(cartId)
    if (!cart) {
      return null
    }
    return super.create(cart)
  }

  async cartVerification(category: String, userId: Types.ObjectId): Promise<any> {
    const cart: any = JSON.parse(await RedisGet(`cart_${category}_user-${userId}`))

    if (cart) {
      const orderCalculatedDetaile = await calculateOrder(cart.totalPrice)
      const order = {
        // fill by oreder's fields
        user: userId,
        commission: orderCalculatedDetaile.commissionPrice,
        commissionPercent: orderCalculatedDetaile.commissionPercent,
        HST: orderCalculatedDetaile.hstPrice,
        HSTPercent: orderCalculatedDetaile.hstPercent,
        finalPrice: orderCalculatedDetaile.hstPercent
      }
      await RedisSetObject(`order_${category}_user-${userId}`, order)

      return order
    }
    throw new ApolloError('cart not found', '404')
  }

  async cartRejection(category: String, userId: Types.ObjectId): Promise<any> {
    return RedisDelete(`cart_${category}_user-${userId}`)
  }
})(Model)
