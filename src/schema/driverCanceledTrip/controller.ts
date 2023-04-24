import { Types } from 'mongoose'
import service from './service'
import controllerBase from '../../utils/controllerBase'

export default new (class Controller extends controllerBase {
  async cancelTrip(
    driver: Types.ObjectId,
    tripId: Types.ObjectId,
    reasonId: Types.ObjectId | null
  ) {
    const canceledTrip = await service.create({
      driver,
      tripId,
      reasonId
    })
    return canceledTrip
  }
})(service)
