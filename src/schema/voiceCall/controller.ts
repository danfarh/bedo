import { ApolloError } from 'apollo-server-express'
import { createSession, createParticipants, deleteSession } from '../../utils/maskingNumbers'
import service from './service'
import { makeEmergencyCall } from '../../utils/makeCall'
import tripService from '../trip/service'
import driverService from '../driver/service'
import userService from '../user/service'
// import userService from '../user/service'

export default new (class Controller {
  async createCall(tripId, destinationOrder, to) {
    const {
      tripType,
      driver: driverId,
      passenger,
      parcelDestinations
    } = await tripService.findById(tripId)

    let caller: { fullName: String; phoneNumber: String } = { fullName: '', phoneNumber: '' }
    let callee: { fullName: String; phoneNumber: String } = { fullName: '', phoneNumber: '' }
    const {
      fullName: driverName,
      phoneNumber: driverPhoneNumber
    }: any = await driverService.findById(driverId)
    if (tripType === 'RIDE') {
      const {
        fullName: passengerName,
        phoneNumber: passengerPhoneNumber
      }: any = await userService.findById(passenger)
      // const { passengerName, passengerPhoneNumber } = await service.findRequestedUser(passenger , orderingForSomeoneElse)
      if (to === 'DRIVER') {
        caller = { fullName: passengerName, phoneNumber: passengerPhoneNumber }
        callee = { fullName: driverName, phoneNumber: driverPhoneNumber }
      } else {
        caller = { fullName: driverName, phoneNumber: driverPhoneNumber }
        callee = { fullName: passengerName, phoneNumber: passengerPhoneNumber }
      }
    } else if (tripType === 'DELIVERY') {
      if (to === 'DRIVER' || to === 'SENDER') {
        const {
          fullName: senderName,
          phoneNumber: senderPhoneNumber
        }: any = await userService.findById(passenger)
        // const { senderName, senderPhoneNumber } = await service.findRequestedUser(passenger , orderingForSomeoneElse)
        if (to === 'DRIVER') {
          caller = { fullName: senderName, phoneNumber: senderPhoneNumber }
          callee = { fullName: driverName, phoneNumber: driverPhoneNumber }
        }
        if (to === 'SENDER') {
          caller = { fullName: driverName, phoneNumber: driverPhoneNumber }
          callee = { fullName: senderName, phoneNumber: senderPhoneNumber }
        }
      }
      if (to === 'RECEIVER') {
        const [intendedParcelDestination] = parcelDestinations.filter(
          parcelDestination => parcelDestination.order === destinationOrder
        )
        const {
          fullName: receiverName,
          phoneNumber: receiverPhoneNumber
        } = intendedParcelDestination.receiverInfo
        // const { fullName: receiverName, phoneNumber: receiverPhoneNumber } =
        // intendedParcelDestination.orderingForSomeoneElse &&
        // intendedParcelDestination.orderingForSomeoneElse.is
        //   ? intendedParcelDestination.orderingForSomeoneElse.info
        //   : intendedParcelDestination.receiverInfo
        caller = { fullName: driverName, phoneNumber: driverPhoneNumber }
        callee = { fullName: receiverName, phoneNumber: receiverPhoneNumber }
      }
    }
    const proxyIdentifier: any = await service.checkProxyIdentifierExist(
      tripId,
      caller.phoneNumber,
      callee.phoneNumber
    )
    if (proxyIdentifier) return proxyIdentifier
    const session = await createSession(caller.phoneNumber, callee.phoneNumber)
    const callCenterForCaller = await createParticipants(
      session.sid,
      caller.phoneNumber,
      caller.fullName
    )
    const callCenterForCallee = await createParticipants(
      session.sid,
      callee.phoneNumber,
      caller.fullName
    )
    console.log(
      'createCall',
      tripId,
      to,
      session,
      caller,
      callee,
      callCenterForCaller,
      callCenterForCallee
    )
    service.create({
      tripId,
      sessionId: session.sid,
      from: caller.phoneNumber,
      to: callee.phoneNumber,
      proxyIdentifier: callCenterForCaller.proxyIdentifier
    })
    if (!callCenterForCaller.proxyIdentifier)
      throw new ApolloError('There is no phone number', '400')
    return callCenterForCaller.proxyIdentifier
  }

  // async deleteCallSession(tripId) {
  //   const voiceCall = await service.findOne({ tripId })
  //   const successDataBase = await service.findOneAndRemove({ tripId })
  //   const successSession = deleteSession(voiceCall.sessionId)
  //   if (successDataBase && successSession) {
  //     return true
  //   }
  //   return false
  // }

  async createEmergencyCall(tripId) {
    makeEmergencyCall(tripId)
    return true
  }
})()
