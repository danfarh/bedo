import controller from './controller'
import checkIfUserExists from '../../utils/checkIfUserExists'
// const { AuthenticationError } = require('apollo-server-express')

const resolver: any = {
  Query: {
    // user: () => Boolean
    getNewAccessToken: async (_, { refreshToken, fcm }, { user, language }) => {
      const result = await controller.generateNewToken(refreshToken, fcm, language)
      return result
    },
    userCheckEmail: async (_, { email }, __): Promise<Object> => {
      const result = await controller.userCheckEmail(email)
      return result
    },
    checkUserVerificationCode: async (
      _,
      { checkVerificationCodeInput },
      { language }
    ): Promise<Object> => {
      const { phoneNumber, phoneVerificationCode } = checkVerificationCodeInput
      const result = await controller.checkUserVerificationCode(
        phoneNumber,
        phoneVerificationCode,
        language
      )
      return result
    }
  },
  Mutation: {
    localLogin: async (_, { loginInput }, { user, language }) => {
      const result = await controller.localLogin(loginInput, language)
      return result
    },
    userGoogle: async (_, { token, fcm }, { user }) => {
      return controller.userGoogle(token, fcm)
    },
    userFacebook: async (_, { token, fcm }, { user }) => {
      return controller.userFacebook(token, fcm)
    },
    userGoogleWithPhoneVerification: async (
      _,
      { userGoogleOrFacebookWithPhoneVerificationInput },
      { user }
    ) => {
      const {
        phoneNumber,
        phoneVerificationCode,
        token,
        fcm
      } = userGoogleOrFacebookWithPhoneVerificationInput
      const result = await controller.userGoogleWithPhoneVerification(
        phoneNumber,
        phoneVerificationCode,
        token,
        fcm
      )
      return result
    },
    userFacebookWithPhoneVerification: async (
      _,
      { userGoogleOrFacebookWithPhoneVerificationInput },
      { user }
    ) => {
      const {
        phoneNumber,
        phoneVerificationCode,
        token,
        fcm
      } = userGoogleOrFacebookWithPhoneVerificationInput
      const result = await controller.userFacebookWithPhoneVerification(
        phoneNumber,
        phoneVerificationCode,
        token,
        fcm
      )
      return result
    },
    // userCheckEmail: async (
    //   _,
    //   { email },
    //   __
    // ): Promise<{ exist: Boolean; message: String }> => {
    //   const result = await controller.userCheckEmail(email)
    //   return result
    // },
    getUserPhoneVerificationCode: async (
      _,
      { phoneNumber },
      { user, language }
    ): Promise<Object> => {
      const result = await controller.getUserPhoneVerificationCode(phoneNumber, language)
      return result
    },
    localSignUp: async (_, { signUpInput }, { language }): Promise<Object> => {
      const { phoneNumber, phoneSignUpCode, password, email, fullName, fcm } = signUpInput
      const result = await controller.localSignUp(
        phoneNumber,
        phoneSignUpCode,
        password,
        email,
        fullName,
        fcm,
        language
      )
      return result
    },
    getUserForgotPasswordCode: async (_, { phoneNumber }, { language }): Promise<Object> => {
      const result = await controller.getUserForgotPasswordCode(phoneNumber, language)
      return result
    },
    checkUserForgotPasswordCode: async (
      _,
      { forgotPasswordByPhoneNumberInput },
      { language }
    ): Promise<Object> => {
      const { phoneNumber, phoneForgotPasswordCode } = forgotPasswordByPhoneNumberInput
      const result = await controller.checkUserForgotPasswordCode(
        phoneNumber,
        phoneForgotPasswordCode,
        language
      )
      return result
    },
    userChangePassword: async (_, { changePasswordInput }, { language }): Promise<Object> => {
      const { emailOrPhoneNumber, password, phoneChangePasswordCode } = changePasswordInput
      const result = await controller.changeUserPassword(
        emailOrPhoneNumber,
        password,
        phoneChangePasswordCode,
        language
      )
      return result
    },
    getUserForgotPasswordEmailCode: async (_, { email }, __): Promise<Object> => {
      const result = await controller.getUserForgotPasswordEmailCode(email)
      return result
    },
    getUserEmailVerificationCode: async (_, { email }, __): Promise<Object> => {
      const result = await controller.getUserEmailVerificationCode(email)
      return result
    },
    userChangeEmailAndSendVerificationCode: async (_, { newEmail }, { user }) => {
      if (user.roles === 'USER') await controller.userChangeEmail(newEmail, user.sub)
      if (user.roles === 'DRIVER') await controller.driverChangeEmail(newEmail, user.sub)
      return controller.getNewEmailVerificationCode(user)
    },
    checkUserEmailVerificationCode: async (_, { verifyUserEmailInput }, __): Promise<Object> => {
      const { email, EmailVerificationCodeFromFront } = verifyUserEmailInput
      const result = await controller.checkUserEmailVerificationCode(
        email,
        EmailVerificationCodeFromFront
      )
      return result
    },
    checkUserForgotPasswordEmailCode: async (
      _,
      { forgotPasswordByEmailInput },
      __
    ): Promise<Object> => {
      const { email, phoneForgotPasswordCode } = forgotPasswordByEmailInput
      const result = await controller.checkUserEmailForgotPasswordCode(
        email,
        phoneForgotPasswordCode
      )
      return result
    },
    signOut: (_, args, { user }): Promise<Object> => {
      checkIfUserExists(user)
      return controller.signOut(user)
    },
    getNewEmailVerificationCode: (_, args, { user }): Promise<Object> => {
      return controller.getNewEmailVerificationCode(user)
    },
    getAdminForgotPasswordCode: async (parent, { emailOrPhoneNumber }) => {
      return controller.adminForgotPassword(emailOrPhoneNumber)
    },
    checkAdminForgotPasswordCode: async (parent, { checkAdminForgotPasswordInput }) => {
      const {
        emailOrPhoneNumber,
        emailOrPhoneNumberForgotPasswordCode
      } = checkAdminForgotPasswordInput
      return controller.checkAdminForgotPasswordCode(
        emailOrPhoneNumber,
        emailOrPhoneNumberForgotPasswordCode
      )
    },
    changeAdminPassword: async (parent, { changePasswordInput }) => {
      const { emailOrPhoneNumber, password, phoneChangePasswordCode } = changePasswordInput
      return controller.changeAdminPassword(emailOrPhoneNumber, password, phoneChangePasswordCode)
    }
  }
}

export default resolver
