/* eslint-disable no-await-in-loop */
/* eslint-disable array-callback-return */
// database request
import { Types } from 'mongoose'
import _ from 'lodash'
import moment from 'moment'
import { ApolloError } from 'apollo-server-express'
import Model, { productsViews } from './schema'
import shopService from '../shop/service'
import shopMenuService from '../shopMenu/service'
import { RedisGetKeys } from '../../utils/redis'
import serviceBase from '../../utils/serviceBase'
import reqCarTypeService from '../reqCarType/service'
import { Pagination } from '../../utils/interfaces'
import cartService from '../cart/service'

export default new (class service extends serviceBase {
  async find(
    filters: Object = {},
    pagination: Pagination = {
      skip: 0,
      limit: 15
    },
    sort: Object = { createdAt: -1 }
  ): Promise<Array<any>> {
    const productSet = await this.model
      .find({ ...filters, isDeleted: false })
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
    return Promise.all(
      productSet.map(async product => {
        const { subMenuId, shopMenuName } = await this.findSubMenuNameAndIdOfProduct(product)
        return { ...product._doc, subMenuId, shopMenuName }
      })
    )
  }

  async findSubMenuNameAndIdOfProduct(product) {
    const shop: any = await shopService.findOne({ _id: product.shop })
    if (!shop || !shop.shopMenu) return { subMenuId: null, shopMenuName: null }
    const shopMenu: any = await shopMenuService.findById(shop.shopMenu)
    if (!shopMenu) return { subMenuId: null, shopMenuName: null }

    for (let index = 0; index < shopMenu.subMenus.length; index++) {
      const subMenu = shopMenu.subMenus[index]
      const intendedShopMenu = subMenu.products.find(item => String(item) === String(product._id))
      if (intendedShopMenu) return { subMenuId: subMenu._id, shopMenuName: subMenu.name }
    }
    return { subMenuId: null, shopMenuName: null }
  }

  async findOne(filters: String | Types.ObjectId | Object): Promise<any> {
    if (typeof filters === 'string' || filters instanceof Types.ObjectId) {
      // eslint-disable-next-line no-param-reassign
      filters = {
        _id: filters
      }
    }
    const product = await this.model.findOne({ ...filters, isDeleted: false })
    const { subMenuId, shopMenuName } = await this.findSubMenuNameAndIdOfProduct(product)
    return { ...product._doc, subMenuId, shopMenuName }
  }

  async findById(_id) {
    return this.findOne({ _id })
  }

  async count(filters: Object = {}): Promise<number> {
    return this.model.countDocuments({ ...filters, isDeleted: false })
  }

  async createProductByAdmin(user: any, data: any): Promise<any> {
    const { promotion, productDetails, title } = data
    const shop: any = await shopService.findById(data.shop)

    if (!shop) throw new ApolloError('shop not found', '404')
    for (let index = 0; index < title.length; index++) {
      const objectOfTitle = title[index]
      const productRegex = new RegExp(`^${objectOfTitle.value}$`, 'i')
      const existenceProductSet = await this.find({
        title: { $elemMatch: { value: { $regex: productRegex }, lang: objectOfTitle.lang } },
        shop: user.shop
      })
      console.log(existenceProductSet)
      if (existenceProductSet.length)
        throw new ApolloError('This product title is used by at least one product(s).', '400')
    }
    if (data.reqCarTypes) {
      data.reqCarTypes = (
        await reqCarTypeService.find(
          {
            tripType: 'DELIVERY',
            _id: { $in: data.reqCarTypes }
          },
          undefined,
          {
            increasePricePercent: 1
          }
        )
      ).map(i => i._id.toString())

      if (!data.reqCarTypes.length) {
        throw new ApolloError('some of req car types are invalid', '400')
      }
    }

    if (data.subMenu) {
      const shopMenu: any = await shopMenuService.findOne({ 'subMenus._id': data.subMenu })
      if (!shopMenu) {
        throw new ApolloError('shop menu does not exists', '400')
      }
      if (String(shop.shopMenu) !== String(shopMenu._id)) {
        throw new ApolloError('shop menu does not related to shop', '400')
      }
    }
    for (let i = 0; i < productDetails.length; i++) {
      if (Number(productDetails[i].price) < 0) {
        throw new ApolloError('invalid price', '400')
      }
    }
    if (!title && !title.length) {
      throw new ApolloError('title can not be empty', '400')
    }

    if (promotion) {
      const { percent, discountTo, discountFrom } = promotion
      if (Number(percent) < 0 || Number(percent) > 100) {
        throw new ApolloError('invalid promotion', '400')
      }
      for (let i = 0; i < productDetails.length; i++) {
        const percentagedPrice = Number((Number(productDetails[i].price) * Number(percent)) / 100)
        productDetails[i].afterDiscountPrice = Number(
          Number(productDetails[i].price) - Number(percentagedPrice)
        ).toFixed(2)
      }
      if (percent !== 0) {
        if (!discountTo || !discountFrom) {
          throw new ApolloError('discountTo and discountFrom are required', '400')
        }
        const date = moment(discountTo)
        if (date.isBefore()) {
          throw new ApolloError(
            'please enter a valid date from today or later for start and expiry date',
            '400'
          )
        }
        const product = await this.create({
          ...data,
          $push: {
            productDetails: productDetails
          }
        })
        if (data.subMenu) {
          await shopMenuService.findOneAndUpdate(
            { 'subMenus._id': data.subMenu },
            { $push: { 'subMenus.$.products': product._id } }
          )
        }
        return this.addShopAttributes(product, data.attributes, shop)
      }
      const product = await this.create({
        ...data,
        promotion: null,
        $push: {
          productDetails: productDetails
        }
      })
      if (data.subMenu) {
        await shopMenuService.findOneAndUpdate(
          { 'subMenus._id': data.subMenu },
          { $push: { 'subMenus.$.products': product._id } }
        )
      }

      return this.addShopAttributes(product, data.attributes, shop)
    }
    const product = await this.create({
      ...data,
      $push: {
        productDetails: productDetails
      }
    })
    if (data.subMenu) {
      await shopMenuService.findOneAndUpdate(
        { 'subMenus._id': data.subMenu },
        { $push: { 'subMenus.$.products': product._id } }
      )
    }
    return this.addShopAttributes(product, data.attributes, shop)
  }

  async updateProductByAdmin(user: any, _id: String | Types.ObjectId, data: any): Promise<any> {
    const { promotion, productDetails, title } = data
    const productsInSubMenus: any[] = []
    let product: any
    const productExists = await this.findOne({ _id })
    if (!productExists) {
      throw new ApolloError('product not found', '404')
    }
    const shop: any = await shopService.findById(data.shop)
    if (!shop) {
      throw new ApolloError('shop not found', '404')
    }

    if (data.reqCarTypes) {
      data.reqCarTypes = (
        await reqCarTypeService.find(
          {
            tripType: 'DELIVERY',
            _id: { $in: data.reqCarTypes }
          },
          undefined,
          {
            increasePricePercent: 1
          }
        )
      ).map(i => i._id.toString())

      if (!data.reqCarTypes.length) {
        throw new ApolloError('some of req car types are invalid', '400')
      }
    }

    if (data.reqCarTypes) {
      data.reqCarTypes = (
        await reqCarTypeService.find(
          {
            tripType: 'DELIVERY',
            _id: { $in: data.reqCarTypes }
          },
          undefined,
          {
            increasePricePercent: 1
          }
        )
      ).map(i => i._id.toString())

      if (!data.reqCarTypes.length) {
        throw new ApolloError('some of req car types are invalid', '400')
      }
    }

    if (data.subMenu) {
      const shopMenu: any = await shopMenuService.findOne({ 'subMenus._id': data.subMenu })
      if (!shopMenu) {
        throw new ApolloError('shop menu does not exists', '400')
      }

      if (String(shop.shopMenu) !== String(shopMenu._id)) {
        throw new ApolloError('shop menu does not related to shop', '400')
      }

      shopMenu.subMenus.map(s => {
        _.remove(s.products, o => {
          return String(o) === String(productExists._id)
        })
      })
      shopMenu.subMenus.map(s => {
        if (String(s._id) === String(data.subMenu)) {
          s.products.push(productExists._id)
        }
      })
      await shopMenuService.findOneAndUpdate(
        { 'subMenus._id': data.subMenu },
        { subMenus: shopMenu.subMenus }
      )
    }
    for (let i = 0; i < productDetails.length; i++) {
      if (Number(productDetails[i].price) < 0) {
        throw new ApolloError('invalid price', '400')
      }
    }
    if (!title) {
      throw new ApolloError('title can not be empty', '400')
    }
    if (promotion) {
      const { percent, discountTo, discountFrom } = promotion
      if (Number(percent) < 0 || Number(percent) > 100) {
        throw new ApolloError('invalid promotion', '400')
      }
      for (let i = 0; i < productDetails.length; i++) {
        const percentagedPrice = Number((Number(productDetails[i].price) * Number(percent)) / 100)
        productDetails[i].afterDiscountPrice = Number(
          Number(productDetails[i].price) - Number(percentagedPrice)
        ).toFixed(2)
      }
      if (percent !== 0) {
        if (!discountTo || !discountFrom) {
          throw new ApolloError('discountTo and discountFrom are required', '400')
        }
        const date = moment(discountTo)
        if (date.isBefore()) {
          throw new ApolloError(
            'please enter a valid date from today or later for start and expiry date',
            '400'
          )
        }
        product = await this.findOneAndUpdate(
          { _id },
          {
            ...data,
            $set: {
              productDetails: productDetails
            }
          }
        )
        // if (data.subMenu) {
        //   if (!productsInSubMenus.length) {
        //     await shopMenuService.findOneAndUpdate(
        //       { 'subMenus._id': data.subMenu },
        //       { $push: { 'subMenus.$.products': product._id } }
        //     )
        //   }
        // }

        return this.updateShopAttributes(
          product,
          product.attributes,
          productExists.attributes,
          shop
        )
      }
      product = await this.findOneAndUpdate(
        { _id },
        {
          ...data,
          promotion: null,
          $set: {
            productDetails: productDetails
          }
        }
      )
      // if (data.subMenu) {
      //   if (!productsInSubMenus.length) {
      //     await shopMenuService.findOneAndUpdate(
      //       { 'subMenus._id': data.subMenu },
      //       { $push: { 'subMenus.$.products': product._id } }
      //     )
      //   }
      // }
      return this.updateShopAttributes(product, product.attributes, productExists.attributes, shop)
    }
    product = await this.findOneAndUpdate(
      { _id },
      {
        ...data,
        promotion: null,
        $set: {
          productDetails: productDetails
        }
      }
    )
    // if (data.subMenu) {
    //   if (!productsInSubMenus.length) {
    //     await shopMenuService.findOneAndUpdate(
    //       { 'subMenus._id': data.subMenu },
    //       { $push: { 'subMenus.$.products': product._id } }
    //     )
    //   }
    // }
    return this.updateShopAttributes(product, product.attributes, productExists.attributes, shop)
  }

  async isProductExistInCart(productId) {
    const cartSet: any = await cartService.find({
      products: { $elemMatch: { product: productId } }
    })
    if (cartSet.length !== 0) return true
    const redisKeySet: any = await RedisGetKeys()
    for (let i = 0; i < redisKeySet.length; i++) {
      const redisKey = redisKeySet[i]

      if (redisKey.includes('cart_')) {
        const userCart: any = await cartService.getUserCart(redisKey)
        for (let j = 0; j < userCart.products.length; j++) {
          const product = userCart.products[j]
          if (String(product.product) === String(productId)) return true
        }
      }
    }
    return false
  }

  async removeProductByAdmin(user: any, idSet: Types.ObjectId[]): Promise<any> {
    const productSet: any = []
    for (let index = 0; index < idSet.length; index++) {
      const _id = idSet[index]
      const product = await this.findOne({ _id })
      if (!product) {
        throw new ApolloError('Product not found.', '404')
      }
      const shop: any = await shopService.findOne({ _id: product.shop })
      if (!shop) {
        throw new ApolloError('Shop not found.', '404')
      }
      if (await this.isProductExistInCart(_id))
        throw new ApolloError('Product is used by at least one cart(s).', '400')
      productSet.push(product)
    }

    return Promise.all(
      productSet.map(async product => {
        const shop: any = await shopService.findOne({ _id: product.shop })
        await this.removeShopAttribute(product, product.attributes, shop)
        return this.findOneAndUpdate(product._id, { isDeleted: true })
      })
    )
  }

  async createProductByShopAdmin(user: any, data: any): Promise<any> {
    const { promotion, productDetails, title } = data
    const shop: any = await shopService.findById(user.shop)
    for (let index = 0; index < title.length; index++) {
      const objectOfTitle = title[index]
      const productRegex = new RegExp(`^${objectOfTitle.value}$`, 'i')
      const existenceProductSet = await this.find({
        title: { $elemMatch: { value: { $regex: productRegex }, lang: objectOfTitle.lang } },
        shop: user.shop
      })
      console.log(existenceProductSet)
      if (existenceProductSet.length)
        throw new ApolloError('This product title is used by at least one product(s).', '400')
    }

    if (!shop) {
      throw new ApolloError('shop not found', '404')
    }
    if (data.reqCarTypes) {
      data.reqCarTypes = (
        await reqCarTypeService.find(
          {
            tripType: 'DELIVERY',
            _id: { $in: data.reqCarTypes }
          },
          undefined,
          {
            increasePricePercent: 1
          }
        )
      ).map(i => i._id.toString())

      if (!data.reqCarTypes.length) {
        throw new ApolloError('some of req car types are invalid', '400')
      }
    }

    if (data.subMenu) {
      const shopMenu: any = await shopMenuService.findOne({ 'subMenus._id': data.subMenu })
      if (!shopMenu) {
        throw new ApolloError('shop menu does not exists', '400')
      }
      if (String(shop.shopMenu) !== String(shopMenu._id)) {
        throw new ApolloError('shop menu is not related to shop', '400')
      }
    }

    for (let i = 0; i < productDetails.length; i++) {
      if (Number(productDetails[i].price) < 0) {
        throw new ApolloError('invalid price', '400')
      }
    }

    if (!title || !title.length) {
      throw new ApolloError('title can not be empty', '400')
    }

    if (promotion) {
      const { percent, discountTo, discountFrom } = promotion
      if (Number(percent) < 0 || Number(percent) > 100) {
        throw new ApolloError('invalid promotion', '400')
      }
      for (let i = 0; i < productDetails.length; i++) {
        const percentagedPrice = Number((Number(productDetails[i].price) * Number(percent)) / 100)
        productDetails[i].afterDiscountPrice = Number(
          Number(productDetails[i].price) - Number(percentagedPrice)
        ).toFixed(2)
      }
      if (percent !== 0) {
        if (!discountTo || !discountFrom) {
          throw new ApolloError('discountTo and discountFrom are required', '400')
        }
        const date = moment(discountTo)
        if (date.isBefore()) {
          throw new ApolloError(
            'please enter a valid date from today or later for start and expiry date',
            '400'
          )
        }
        const product = await this.create({
          ...data,
          shop: user.shop,
          $push: {
            productDetails: productDetails
          }
        })
        if (data.subMenu) {
          await shopMenuService.findOneAndUpdate(
            { 'subMenus._id': data.subMenu },
            { $push: { 'subMenus.$.products': product._id } }
          )
        }

        return this.addShopAttributes(product, data.attributes, shop)
      }
      const product = await this.create({
        ...data,
        promotion: null,
        shop: user.shop,
        $push: {
          productDetails: productDetails
        }
      })
      if (data.subMenu) {
        await shopMenuService.findOneAndUpdate(
          { 'subMenus._id': data.subMenu },
          { $push: { 'subMenus.$.products': product._id } }
        )
      }
      return this.addShopAttributes(product, data.attributes, shop)
    }
    const product = await this.create({
      ...data,
      shop: user.shop,
      $push: {
        productDetails: productDetails
      }
    })
    if (data.subMenu) {
      await shopMenuService.findOneAndUpdate(
        { 'subMenus._id': data.subMenu },
        { $push: { 'subMenus.$.products': product._id } }
      )
    }
    return this.addShopAttributes(product, data.attributes, shop)
  }

  async updateProductByShopAdmin(user: any, _id: String | Types.ObjectId, data: any): Promise<any> {
    const { promotion, productDetails, title } = data
    const productsInSubMenus: any[] = []
    const shop: any = await shopService.findById(user.shop)
    let product: any
    if (!shop) {
      throw new ApolloError('shop not found', '404')
    }

    if (data.reqCarTypes) {
      data.reqCarTypes = (
        await reqCarTypeService.find(
          {
            tripType: 'DELIVERY',
            _id: { $in: data.reqCarTypes }
          },
          undefined,
          {
            increasePricePercent: 1
          }
        )
      ).map(i => i._id.toString())

      if (!data.reqCarTypes.length) {
        throw new ApolloError('some of req car types are invalid', '400')
      }
    }

    const productExists = await this.findOne({ _id })
    if (!productExists) {
      throw new ApolloError('product not found', '404')
    }

    if (String(productExists.shop) !== String(shop._id)) {
      throw new ApolloError('this product is not related to your shop', '400')
    }
    if (data.subMenu) {
      const shopMenu: any = await shopMenuService.findOne({ 'subMenus._id': data.subMenu })

      if (!shopMenu) {
        throw new ApolloError('shop menu does not exists', '400')
      }

      if (String(shop.shopMenu) !== String(shopMenu._id)) {
        throw new ApolloError('shop menu does not related to shop', '400')
      }
      shopMenu.subMenus.map(s => {
        _.remove(s.products, o => {
          return String(o) === String(productExists._id)
        })
      })
      shopMenu.subMenus.map(s => {
        if (String(s._id) === String(data.subMenu)) {
          s.products.push(productExists._id)
        }
      })
      await shopMenuService.findOneAndUpdate(
        { 'subMenus._id': data.subMenu },
        { subMenus: shopMenu.subMenus }
      )
    }

    for (let i = 0; i < productDetails.length; i++) {
      if (Number(productDetails[i].price) < 0) {
        throw new ApolloError('invalid price', '400')
      }
    }
    if (!title) {
      throw new ApolloError('title can not be empty', '400')
    }
    if (promotion) {
      const { percent, discountTo, discountFrom } = promotion
      if (Number(percent) < 0 || Number(percent) > 100) {
        throw new ApolloError('invalid promotion', '400')
      }
      for (let i = 0; i < productDetails.length; i++) {
        const percentagedPrice = Number((Number(productDetails[i].price) * Number(percent)) / 100)
        productDetails[i].afterDiscountPrice = Number(
          Number(productDetails[i].price) - Number(percentagedPrice)
        ).toFixed(2)
      }
      if (percent !== 0) {
        if (!discountTo || !discountFrom) {
          throw new ApolloError('discountTo and discountFrom are required', '400')
        }
        const date = moment(discountTo)
        if (date.isBefore()) {
          throw new ApolloError(
            'please enter a valid date from today or later for start and expiry date',
            '400'
          )
        }
        product = await this.findOneAndUpdate(
          { _id },
          {
            ...data,
            $set: {
              productDetails
            }
          }
        )
        // if (data.subMenu) {
        //   if (!productsInSubMenus.length) {
        //     await shopMenuService.findOneAndUpdate(
        //       { 'subMenus._id': data.subMenu },
        //       { $push: { 'subMenus.$.products': product._id } }
        //     )
        //   }
        // }

        return this.updateShopAttributes(
          product,
          product.attributes,
          productExists.attributes,
          shop
        )
      }
      product = await this.findOneAndUpdate(
        { _id },
        {
          ...data,
          promotion: null,
          $set: {
            productDetails: productDetails
          }
        }
      )
      // if (data.subMenu) {
      //   if (!productsInSubMenus.length) {
      //     await shopMenuService.findOneAndUpdate(
      //       { 'subMenus._id': data.subMenu },
      //       { $push: { 'subMenus.$.products': product._id } }
      //     )
      //   }
      // }
      return this.updateShopAttributes(product, product.attributes, productExists.attributes, shop)
    }
    product = await this.findOneAndUpdate(
      { _id },
      {
        ...data,
        promotion: null,
        $set: {
          productDetails: productDetails
        }
      }
    )
    // if (data.subMenu) {
    //   if (!productsInSubMenus.length) {
    //     await shopMenuService.findOneAndUpdate(
    //       { 'subMenus._id': data.subMenu },
    //       { $push: { 'subMenus.$.products': product._id } }
    //     )
    //   }
    // }
    return this.updateShopAttributes(product, product.attributes, productExists.attributes, shop)
  }

  async removeProductByShopAdmin(user: any, idSet: Types.ObjectId[]): Promise<any> {
    const productSet: any = []
    for (let index = 0; index < idSet.length; index++) {
      const _id = idSet[index]
      const product = await this.findOne({ _id })
      if (!product) {
        throw new ApolloError('Product not found.', '404')
      }
      const shop: any = await shopService.findOne({ _id: product.shop })
      if (!shop) {
        throw new ApolloError('Shop not found.', '404')
      }
      if (String(product.shop) !== String(shop._id)) {
        throw new ApolloError('This product is not related in your shop.', '400')
      }
      if (await this.isProductExistInCart(_id))
        throw new ApolloError('Product is used by at least one cart(s).', '400')
      productSet.push(product)
    }

    return Promise.all(
      productSet.map(async product => {
        const shop: any = await shopService.findOne({ _id: product.shop })
        await this.removeShopAttribute(product, product.attributes, shop)
        return this.findOneAndUpdate(product._id, { isDeleted: true })
      })
    )
  }

  private async addShopAttributes(product: any, attributes: any[], shop: any): Promise<any> {
    const atts: String[] = []
    let shopAttributesCount: any[] = []
    const newShopAttributes: String[] = []
    if (attributes && attributes.length) {
      attributes.map(i => {
        i.att.map(att => {
          if (atts.indexOf(att) === -1) {
            atts.push(att)
          }
        })
      })
      if (atts.length) {
        shopAttributesCount = shop.attributesCount
        atts.map(element => {
          const attributeIndex = _.findIndex(
            shopAttributesCount,
            o => o.attribute.toString() === element.toString()
          )
          if (attributeIndex === -1) {
            shopAttributesCount.push({ attribute: element, count: 1 })
            newShopAttributes.push(element)
          } else {
            shopAttributesCount[attributeIndex] = {
              attribute: shopAttributesCount[attributeIndex].attribute,
              count: shopAttributesCount[attributeIndex].count += 1
            }
          }
        })
        await shopService.findOneAndUpdate(
          { _id: shop._id },
          {
            $push: { attributes: { $each: newShopAttributes } },
            $set: {
              attributesCount: shopAttributesCount
            }
          }
        )
      }
    }

    return product
  }

  private async updateShopAttributes(
    product: any,
    newAttributes: any[],
    productPreviousAttribute: any = [],
    shop: any
  ): Promise<any> {
    const updatedAttribute: String[] = []
    const newAttributesArray: String[] = []
    const previousDifferenceAttributes: String[] = []
    const previousAttribute: String[] = []
    let shopAttributesCount: any[] = []
    let shopAttributes: String[] = []
    shopAttributes = shop.attributes
    shopAttributesCount = shop.attributesCount

    productPreviousAttribute.map(i => {
      i.att.map(att => {
        if (previousAttribute.indexOf(att.toString()) === -1) {
          previousAttribute.push(att.toString())
        }
      })
    })
    newAttributes.map(i => {
      i.att.map(att => {
        if (newAttributesArray.indexOf(att.toString()) === -1) {
          newAttributesArray.push(att.toString())
        }
        if (
          previousAttribute.indexOf(att.toString()) === -1 &&
          updatedAttribute.indexOf(att.toString()) === -1
        ) {
          updatedAttribute.push(att.toString())
        }
      })
    })
    if (newAttributes) {
      if (updatedAttribute.length) {
        updatedAttribute.map(element => {
          const attributeIndex = _.findIndex(
            shopAttributesCount,
            o => o.attribute.toString() === element.toString()
          )
          if (attributeIndex === -1) {
            shopAttributesCount.push({ attribute: element, count: 1 })
            shopAttributes.push(element)
          } else {
            shopAttributesCount[attributeIndex] = {
              attribute: shopAttributesCount[attributeIndex].attribute,
              count: shopAttributesCount[attributeIndex].count += 1
            }
          }
        })
      }
      previousAttribute.map(i => {
        if (
          previousDifferenceAttributes.indexOf(i.toString()) === -1 &&
          newAttributesArray.indexOf(i.toString()) === -1
        ) {
          previousDifferenceAttributes.push(i.toString())
        }
      })
      if (previousDifferenceAttributes.length) {
        previousDifferenceAttributes.map(element => {
          const attributeIndex = _.findIndex(
            shopAttributesCount,
            o => o.attribute.toString() === element.toString()
          )
          if (attributeIndex !== -1) {
            if (
              shopAttributesCount[attributeIndex].count === 1 ||
              shopAttributesCount[attributeIndex].count === 0
            ) {
              shopAttributesCount = shopAttributesCount.filter(
                i => i.attribute.toString() !== element.toString()
              )
              shopAttributes = shopAttributes.filter(i => i.toString() !== element.toString())
            } else {
              shopAttributesCount[attributeIndex] = {
                attribute: shopAttributesCount[attributeIndex].attribute,
                count: shopAttributesCount[attributeIndex].count -= 1
              }
            }
          }
        })
      }
      await shopService.findOneAndUpdate(
        { _id: shop._id },
        {
          $set: {
            attributesCount: shopAttributesCount,
            attributes: shopAttributes
          }
        }
      )
    }
    return product
  }

  private async removeShopAttribute(product: any, attributes: any[], shop: any): Promise<any> {
    const atts: String[] = []
    let shopAttributesCount: any[] = []
    let shopAttributes: String[] = []
    if (shop) {
      if (attributes && attributes.length) {
        shopAttributes = shop.attributes
        attributes.map(i => {
          i.att.map(att => {
            if (atts.indexOf(att.toString()) === -1) {
              atts.push(att.toString())
            }
          })
        })
        if (atts.length) {
          shopAttributesCount = shop.attributesCount
          atts.map(element => {
            const attributeIndex = _.findIndex(
              shopAttributesCount,
              o => o.attribute.toString() === element.toString()
            )
            if (attributeIndex !== -1) {
              if (
                shopAttributesCount[attributeIndex].count === 1 ||
                shopAttributesCount[attributeIndex].count === 0
              ) {
                shopAttributesCount = shopAttributesCount.filter(
                  i => i.attribute.toString() !== element.toString()
                )
                shopAttributes = shopAttributes.filter(i => i.toString() !== element.toString())
              } else {
                shopAttributesCount[attributeIndex] = {
                  attribute: shopAttributesCount[attributeIndex].attribute,
                  count: shopAttributesCount[attributeIndex].count -= 1
                }
              }
            }
          })
          await shopService.findOneAndUpdate(
            { _id: shop._id },
            {
              $set: {
                attributesCount: shopAttributesCount,
                attributes: shopAttributes
              }
            }
          )
        }
      }
    }
    return product
  }

  async fixProduct(product: any, detailId?: any) {
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
        return product
      }
      product.afterDiscountPrice = product.price
      if (detailId) {
        product.productDetails = product.productDetails.filter(p => p._id == detailId)
      }
      return product
    }
    return product
  }
})(Model, productsViews)
