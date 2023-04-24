import { rule } from 'graphql-shield'
import * as rules from '../rules'

const permissions = {
  Query: {
    getDriverByAdmin: rules.isAdmin,
    getDriversByAdmin: rules.isAdmin,
    getDriversCountByAdmin: rules.isAdmin,
    getDriversByShopAdmin: rules.isShopAdmin,
    getDriversCountByShopAdmin: rules.isShopAdmin,
    getDriversVerificationRequestsByAdmin: rules.isAdmin,
    getDriversVerificationRequestsCountByAdmin: rules.isAdmin,
    getMenuUnreadFields: rules.isAuthenticated,
    getDriverHistoryByShopAdmin: rules.isShopAdmin,
    getDefaultCar: rules.isDriver,
    getDriverWorkStatus: rules.isDriver,
    getDriverDetails: rules.isDriverAuthorized,
    getInTripDriverSetByAdmin: rules.isAdmin,
    getOnlineDriverSetByAdmin: rules.isAdmin,
    getDriverDistanceAndSuccessfulTripByShopAdmin: rules.isShopAdmin,
    getDriverStatisticsList: rules.isDriver,
    getDriverStatisticsListCountTrips: rules.isDriver,
    getDriverStatisticsListByAdmin: rules.isAdmin,
    getDriverStatisticsListCountTripsByAdmin: rules.isAdmin
  },
  Mutation: {
    createDriverByShopAdmin: rules.isShopAdmin,
    updateDriverInfoByShopAdmin: rules.isShopAdmin,
    deleteDriverByShopAdmin: rules.isShopAdmin,
    driverVerificationRequest: rules.isDriver,
    approveDriverVerificationRequestByAdmin: rules.isAdmin,
    rejectDriverVerificationRequestByAdmin: rules.isAdmin,
    suspendDriverByAdmin: rules.isAdmin,
    activateDriverByAdmin: rules.isAdmin,
    updateDriverInfoByAdmin: rules.isAdmin,
    setDefaultCarByAdmin: rules.isAdmin,
    createDriverVerificationRequestByAdmin: rules.isAdmin,
    setDefaultCar: rules.isDriver,
    updateDriverWorkStatus: rules.isDriver,
    driverSignUpByAdmin: rules.isAdmin,
    driverSignUpByShopAdmin: rules.isShopAdmin,
    updateDriverProfile: rules.isDriver
  }
}

export default permissions
