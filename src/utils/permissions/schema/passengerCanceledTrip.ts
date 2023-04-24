import * as rules from '../rules'

const permissions = {
  Query: {
    getPassengerCanceledTrips: rules.isUser,
    getPassengerCanceledTrip: rules.isUser,
    getPassengerCanceledTripsCount: rules.isUser
  }
}

export default permissions
