import _ from 'lodash'
import driverService from '../schema/driver/service'
import userService from '../schema/user/service'
import shopService from '../schema/shop/service'

export default async function driverOrPassengerFilters(filters, reTurnUserField = false) {
  if ('shopName' in filters || 'shopPhoneNumber' in filters) {
    const f: any = {}
    if ('shopPhoneNumber' in filters) {
      f.phoneNumbers = new RegExp(filters.shopPhoneNumber, 'gi')
      filters = _.omit(filters, 'shopPhoneNumber')
    }
    if ('shopName' in filters) {
      f.name = new RegExp(filters.shopName, 'gi')
      filters = _.omit(filters, 'shopName')
    }
    const shops = await shopService.find(f)
    if (shops) {
      filters = _.omit(filters, 'shop')
      const ids = shops.map(p => p._id)
      filters.shop = { $in: [...ids] }
    }
  }

  if ('driverName' in filters || 'driverPhoneNumber' in filters || 'driverEmail' in filters) {
    const f: any = {}
    if ('driverPhoneNumber' in filters) {
      f.phoneNumber = new RegExp(filters.driverPhoneNumber, 'gi')
      filters = _.omit(filters, 'driverPhoneNumber')
    }
    if ('driverName' in filters) {
      f.fullName = new RegExp(filters.driverName, 'gi')
      filters = _.omit(filters, 'driverName')
    }
    if ('driverEmail' in filters) {
      f.email = new RegExp(filters.driverEmail, 'gi')
      filters = _.omit(filters, 'driverEmail')
    }
    const drivers = await driverService.find(f)
    if (drivers) {
      filters = _.omit(filters, 'driver')
      const ids = drivers.map(p => p._id)
      filters.driver = { $in: [...ids] }
    }
  }
  if (reTurnUserField) {
    if ('passengerName' in filters || 'passengerPhoneNumber' in filters) {
      const f: any = {}
      if ('passengerPhoneNumber' in filters) {
        f.phoneNumber = new RegExp(filters.passengerPhoneNumber, 'gi')
        filters = _.omit(filters, 'passengerPhoneNumber')
      }
      if ('passengerName' in filters) {
        f.fullName = new RegExp(filters.passengerName, 'gi')
        filters = _.omit(filters, 'passengerName')
      }
      const passengers = await userService.find(f)
      if (passengers) {
        filters = _.omit(filters, 'user')
        const ids = passengers.map(p => p._id)
        filters.user = { $in: [...ids] }
      }
    }
  } else if ('passengerName' in filters || 'passengerPhoneNumber' in filters) {
    const f: any = {}
    if ('passengerPhoneNumber' in filters) {
      f.phoneNumber = new RegExp(filters.passengerPhoneNumber, 'gi')
      filters = _.omit(filters, 'passengerPhoneNumber')
    }
    if ('passengerName' in filters) {
      f.fullName = new RegExp(filters.passengerName, 'gi')
      filters = _.omit(filters, 'passengerName')
    }
    const passengers = await userService.find(f)
    if (passengers) {
      filters = _.omit(filters, 'passenger')
      const ids = passengers.map(p => p._id)
      filters.passenger = { $in: [...ids] }
    }
  }

  return filters
}
