import * as rules from '../rules'

export default {
  Query: {
    getDriverCanceledTrips: rules.isDriver,
    getDriverCanceledTrip: rules.isDriver,
    getDriverCanceledTripsCount: rules.isDriver
  }
}
