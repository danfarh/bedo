/* eslint-disable no-await-in-loop */
import moment from 'moment'
import { Types } from 'mongoose'
import _ from 'lodash'
import { ApolloError } from 'apollo-server-express'
import service from './service'
import regionController from '../region/controller'
import adminService from '../admin/service'
import controllerBase from '../../utils/controllerBase'
import { Pagination } from '../../utils/interfaces'
import userService from '../user/service'
import { getConstantValue } from '../../utils/redis'
import calculateTimeAndDistance from '../../utils/calculateTimeAndDistance'
import getLocationByAddress from '../../utils/getLocationByAddress'
import orderService from '../order/service'
import productService from '../product/service'
import driverSchema from '../driver/schema'
import shop from '.'

export default new (class Controller extends controllerBase {
  async index(filters: any, pagination: Pagination, sort: any) {
    return service.index(filters, pagination, sort)
  }

  async getLocationByAddress(address: string) {
    return getLocationByAddress(address)
  }

  async verifyShop(id) {
    return service.findOneAndUpdate(id, { verified: true, isRejected: false })
  }

  async rejectShopByAdmin(id, rejectionMessage) {
    return service.findOneAndUpdate(id, { verified: false, isRejected: true, rejectionMessage })
  }

  async getShopByShopAdmin(user) {
    const shop = await service.findOne({ shopAdmin: user.userId })
    if (!shop) {
      throw new ApolloError('shop Not Found', '404')
    }
    return shop
  }

  async getShopsByAdmin(filters, pagination, sort) {
    return service.getShopsByAdmin(filters, pagination, sort)
  }

  async getShopsByAdminCount(filters) {
    return service.getShopsByAdminCount(filters)
  }

  async getShopByAdmin(_id: Types.ObjectId) {
    return service.findOne({ _id })
  }

  async updateShopByShopAdmin(data, user, state) {
    const { location, preparingTime, phoneNumbers }: any = data
    if (!location) {
      throw new ApolloError('location is required', '400')
    }
    if (!location.coordinates.length || location.coordinates.length !== 2) {
      throw new ApolloError('invalid location', '400')
    }
    if (!preparingTime || preparingTime < 0) {
      throw new ApolloError('invalid preparing time', '400')
    }
    if (!phoneNumbers || !phoneNumbers.length) {
      throw new ApolloError('phone numbers cannot be empty', '400')
    }
    const invalidPhoneNumberIndex = _.findIndex(
      phoneNumbers,
      phoneNumber => phoneNumber.length === 0
    )
    if (invalidPhoneNumberIndex !== -1) {
      throw new ApolloError('invalid phone numbers', '400')
    }
    const oldShop = await service.findOne({ shopAdmin: user.userId })
    const deliveryUser = await userService.findOneAndUpdate(
      { _id: oldShop.deliveryUser },
      { phoneNumber: data.phoneNumbers[0], fullName: data.name }
    )
    data.deliveryUser = deliveryUser._id
    if (state === 'AFTER_REJECTED') {
      const shop = await service.findOneAndUpdate(
        { shopAdmin: user.userId },
        { ...data, isRejected: false }
      )
      if (!shop) {
        throw new ApolloError('shop does not exists', '400')
      }
      return shop
    }
    const shop = await service.findOneAndUpdate({ shopAdmin: user.userId }, data)
    if (!shop) {
      throw new ApolloError('shop does not exists', '400')
    }
    return shop
  }

  async createShopByShopAdmin(user: any, data): Promise<any> {
    try {
      const { location, preparingTime, phoneNumbers }: any = data
      const admin = await adminService.findById(user.userId)
      if (admin.shop) {
        throw new ApolloError('you have already created a shop.', '400')
      }
      if (!location) {
        throw new ApolloError('location is required.', '400')
      }
      console.log('location.coordinates :', location.coordinates)
      await regionController.checkLocationIsInRegions({
        lat: location.coordinates[1],
        long: location.coordinates[0]
      })
      if (!location.coordinates.length || location.coordinates.length !== 2) {
        throw new ApolloError('invalid location.', '400')
      }
      if (!preparingTime || preparingTime < 0) {
        throw new ApolloError('invalid preparing time.', '400')
      }
      if (!phoneNumbers || !phoneNumbers.length) {
        throw new ApolloError('phone numbers cannot be empty.', '400')
      }
      const invalidPhoneNumberIndex = _.findIndex(
        phoneNumbers,
        phoneNumber => phoneNumber.length === 0
      )
      if (invalidPhoneNumberIndex !== -1) {
        throw new ApolloError('invalid phone numbers.', '400')
      }
      const deliveryUser = await userService.save(data.phoneNumbers[0], '', '', data.name, true)
      data.deliveryUser = deliveryUser._id
      const shop = await service.create({ ...data, shopAdmin: admin._id })
      await adminService.findOneAndUpdate(admin._id, {
        shop: shop._id
      })
      console.log('createShopByShopAdmin , shop :', shop)
      return shop
    } catch (e) {
      throw new ApolloError(e, '400')
    }
  }

  async getSalaryByShopAdmin(user: Object, filters: Object, sort: Object, pagination: Object) {
    return service.getSalary(user, filters, sort, pagination)
  }

  async createShopByAdmin(input: any, shopAdminId: Types.ObjectId): Promise<any> {
    try {
      const { location, preparingTime, phoneNumbers }: any = input
      const admin = await adminService.findById(shopAdminId)
      if (!admin) {
        throw new ApolloError('admin does not exists.', '400')
      }
      if (admin.type !== 'SHOP-ADMIN') {
        throw new ApolloError('admin is not a shop admin.', '400')
      }
      if (admin.verificationState !== 'VERIFIED') {
        throw new ApolloError('admin is not verified.', '400')
      }
      if (admin.shop) {
        throw new ApolloError('admin already has a shop.', '400')
      }
      if (!location) {
        throw new ApolloError('location is required.', '400')
      }
      await regionController.checkLocationIsInRegions({
        lat: location.coordinates[1],
        long: location.coordinates[0]
      })
      if (!location.coordinates.length || location.coordinates.length !== 2) {
        throw new ApolloError('invalid location.', '400')
      }
      if (!preparingTime || preparingTime < 0) {
        throw new ApolloError('invalid preparing time.', '400')
      }
      if (!phoneNumbers || !phoneNumbers.length) {
        throw new ApolloError('phone numbers cannot be empty.', '400')
      }
      const invalidPhoneNumberIndex = _.findIndex(
        phoneNumbers,
        phoneNumber => phoneNumber.length === 0
      )
      if (invalidPhoneNumberIndex !== -1) {
        throw new ApolloError('invalid phone numbers.', '400')
      }
      const deliveryUser = await userService.save(input.phoneNumbers[0], '', '', input.name, true)
      input.deliveryUser = deliveryUser._id
      const shop = await service.create({ ...input, shopAdmin: shopAdminId })
      await adminService.findOneAndUpdate(
        { _id: shopAdminId },
        {
          shop: shop._id
        }
      )
      console.log('shop created ', shop)
      return shop
    } catch (e) {
      throw new ApolloError(e, '400')
    }
  }

  async checkIfUserIsInShopZone(input: any) {
    const { userLocation, shop }: any = input
    const Shop: any = await service.findById(shop)
    if (!shop) {
      throw new ApolloError('shop does not exists', '400')
    }
    const now = moment()
    const maxShopSearchZone = await getConstantValue('MAX_SHOP_SEARCH_ZONE', 60)
    const origin: any = {
      long: Shop.location.coordinates[0],
      lat: Shop.location.coordinates[1]
    }
    const orderBasePrepareTime =
      Number(Shop.preparingTime) || (await getConstantValue('ORDER_BASE_PREPARE_TIME', 20))
    try {
      const timeAndDistance = await calculateTimeAndDistance(origin, [userLocation])
      if (timeAndDistance.length === 0)
        throw new ApolloError(
          'There is no routes between your address and your selected shop.',
          '400'
        )
      if (timeAndDistance && timeAndDistance[0] && timeAndDistance[0].duration) {
        const time = now.add(timeAndDistance[0].duration + orderBasePrepareTime, 'minutes')
        if (timeAndDistance[0].distance <= maxShopSearchZone) {
          return {
            is: true,
            time
          }
        }
        return {
          is: false,
          time
        }
      }

      throw new ApolloError(
        `google API doesn't work for origin :${origin}, userLocation: ${userLocation}`,
        '400'
      )
    } catch (e) {
      throw new ApolloError(e, '400')
    }
  }

  async deleteShopByAdmin(idSet: Types.ObjectId[]) {
    for (let index = 0; index < idSet.length; index++) {
      const shopId = idSet[index]
      const shop = await service.findById(shopId)
      if (!shop) throw new ApolloError('Shop does not exist.', '400')
      const orderSetOfShop: any = await orderService.find({ shop: shopId })
      if (orderSetOfShop.length !== 0)
        throw new ApolloError('Shop is used by at least one order(s)', '400')
    }
    for (let index = 0; index < idSet.length; index++) {
      const shopId = idSet[index]
      const shop = await service.findById(shopId)
      const productSetOfShop = await productService.find({ shop: shopId })
      productSetOfShop.forEach(async product => {
        await productService.findOneAndUpdate(product._id, { isDeleted: true })
      })
      const shopAdminSet = await adminService.find(shop.shopAdmin)
      shopAdminSet.forEach(async shopAdmin => {
        await adminService.findOneAndUpdate(shopAdmin._id, { isDeleted: true })
      })
    }
    return idSet.map(id => service.findOneAndUpdate(id, { isDeleted: true }))
  }

  async getShopDeliveryByShopAdmin(user) {
    if (!user.shop) {
      throw new ApolloError('shop Not Found', '404')
    }
    const drivers = await driverSchema.find({ shop: user.shop })
    if (!drivers) {
      throw new ApolloError('drivers Not Found', '404')
    }
    return drivers
  }

  async getSearchShops(filters, pagination) {
    if ('name' in filters) {
      filters.name = new RegExp(filters.name, 'gi')
    }
    return service.find(filters, pagination)
  }

  async getSearchShopsCount(filters) {
    if ('name' in filters) {
      filters.name = new RegExp(filters.name, 'gi')
    }
    return this.service.count(filters)
  }
})(service)
