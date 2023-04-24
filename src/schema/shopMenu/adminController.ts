/* eslint-disable no-await-in-loop */
import _ from 'lodash'
import { Types } from 'mongoose'
import { ApolloError } from 'apollo-server-express'
import service from './service'
import { RedisGetKeys } from '../../utils/redis'
import controllerBase from '../../utils/controllerBase'
import shopService from '../shop/service'
import cartService from '../cart/service'
import shopMenuSchema from '../shopMenu/schema'
import { Pagination } from '../../utils/interfaces'

export default new (class Controller extends controllerBase {
  async createShopMenuByShopAdmin(user: any, data: any) {
    const shop = await shopService.findById(user.shop)
    if (!shop) {
      throw new ApolloError('shop does not exists', '400')
    }

    if (shop.shopMenu) {
      throw new ApolloError('your shop already has shop menu', '400')
    }
    const menus = data.subMenus.map(m => m.name)
    const hasDuplicates = _.uniqBy(menus.flat(), o => o.value).length !== menus.flat().length
    if (hasDuplicates) {
      throw new ApolloError('name of categories must be unique', '400')
    }

    const shopMenu = await service.create(data)

    await shopService.findOneAndUpdate(
      { _id: user.shop, shopAdmin: user.userId },
      { shopMenu: shopMenu._id }
    )
    return shopMenu
  }

  async createSubMenuByAdmin(shopId: Types.ObjectId | string, data: any) {
    const shop: any = await shopService.findById(shopId)
    if (!shop) {
      throw new ApolloError('shop does not exist', '400')
    }
    if (!shop.shopMenu) {
      const shopMenu = await service.create(data)
      await shopService.findOneAndUpdate({ _id: shopId }, { shopMenu: shopMenu._id })
      return shopMenu
    }

    for (let i = 0; i < data.subMenus.length; i++) {
      const menus = data.subMenus[i].name
      const hasDuplicates = _.uniqBy(menus.flat(), o => o.value).length !== menus.flat().length
      if (hasDuplicates) {
        throw new ApolloError('name of categories must be unique', '400')
      }
      for (let index = 0; index < menus.length; index++) {
        const objectOfTitle = menus[index]
        const subMenuRegex = new RegExp(`^${objectOfTitle.value}$`, 'i')
        const existenceSubMenuSet = await shopMenuSchema.find({
          _id: shop.shopMenu,
          subMenus: {
            $elemMatch: {
              name: { $elemMatch: { value: { $regex: subMenuRegex }, lang: objectOfTitle.lang } }
            }
          }
        })
        if (existenceSubMenuSet.length)
          throw new ApolloError('This subMenu title is used by at least one subMenu(s).', '400')
      }
    }

    const result = await service.findOneAndUpdate(
      { _id: shop.shopMenu },
      { $push: { subMenus: data.subMenus } }
    )
    if (!result) {
      throw new ApolloError('shop menu does not exists', '404')
    }
    return result
  }

  async createSubMenuByShopAdmin(user: any, data: any) {
    const shop = await shopService.findById(user.shop)
    if (!shop) {
      throw new ApolloError('shop does not exists', '400')
    }

    if (!shop.shopMenu) {
      throw new ApolloError('your shop has no shop menu', '400')
    }

    const menus = data.name
    const hasDuplicates = _.uniqBy(menus.flat(), o => o.value).length !== menus.flat().length
    if (hasDuplicates) {
      throw new ApolloError('name of categories must be unique', '400')
    }

    for (let index = 0; index < menus.length; index++) {
      const objectOfTitle = menus[index]
      const subMenuRegex = new RegExp(`^${objectOfTitle.value}$`, 'i')
      const existenceSubMenuSet = await shopMenuSchema.find({
        _id: shop.shopMenu,
        subMenus: {
          $elemMatch: {
            name: { $elemMatch: { value: { $regex: subMenuRegex }, lang: objectOfTitle.lang } }
          }
        }
      })
      if (existenceSubMenuSet.length)
        throw new ApolloError('This subMenu title is used by at least one subMenu(s).', '400')
    }

    const result = await service.findOneAndUpdate(
      { _id: shop.shopMenu },
      { $push: { subMenus: data } }
    )
    return result
  }

  async createShopMenuByAdmin(data) {
    const shop = await shopService.findById(data.shopId)
    if (!shop) {
      throw new ApolloError('shop does not exist', '400')
    }

    if (shop.shopMenu) {
      throw new ApolloError('shop already has a shop menu', '400')
    }
    const menus = data.subMenus.map(m => m.name)
    const hasDuplicates = _.uniqBy(menus.flat(), o => o.value).length !== menus.flat().length

    if (hasDuplicates) {
      throw new ApolloError('name of categories must be unique', '400')
    }
    const shopMenu = await service.create({ subMenus: data.subMenus })

    await shopService.findOneAndUpdate(data.shopId, { shopMenu: shopMenu._id })
    return shopMenu
  }

  async updateShopMenuByAdmin(user: any, _id: Types.ObjectId | string, data: any): Promise<any> {
    const menus = data.subMenus.map(m => m.name)
    const hasDuplicates = _.uniqBy(menus.flat(), o => o.value).length !== menus.flat().length
    if (hasDuplicates) {
      throw new ApolloError('name of categories must be unique', '400')
    }
    const oldShopMenu = await service.findById(_id)
    if (!oldShopMenu) {
      throw new ApolloError('shop Menu does not exists', '400')
    }
    // const differencesShopMenu = await this.getDifferenceOfOldShopMenuAndNewShopMenu(
    //   oldShopMenu.subMenus,
    //   data.subMenus
    // )
    // await this.isProductOfMenuAvailableInCart(differencesShopMenu)
    return service.findOneAndUpdate({ _id }, data)
  }

  async updateSubMenuByAdmin(
    shopId: Types.ObjectId | String,
    subMenuId: Types.ObjectId | String,
    data: any
  ) {
    const shop = await shopService.findById(shopId)
    if (!shop) {
      throw new ApolloError('shop does not exists', '400')
    }
    if (!shop.shopMenu) {
      throw new ApolloError('your shop has no shop menu', '400')
    }
    const shopMenu = await service.findOne({
      _id: shop.shopMenu,
      'subMenus._id': subMenuId
    })
    if (!shopMenu) {
      throw new ApolloError('subMenus not found', '400')
    }
    const menus = data.subMenus.map(m => m.name)
    const hasDuplicates = _.uniqBy(menus.flat(), o => o.value).length !== menus.flat().length
    if (hasDuplicates) {
      throw new ApolloError('name of categories must be unique', '400')
    }
    const result = await shopMenuSchema.findOneAndUpdate(
      {
        _id: shop.shopMenu,
        'subMenus._id': subMenuId
      },
      { $set: { 'subMenus.$': data.subMenus } }
    )
    return result
  }

  async getDifferenceOfOldShopMenuAndNewShopMenu(oldSubMenuSet: any[], newSubMenuSet: any[]) {
    return _.differenceWith(oldSubMenuSet, newSubMenuSet, (oldSubMenu, newSubMenu) => {
      return _.isEqual(
        newSubMenu.products.map(String).sort(),
        oldSubMenu.products.map(String).sort()
      )
    })
  }

  async isProductOfMenuAvailableInCart(differencesSubMenu) {
    const subMenuSetProductSet: any[] = differencesSubMenu
      .map(subMenu => subMenu.products.map(String))
      .flat()
    const redisKeySet: any = await RedisGetKeys()
    for (let i = 0; i < redisKeySet.length; i++) {
      const redisKey = redisKeySet[i]
      if (redisKey.includes('cart_')) {
        const { products }: any = await cartService.getUserCart(redisKey)
        for (let index = 0; index < products.length; index++) {
          const product = products[index]
          if (subMenuSetProductSet.includes(String(product.product)))
            throw new ApolloError(
              'You can not delete product which is used at least by one active cart.',
              '400'
            )
        }
      }
    }
  }

  async removeShopMenuProductByAdmin(data: any) {
    const shop = await shopService.findOne({ shopAdmin: data.shopId })
    if (!shop) {
      throw new ApolloError('shop does not exists', '400')
    }

    if (!shop.shopMenu) {
      throw new ApolloError('your shop has no shop menu', '400')
    }
    const shopMenu = await service.findOne({
      _id: shop.shopMenu,
      'subMenus._id': data.menuId,
      'subMenus.products': Types.ObjectId(data.productId)
    })
    if (!shopMenu) {
      throw new ApolloError('subMenus or details does not exists', '400')
    }
    const result = await shopMenuSchema.findOneAndUpdate(
      {
        _id: shop.shopMenu,
        'subMenus._id': data.menuId
      },
      { $pull: { 'subMenus.$.products': Types.ObjectId(data.productId) } }
    )
    return result
  }

  async removeShopMenuProductByShopAdmin(user: any, data: any) {
    const shop = await shopService.findOne({ shopAdmin: user.userId })
    if (!shop) {
      throw new ApolloError('shop does not exists', '400')
    }

    if (!shop.shopMenu) {
      throw new ApolloError('your shop has no shop menu', '400')
    }
    const shopMenu = await service.findOne({
      _id: shop.shopMenu,
      'subMenus._id': data.menuId,
      'subMenus.products': Types.ObjectId(data.productId)
    })
    if (!shopMenu) {
      throw new ApolloError('subMenus or details does not exists', '400')
    }
    const result = await shopMenuSchema.findOneAndUpdate(
      {
        _id: shop.shopMenu,
        'subMenus._id': data.menuId
      },
      { $pull: { 'subMenus.$.products': Types.ObjectId(data.productId) } }
    )
    return result
  }

  async removeShopMenuItemsByAdmin(data: any) {
    const shop = await shopService.findOne({ shopAdmin: data.shopId })
    if (!shop) {
      throw new ApolloError('shop does not exists', '400')
    }

    if (!shop.shopMenu) {
      throw new ApolloError('your shop has no shop menu', '400')
    }
    const shopMenu = await service.findOne({ _id: shop.shopMenu, 'subMenus._id': data.menuId })
    if (!shopMenu) {
      throw new ApolloError('shop Menu or subMenus does not exists', '400')
    }
    const result = await service.findOneAndUpdate(
      { _id: shop.shopMenu },
      { $pull: { subMenus: { _id: data.menuId } } }
    )
    return result
  }

  async removeShopMenuItemsByShopAdmin(user: any, menuId: Types.ObjectId) {
    const shop = await shopService.findOne({ shopAdmin: user.userId })
    if (!shop) {
      throw new ApolloError('shop does not exists', '400')
    }

    if (!shop.shopMenu) {
      throw new ApolloError('your shop has no shop menu', '400')
    }
    const shopMenu = await service.findOne({ _id: shop.shopMenu, 'subMenus._id': menuId })
    if (!shopMenu) {
      throw new ApolloError('shop Menu or subMenus does not exists', '400')
    }
    const result = await service.findOneAndUpdate(
      { _id: shop.shopMenu },
      { $pull: { subMenus: { _id: menuId } } }
    )
    return result
  }

  async updateShopMenuByShopAdmin(user: any, data: any): Promise<any> {
    const isShopAdmin = await shopService.findOne({
      shopAdmin: user.userId
    })

    if (!isShopAdmin) {
      throw new ApolloError('invalid shop admin', '400')
    }
    const menus = data.subMenus.map(m => m.name)
    const hasDuplicates = _.uniqBy(menus.flat(), o => o.value).length !== menus.flat().length
    if (hasDuplicates) {
      throw new ApolloError('name of categories must be unique', '400')
    }
    const oldShopMenu = await service.findById(isShopAdmin.shopMenu)
    if (!oldShopMenu) {
      throw new ApolloError('shop Menu does not exists', '400')
    }
    const differencesShopMenu = await this.getDifferenceOfOldShopMenuAndNewShopMenu(
      oldShopMenu.subMenus,
      data.subMenus
    )
    await this.isProductOfMenuAvailableInCart(differencesShopMenu)
    return service.findOneAndUpdate({ _id: isShopAdmin.shopMenu }, data)
  }

  async updateSubMenuByShopAdmin(user: any, subMenuId: Types.ObjectId | String, data: any) {
    const shop = await shopService.findById(user.shop)
    if (!shop) {
      throw new ApolloError('shop does not exists', '400')
    }
    if (!shop.shopMenu) {
      throw new ApolloError('your shop has no shop menu', '400')
    }
    const shopMenu = await service.findOne({
      _id: shop.shopMenu,
      'subMenus._id': subMenuId
    })
    if (!shopMenu) {
      throw new ApolloError('subMenus not found', '400')
    }
    const menus = data.subMenus.map(m => m.name)
    const hasDuplicates = _.uniqBy(menus.flat(), o => o.value).length !== menus.flat().length
    if (hasDuplicates) {
      throw new ApolloError('name of categories must be unique', '400')
    }
    const result = await shopMenuSchema.findOneAndUpdate(
      {
        _id: shop.shopMenu,
        'subMenus._id': subMenuId
      },
      { $set: { 'subMenus.$': data.subMenus } }
    )
    return result
  }

  async getSubMenuProductsByShopAdmin(user: any, subMenuId: Types.ObjectId | String) {
    const shop: any = await shopService.findById(user.shop)
    if (!shop) {
      throw new ApolloError('shop Not Found', '404')
    }
    if (!shop.shopMenu) {
      throw new ApolloError('your shop has no shop menu', '400')
    }
    const shopMenu: any = await service.findOne({ _id: shop.shopMenu, 'subMenus._id': subMenuId })
    if (!shopMenu) {
      throw new ApolloError('shop Menu or subMenus does not exists', '400')
    }
    const atendedSubMenu: any = shopMenu.subMenus.filter(subMenu => {
      return subMenu._id.toString() === subMenuId.toString()
    })
    return {
      _id: atendedSubMenu[0]._id,
      name: atendedSubMenu[0].name,
      products: atendedSubMenu[0].products
    }
  }

  async getSubMenuProductsByAdmin(
    shopId: Types.ObjectId | String,
    subMenuId: Types.ObjectId | String
  ) {
    const shop: any = await shopService.findById(shopId)
    if (!shop) {
      throw new ApolloError('shop Not Found', '404')
    }
    if (!shop.shopMenu) {
      throw new ApolloError('your shop has no shop menu', '400')
    }
    const shopMenu: any = await service.findOne({ _id: shop.shopMenu, 'subMenus._id': subMenuId })
    if (!shopMenu) {
      throw new ApolloError('shop Menu or subMenus does not exists', '400')
    }
    const atendedSubMenu: any = shopMenu.subMenus.filter(subMenu => {
      return subMenu._id.toString() === subMenuId.toString()
    })
    return {
      _id: atendedSubMenu[0]._id,
      name: atendedSubMenu[0].name,
      products: atendedSubMenu[0].products
    }
  }

  async getShopMenuByShopAdmin(user, pagination: Pagination = { skip: 0, limit: 15 }) {
    const shop: any = await shopService.findById(user.shop)
    if (!shop) {
      throw new ApolloError('shop Not Found', '404')
    }
    const shopMenu: any = await shopMenuSchema.findOne(
      { _id: shop.shopMenu },
      { subMenus: { $slice: [pagination.skip, pagination.limit] } }
    )
    if (!shopMenu) {
      throw new ApolloError('shop Menu Not Found', '404')
    }
    return shopMenu
  }
})(service)
