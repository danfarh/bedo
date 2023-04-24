import { Twilio } from 'twilio'
import { SMS_AUTH_TOKEN, SMS_ACCOUNT_SID, SESSION_TTL } from '../config'
import userService from '../schema/user/service'
import voiceCallService from '../schema/voiceCall/service'

const client = require('twilio')(SMS_ACCOUNT_SID, SMS_AUTH_TOKEN)

const SERVICE_ID = 'KS9945492d9e0f4544ed350984fd701317'
function formatPhoneNumber(phoneNumber: string) {
  if (phoneNumber.match(/^00/)) return phoneNumber.replace(/^00/, '+')
  return `+1${phoneNumber}`
}

export async function createService(uniqueName) {
  const service = await client.proxy.services.create({ uniqueName })
  console.log('service', service)
  return service
}

export async function getSIdForPhoneNumber() {
  const incomingPhoneNumber = await client.incomingPhoneNumbers.create({
    phoneNumber: '+12267731620'
  })
  console.log('incomingPhoneNumber', incomingPhoneNumber)
  return incomingPhoneNumber
}

export async function addPhoneNumberToProxy(phoneNumberSId, serviceSId) {
  const addedPhoneNumber = await client.proxy
    .services(serviceSId)
    .phoneNumbers.create({ sid: phoneNumberSId })
  console.log('addedPhoneNumber', addedPhoneNumber)
}

export async function createSession(firstPhoneNumber, secondPhoneNumber) {
  const session = await client.proxy.services(SERVICE_ID).sessions.create({
    uniqueName: `${firstPhoneNumber}-${secondPhoneNumber}-${new Date().getTime()}`,
    ttl: SESSION_TTL
  })
  console.log('session', session)
  return session
}
// export async function updateSession(){
//   // const updatedSession = await client.
// }
export async function createParticipants(sessionSId, phoneNumber, name) {
  const participant = await client.proxy
    .services(SERVICE_ID)
    .sessions(sessionSId)
    .participants.create({ friendlyName: name, identifier: formatPhoneNumber(phoneNumber) })
  console.log('participant', participant)
  return participant
  // .then(participant => {
  //   return participant.proxyIdentifier
  // })
  // .catch(e => console.log(e))
}
export function createSessionForHistoryTrip(sessionName) {
  client.proxy
    .services(SERVICE_ID, sessionName)
    .sessions.create({ uniqueName: sessionName, ttl: 18000 })
    .then(session => console.log(session.ttl))
    .catch(e => console.log(e))
}
export async function deleteSession(sessionId) {
  const removedSession = await client.proxy
    .services(SERVICE_ID)
    .sessions(sessionId)
    .remove()
  return removedSession
}

export async function removeTripSession(tripId: String) {
  const { sessionIdSet } = await voiceCallService.deleteMany({ tripId })
  const removedSessionSet: String[] = await Promise.all(
    sessionIdSet.map(sessionId => deleteSession(sessionId))
  )
  console.log('removedSessionSet', removedSessionSet)
  return removedSessionSet
}

// export async function updateDeliveryTripSessionSet(trip, order) {
//   const { sessionIdSet: currentSessionIdSet } = await voiceCallService.findOne({ tripId: trip._id })
//   console.log('currentSessionId', currentSessionId)
//   const intendedParcelDestination = trip.parcelDestinations.filter(
//     parcelDestination => parcelDestination.order === order
//   )
//   const { fullName: receiverName, phoneNumber: receiverPhoneNumber } =
//     intendedParcelDestination.orderingForSomeoneElse &&
//     intendedParcelDestination.orderingForSomeoneElse.is
//       ? intendedParcelDestination.orderingForSomeoneElse.info
//       : intendedParcelDestination.receiverInfo
// }
