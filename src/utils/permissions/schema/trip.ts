import * as rules from '../rules'
import { rule } from 'graphql-shield'

const permissions = {
  Query: {
    haveCurrentTrip: rules.isUser,
    getAddressFromLongLat: rules.isUser,
    getUserReservedTrips: rules.isUser,
    getDriverReservedTrips: rules.isDriver,
    getTripsByAdmin: rules.isAdmin,
    driverHaveCurrentTrip: rules.isDriver,
    getTrip: rules.isAuthenticated,
    getTrips: rules.isAuthenticated,
    getTripReceiptForPassengerByAdmin: rules.isAdmin,
    getTripReceiptForDriverByAdmin: rules.isAdmin,
    getTripReceipt: rules.isUser,
    getTripReceiptForDriver: rules.isDriver,
    getCarsAround: rules.isAuthenticated,
    getTripsByAdminCount: rules.isAdmin
  },
  Mutation: {
    setOnlineCar: rules.isDriver,
    updateTripCarLocation: rules.isDriver,
    setOfflineCar: rules.isDriver,
    cancelTripByPassenger: rules.isUser,
    createTrip: rules.isUser,
    acceptTripByDriver: rules.isDriver,
    // carArrived: rules.isDriver,
    // carMoved: rules.isDriver,
    // carStopped: rules.isDriver,
    carArrivedAtDestination: rules.isDriver,
    // endTrip: rules.isDriver,
    addNewDestination: rules.isUser,
    returnTo: rules.isUser,
    forceEndTripTest: rules.isDriver,
    endTripByAdmin: rules.isAdmin,
    tripSendMessage: rules.isAuthenticated,
    changeStateOfTripByAdmin: rules.isAdmin,
    cancelTripByDriver: rules.isDriver,
    addHoldTime: rules.isDriver,
    carArrivedAtStartingPoint: rules.isDriver,
    startTrip: rules.isDriver,
    changeDropOffLocation: rules.isUser,
    enterSignature: rules.isDriver,
    parcelDelivered: rules.isDriver,
    cancelTripReservationByPassenger: rules.isUser,
    cancelTripReservationByDriver: rules.isDriver
  }
}

export default permissions
