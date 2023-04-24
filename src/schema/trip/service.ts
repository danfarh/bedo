// database request
// import bcrypt from 'bcryptjs'
import { Types } from 'mongoose'
import Trip from './schema'
import {
  getCarsAround,
  setOnlineCar,
  setOfflineCar,
  getCarLocation,
  RedisGet,
  setAngle
} from '../../utils/redis'
import ServiceBase from '../../utils/serviceBase'

export default new (class service extends ServiceBase {
  async findTripById(id: Types.ObjectId) {
    return Trip.findOne({ _id: id })
  }

  async getCarsAround(location: any, carType: Types.ObjectId, radius: number) {
    return getCarsAround(location, carType, radius)
  }

  async setAngle(id: Types.ObjectId, angle: number) {
    return setAngle(id, angle)
  }

  async getAngle(id: String) {
    return RedisGet(id)
  }

  async setOnlineCar(id: Types.ObjectId, long: number, lat: number, carType: Types.ObjectId) {
    return setOnlineCar(id, long, lat, carType)
  }

  async setOfflineCar(id: Types.ObjectId, carType: Types.ObjectId) {
    return setOfflineCar(id, carType)
    // return setOfflineCar(id, carType)
  }

  async save(trip: any) {
    return Trip.create(trip)
  }

  async haveCurrentTrip(userId: Types.ObjectId) {
    return Trip.findOne({
      passenger: userId,
      ended: { $ne: true },
      state: { $nin: ['RESERVED', 'PENDING'] }
    }).exec()
  }

  async driverHaveCurrentTrip(driverId: Types.ObjectId | String) {
    return this.model.findOne({
      driver: driverId,
      ended: { $ne: true },
      state: { $ne: 'RESERVED' }
    })
  }

  async addDriverToTrip(
    id: Types.ObjectId,
    driverId: Types.ObjectId,
    carId: Types.ObjectId,
    reserved: boolean = false
  ) {
    return this.findOneAndUpdate(id, {
      $set: {
        driver: driverId,
        state: reserved ? 'RESERVED' : 'ACCEPTED',
        car: carId
      }
    })
  }

  async getCarLocation(carType: Types.ObjectId | String, carId: Types.ObjectId | String) {
    return getCarLocation(carType, carId)
  }
})(Trip)
