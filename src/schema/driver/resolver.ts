import controller from './controller'
import checkIfUserExists from '../../utils/checkIfUserExists'
import carService from '../car/service'
import decrypt from '../../utils/decrypt'
import ResolverBase from '../../utils/resolverBase'
import service from './service'
import tripController from '../trip/controller'

const resolverBase = new ResolverBase(controller)

const resolver: any = {
  Query: {
    // getDriverPaymentStatus: async (_, args, { user }): Promise<Object> => {
    //   checkIfUserExists(user)
    //   return controller.getDriverPaymentStatus(user.sub)
    // },
    getDefaultCar: async (_, args, { user, language }): Promise<Object> => {
      checkIfUserExists(user)
      return controller.getDefaultCar(user.sub, language)
    },
    getDriverWorkStatus: async (_, args, { user, language }): Promise<Object> => {
      checkIfUserExists(user)
      return controller.getWorkDriverStatus(user.sub, language)
    },
    getDriverDetails: async (_, arg, { user }): Promise<any> => {
      checkIfUserExists(user)
      return controller.getDriverDetails(user.userId)
    },
    getDriverAboutMe: async (_, arg, { user }): Promise<any> => {
      checkIfUserExists(user)
      return controller.getDriverAboutMe(user.userId)
    },
    getDriverHistoryByShopAdmin: async (
      _,
      { driverId, filters, pagination },
      { user }
    ): Promise<any> => {
      checkIfUserExists(user)
      return controller.getDriverHistoryByShopAdmin(user.userId, driverId, filters, pagination)
    },
    getMenuUnreadFields: async (_, args, { user }): Promise<Object> => {
      return controller.getMenuUnreadFields(user)
    },
    getDriverByAdmin: resolverBase.query.get,
    getDriversByAdmin: async (parent, { filters, sort, pagination }) => {
      return controller.getDriversByAdmin(filters, pagination, sort)
    },
    getDriversCountByAdmin: async (parent, { filters }) => {
      return controller.getDriversCountByAdmin(filters)
    },
    getDriverDistanceAndSuccessfulTripByShopAdmin: async (parent, { driverId }, { user }) => {
      return tripController.getDriverDistanceAndSuccessfulTripByShopAdmin(user, driverId)
    },
    getDriversByShopAdmin: async (parent, { filters, sort }, { user }) => {
      return controller.getDriversByShopAdmin(user, filters, sort)
    },
    getDriversCountByShopAdmin: async (parent, { filters }) => {
      return controller.getDriversCountByShopAdmin(filters)
    },
    getAllDrivers: () => service.find({}),
    getDriversVerificationRequestsByAdmin: async (
      _,
      { filters, pagination, sort },
      { user }
    ): Promise<Object> => {
      return controller.getDriversVerificationRequestsByAdmin(filters, pagination, sort)
    },
    getOnlineDriverSetByAdmin: async () => {
      return controller.getOnlineDriverSetByAdmin()
    },
    getInTripDriverSetByAdmin: async () => {
      return controller.getInTripDriverSetByAdmin()
    },
    getDriversVerificationRequestsCountByAdmin: async (
      _,
      { filters },
      { user }
    ): Promise<Object> => {
      return controller.getDriversVerificationRequestsCountByAdmin(filters)
    },
    getDriverStatisticsList: async (parent, { filters }, { user }) => {
      return controller.getDriverStatisticsList(user, filters)
    },
    getDriverStatisticsListCountTrips: async (parent, { filters }, { user }) => {
      return controller.getDriverStatisticsListCountTrips(user, filters)
    },
    getDriverStatisticsListByAdmin: async (parent, { driverId, filters }, { user }) => {
      return controller.getDriverStatisticsListByAdmin(driverId, filters)
    },
    getDriverStatisticsListCountTripsByAdmin: async (parent, { driverId, filters }, { user }) => {
      return controller.getDriverStatisticsListCountTripsByAdmin(driverId, filters)
    }
  },
  Mutation: {
    getDriverPhoneSignUpCode: async (_, { phoneNumber }, { user, language }): Promise<Object> => {
      return controller.getDriverPhoneSignUpCode(phoneNumber, language)
    },
    checkDriverPhoneSignupCode: async (
      parent,
      { phoneSignUpCode, phoneNumber },
      { user, language }
    ) => {
      const result = await controller.checkDriverPhoneSignupCode(
        phoneNumber,
        phoneSignUpCode,
        language
      )
      return result
    },
    driverSignUp: async (_, { data }, { language }): Promise<Object> => {
      const { fullName, email, phoneNumber, password, fcm } = data
      const result = await controller.driverSignUp(
        fullName,
        email,
        phoneNumber,
        password,
        fcm,
        language
      )
      return result
    },
    publicDriverSignUp: async (_, { driverData }, { language }): Promise<Object> => {
      const result = await controller.publicDriverSignUp(driverData, language)
      return result
    },
    driverLogin: async (_, { data }, { user, language }) => {
      const { emailOrPhoneNumber, password, fcm } = data
      const result = await controller.driverLogin(emailOrPhoneNumber, password, fcm, language)
      return result
    },
    createDriverByShopAdmin: async (_, { data }, { user }) => {
      // eslint-disable-next-line no-return-await
      return await controller.createDriverByShopAdmin(data, user)
    },
    updateDriverInfoByShopAdmin: (parent, { input, driverId }) => {
      return controller.updateDriverInfoByShopAdmin(input, driverId)
    },
    deleteDriverByShopAdmin: async (parent, { idSet }, { user }) => {
      return controller.deleteDriverByShopAdmin(idSet)
    },
    getDriverForgotPasswordCode: async (_, { phoneNumber }, { language }): Promise<Object> => {
      const result = await controller.getDriverForgotPasswordCode(phoneNumber, language)
      return result
    },
    checkDriverForgotPasswordCode: async (
      _,
      { forgotPasswordByPhoneNumberInput },
      { language }
    ): Promise<Object> => {
      const { phoneNumber, phoneForgotPasswordCode } = forgotPasswordByPhoneNumberInput
      const result = await controller.checkDriverForgotPasswordCode(
        phoneNumber,
        phoneForgotPasswordCode,
        language
      )
      return result
    },

    driverChangePassword: async (
      _,
      { changePasswordInput },
      { user, language }
    ): Promise<Object> => {
      const { newPassword, currentPassword } = changePasswordInput
      const result = await controller.driverChangePassword(
        newPassword,
        currentPassword,
        user.userId,
        language
      )
      return result
    },
    getDriverForgotPasswordEmailCode: async (_, { email }, { language }): Promise<Object> => {
      const result = await controller.getDriverForgotPasswordEmailCode(email, language)
      return result
    },
    checkDriverForgotPasswordEmailCode: async (
      _,
      { forgotPasswordByEmailInput },
      { language }
    ): Promise<Object> => {
      const { email, phoneForgotPasswordCode } = forgotPasswordByEmailInput
      const result = await controller.checkDriverEmailForgotPasswordCode(
        email,
        phoneForgotPasswordCode,
        language
      )
      return result
    },
    setDefaultCar: async (_, { id }, { user, language }): Promise<Object> => {
      checkIfUserExists(user)
      return controller.setDefaultCar(id, user.sub, language)
    },
    updateDriverWorkStatus: async (_, { status }, { user }): Promise<Object> => {
      checkIfUserExists(user)
      return controller.updateWorkStatus(status, user.sub)
    },
    driverVerificationRequest: async (parent, { inputs }, { user, language }) => {
      return controller.verificationRequest(user, inputs, language)
    },
    approveDriverVerificationRequestByAdmin: async (parent, { driverId }) => {
      return controller.approveDriverVerificationRequestByAdmin(driverId)
    },
    rejectDriverVerificationRequestByAdmin: async (parent, { driverId, message }) => {
      return controller.rejectDriverVerificationRequestByAdmin(driverId, message)
    },
    suspendDriverByAdmin: async (parent, { idSet }) => {
      return controller.suspendDriverSetByAdmin(idSet)
    },
    activateDriverByAdmin: async (parent, { driverId }) => {
      return controller.activateDriverByAdmin(driverId)
    },
    driverSignUpByAdmin: async (_, { input }, __): Promise<Object> => {
      return controller.driverSignUpByAdmin(input)
    },
    driverSignUpByShopAdmin: async (_, { input }, __): Promise<Object> => {
      return controller.driverSignUpByShopAdmin(input)
    },
    updateDriverProfile: async (_, { input }, { user, language }): Promise<Object> => {
      return controller.updateDriverProfile(input, user.userId, language)
    },
    updateDriverInfoByAdmin: (parent, { input, driverId }) => {
      return controller.updateDriverInfoByAdmin(input, driverId)
    },
    setDefaultCarByAdmin: async (parent, { driverId, carId }) => {
      return controller.setDefaultCarByAdmin(driverId, carId)
    },
    createDriverVerificationRequestByAdmin: async (
      parent,
      { input, driverId },
      { user, language }
    ) => {
      return controller.createDriverVerificationRequestByAdmin(input, driverId, language)
    }
  },
  Driver: {
    defaultCar: parent => {
      return carService.findById(parent.defaultCar)
    },
    car: parent => {
      return carService.find({ _id: { $in: parent.car } })
    }
  },
  MultiLanguageDriver: {
    defaultCar: parent => {
      return carService.findById(parent.defaultCar)
    },
    car: parent => {
      return carService.find({ _id: { $in: parent.car } })
    }
  }
}

export default resolver
