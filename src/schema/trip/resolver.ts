import controller from './controller'
import driverController from '../driver/controller'
import driverService from '../driver/service'
import carService from '../car/service'
import userService from '../user/service'
import ParcelVolumeService from '../parcelVolume/service'
import ParcelWeightService from '../parcelWeight/service'
import paymentService from '../payment/service'
import pubsub, { withFilter } from '../../utils/pubsub'

import {
  TRIP_CAR_LOCATION,
  ACCEPTED_TRIP,
  FIND_DRIVER,
  TRIP_CHAT,
  UPDATE_TRIP,
  REMOVE_TRIP_FROM_FIND_DRIVER,
  REMOVE_TRIP
} from '../../utils/pubsubKeys'

const resolver = {
  Query: {
    getRedisKeys: async () => {
      return controller.getRedisKeys()
    },
    getCarsAround: async (parent, { location, tripType }) => {
      return controller.getCarsAround(location, tripType)
    },
    haveCurrentTrip: async (parent, args, { user }) => {
      return controller.haveCurrentTrip(user.sub)
    },
    getTrip: async (parent, { id }, { user }) => {
      return controller.getTrip(id, user)
    },
    getTrips: async (parent, { filters, pagination, sort }, { user }) => {
      return controller.getTrips(user, filters, pagination, sort)
    },
    getTripReceipt: async (parent, { tripId }, { user, language }) => {
      return controller.createReceipt(user, tripId, language)
    },
    getTripReceiptForDriver: async (parent, { tripId }, { user, language }) => {
      return controller.createReceiptForDriver(user, tripId, language)
    },
    getAddressFromLongLat: async (parent, { location }, { user }) => {
      return controller.getAddressFromLongLat(location)
    },
    getDriverReservedTrips: async (parent, { pagination, sort }, { user }) => {
      return controller.getDriverReservedTrips(user, pagination, sort)
    },
    getUserReservedTrips: async (parent, { pagination, sort }, { user }) => {
      return controller.getUserReservedTrips(user, pagination, sort)
    },
    getTripsByAdmin: async (parent, { filters, pagination, sort }) => {
      return controller.getTripsByAdmin(filters, pagination, sort)
    },
    driverHaveCurrentTrip: async (parent, args, { user }) => {
      return controller.driverHaveCurrentTrip(user.sub)
    },
    getTripsByAdminCount: async (parent, { filters }) => {
      return controller.getTripsByAdminCount(filters)
    },
    getTripReceiptForPassengerByAdmin: async (parent, { tripId }, { user }) => {
      return controller.getTripReceiptForPassengerByAdmin(user, tripId)
    },
    getTripReceiptForDriverByAdmin: async (parent, { tripId }, { user }) => {
      return controller.getTripReceiptForDriverByAdmin(user, tripId)
    },
    getTripForOfflineDrivers: async (parent, args, { user, language }) => {
      return controller.getTripForOfflineDrivers(user, language)
    }
  },
  Mutation: {
    setOnlineCar: async (parent, { long, lat, angle }, { user, language }) => {
      // pubsub.publish(SET_ONLINE_CAR, { setOnlineCar: { userId: user.sub, long, lat } })
      const driver: any = await driverController.setWorkDriverStatus(user.sub, 'ACTIVE')
      return controller.setOnlineCar(driver.defaultCar, long, lat, angle, language)
    },
    updateTripCarLocation(parent, { location, tripId }, { user }) {
      return controller.updateTripCarLocation(user, tripId, location)
    },
    setOfflineCar: async (parent, _, { user }) => {
      driverController.setWorkDriverStatus(user.sub, 'INACTIVE')
      return controller.setOfflineCar(user.sub)
    },
    setOfflineAllCarSet: async () => {
      await driverController.setInActiveAllDriverSet()
      return controller.setOfflineAllCarSet()
    },
    cancelTripByPassenger: async (parent, { data }, { user, language }) => {
      const { tripId, reasonId, reason, carCoordinate } = data
      const result = await controller.cancelTripByPassenger(
        user,
        tripId,
        reasonId,
        reason,
        carCoordinate,
        language
      )
      return result
    },
    cancelTripByDriver: async (parent, { data }, { user, language }) => {
      const { tripId, reasonId } = data
      const result = await controller.cancelTripByDriver(user, tripId, reasonId, language)
      return result
    },
    createTrip: async (parent, { input, onlyCalculate }, { user, language }) => {
      return controller.createTrip({ ...input, passenger: user.sub }, onlyCalculate, user, language)
    },
    addHoldTime: async (parent, { data }, { user }) => {
      const { tripId, waitTimes } = data
      return controller.addHoldTime(tripId, user, waitTimes)
    },
    acceptTripByDriver: async (parent, { tripId }, { user, language }) => {
      return controller.acceptTripByDriver(user.sub, tripId, language)
    },
    carArrivedAtStartingPoint: async (parent, { tripId }, { user, language }) => {
      return controller.carArrivedAtStartingPoint(tripId, user, language)
    },
    startTrip: async (parent, { tripId }, { user, language }) => {
      return controller.startTrip(tripId, user, language)
    },
    // carStopped: async (parent, { tripId }, { user }) => {
    //   return controller.carStopped(tripId, user)
    // },
    carArrivedAtDestination: async (parent, { tripId, destinationOrder }, { user, language }) => {
      return controller.carArrivedAtDestination(tripId, destinationOrder, user, language)
    },
    // endTrip: async (parent, { tripID }, { user }) => {
    //   return controller.endTrip(tripID, user)
    // },
    addNewDestination: async (parent, { data }, { user, language }) => {
      const { tripId, newDestination } = data
      return controller.addNewDestination(tripId, newDestination, user, language)
    },
    changeDropOffLocation: async (parent, { data }, { user, language }) => {
      const { tripId, order, receiverInfo, newDestination, orderingForSomeoneElse } = data
      return controller.changeDropOffLocation(
        tripId,
        order,
        receiverInfo,
        newDestination,
        orderingForSomeoneElse,
        user,
        language
      )
    },
    returnTo: async (parent, { data }, { user, language }) => {
      const { tripId, order } = data
      return controller.returnTo(tripId, order, user, language)
    },
    forceEndTripTest: async (parent, { tripID }) => {
      return controller.forceEndTripTest(tripID)
    },
    tripSendMessage: async (parent, { tripId, receiverId, message }, { user, language }) => {
      return controller.sendMessage(user.userId, receiverId, tripId, message, language)
    },
    enterSignature: async (parent, { tripId, deliveryOrder, signatures }, { user, language }) => {
      return controller.enterSignature(tripId, deliveryOrder, signatures, user, language)
    },
    parcelDelivered: async (parent, { tripId, deliveryOrder }, { user, language }) => {
      return controller.parcelDelivered(tripId, deliveryOrder, user, language)
    },
    cancelTripReservationByPassenger: async (
      parent,
      { tripId, reasonId, reason },
      { user, language },
      info
    ) => {
      return controller.cancelTripReservationByPassenger(tripId, reasonId, reason, user, language)
    },
    cancelTripReservationByDriver: async (
      parent,
      { tripId, reasonId },
      { user, language },
      info
    ) => {
      return controller.cancelTripReservationByDriver(tripId, reasonId, user, language)
    },
    endTripByAdmin: async (parent, { tripId }, { user }, info) => {
      return controller.endTripByAdmin(tripId)
    },
    changeStateOfTripByAdmin: async (parent, { _id, state }) => {
      return controller.changeStateOfTripByAdmin(_id, state)
    }
  },
  Trip: {
    driver: async parent => {
      return driverService.findById(parent.driver)
    },
    car: async parent => {
      return carService.findById(parent.car)
    },
    passengerDetail: async parent => {
      return userService.findById(parent.passenger)
    }
  },
  AcceptedTrip: {
    driver: async parent => {
      return driverService.findById(parent.driver)
    }
  },
  ParcelsInfo: {
    parcelsVolume: async parent => {
      return ParcelVolumeService.findById(parent.parcelsVolume)
    },
    parcelsWeight: async parent => {
      return ParcelWeightService.findById(parent.parcelsWeight)
    }
  },
  Subscription: {
    // setOnlineCar: {
    //   subscribe: withFilter(
    //     () => pubsub.asyncIterator(SET_ONLINE_CAR),
    //     async (payload, variables, { user, type }) => {
    //       console.log(payload, variables)

    //       if (type !== 'car') return false
    //       return true
    //     }
    //   )
    // },
    findDriver: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(FIND_DRIVER),
        async (payload, variables, { user }) => {
          if (payload.findDriver.driverId.toString() === user.userId) return true
          return false
        }
      )
    },
    acceptedTrip: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(ACCEPTED_TRIP),
        async (payload, variables, { user }) => {
          if (variables.trackId) {
            if (variables.trackId === payload.acceptedTrip.trip.trackId) {
              return true
            }
            return false
          }
          if (payload.acceptedTrip.trip.passenger.toString() === user.sub) return true
          return false
        }
      )
    },
    updateTrip: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(UPDATE_TRIP),
        async (payload, variables, { user }) => {
          if (variables.trackId) {
            if (variables.trackId === payload.updateTrip.trackId) {
              return true
            }
            return false
          }
          const trip = payload.updateTrip
          const contributors = [trip.passenger.toString()]
          if (trip.driver) {
            contributors.push(trip.driver.toString())
          }
          if (contributors.includes(user.sub)) {
            return true
          }
          return false
        }
      )
    },
    removeTrip: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(REMOVE_TRIP),
        async (payload, variables, { user }) => {
          return user.roles === 'DRIVER'
        }
      )
    },
    tripCarLocation: {
      subscribe: withFilter(
        () => {
          return pubsub.asyncIterator(TRIP_CAR_LOCATION)
        },
        async (payload, variables, { user }) => {
          if (variables.trackId) {
            if (variables.trackId === payload.tripCarLocation.trip.trackId) {
              return true
            }
            return false
          }
          const { trip } = payload.tripCarLocation

          if (
            !trip.isEnded &&
            (trip.passenger.toString() === user.userId ||
              trip.driver.toString() === user.userId ||
              user.roles === 'SUPER_ADMIN')
          ) {
            return true
          }
          return false
        }
      )
    },
    tripChat: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(TRIP_CHAT),
        async (payload, variables, { user }) => {
          if (variables.trackId) {
            if (variables.trackId === payload.trip.trackId) {
              return true
            }
            return false
          }
          if (user.userId == payload.tripChat.receiverId) return true
          return false
        }
      )
    },
    removeTripFromFindDriver: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(REMOVE_TRIP_FROM_FIND_DRIVER),
        async (payload, variables, { user }) => {
          if (payload.removeTripFromFindDriver.driverId.toString() === user.sub) return true
          return false
        }
      )
    }
  }
}

export default resolver
