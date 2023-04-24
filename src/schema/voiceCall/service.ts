import { Types } from 'mongoose'
import _ from 'lodash'
import moment from 'moment'
import { ApolloError } from 'apollo-server-express'
import serviceBase from '../../utils/serviceBase'
import tripService from '../trip/service'
import userService from '../user/service'
import VoiceCall from './schema'

export default new (class service extends serviceBase {
  async findPhoneNumber(id: Types.ObjectId) {
    const Trip = await tripService.findById(id)
    const driver: any = await userService.findById(Trip.driver)
    const passenger: any =
      Trip.orderingForSomeoneElse && Trip.orderingForSomeoneElse.is
        ? await userService.findById(Trip.passenger)
        : Trip.orderingForSomeoneElse.info

    const numberSet = {
      driverPhoneNumber: driver.phoneNumber,
      driverName: driver.fullName,
      passengerName: passenger.fullName,
      passengerPhoneNumber: passenger.phoneNumber
    }
    return numberSet
  }

  async findRequestedUser(trip) {
    const { passenger, orderingForSomeoneElse } = trip
    const { fullName: passengerName, phoneNumber: passengerPhoneNumber } =
      orderingForSomeoneElse && orderingForSomeoneElse.is
        ? orderingForSomeoneElse.info
        : await userService.findById(passenger)

    return { passengerName, passengerPhoneNumber }
  }

  async checkProxyIdentifierExist(tripId, callerPhoneNumber, calleePhoneNumber) {
    const [trip]: any = await VoiceCall.find({ tripId })
    if (!trip) return null
    const { proxyIdentifier, from, to, createdAt } = trip
    if ((new Date().getTime() - createdAt.getTime()) / 60000 >= 5) return null
    return (String(from) === String(callerPhoneNumber) &&
      String(to) === String(calleePhoneNumber)) ||
      (String(from) === String(calleePhoneNumber) && String(to) === String(callerPhoneNumber))
      ? proxyIdentifier
      : null
  }

  async save(sessionId, tripId) {
    const voiceCall = new VoiceCall({
      tripId,
      sessionId
    })
    voiceCall.save()
  }
})(VoiceCall)
