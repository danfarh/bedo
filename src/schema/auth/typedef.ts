import { gql } from 'apollo-server-express'

const typeDef = gql`
  ########## TYPES ##########
  type phoneVerificationResponse {
    phoneVerificationCode: String
    phoneVerificationCodeExpireTime: String!
  }
  type googleOrFacebookResponse {
    user: User
    message: String
    phoneNumber: String
  }
  type AUTH {
    accessToken: String!
    refreshToken: String!
  }

  type EmailVerificationCode {
    message: String
    hasBeenAlreadyVerified: Boolean
  }
  type getForgotPasswordCodeResponse {
    forgotPasswordCode: String
    phoneForgotPasswordCodeExpireTime: String!
  }
  type forgotPasswordResponse {
    changePasswordCode: String!
  }
  type forgotPasswordEmailResponse {
    message: String!
  }
  type changePasswordResponse {
    message: String!
  }
  type checkVerificationCodeResponse {
    phoneSignUpCode: String!
  }
  type signOutResponse {
    message: String!
  }
  type emailExists {
    exist: Boolean!
    message: String
  }

  type getUserEmailVerificationResponse {
    message: String!
    email: String!
    emailVerificationCode: String
    hasBeenAlreadyVerified: Boolean
  }

  type checkUserEmailVerificationResponse {
    message: String!
    email: String!
    hasBeenAlreadyVerified: Boolean
  }
  type AuthMessage {
    phoneNumber: String
    message: String!
  }

  ########## OPERATIONS ##########
  extend type Query {
    userCheckEmail(email: String!): emailExists!
    getNewAccessToken(refreshToken: String!, fcm: String!): AUTH!
    checkUserVerificationCode(
      checkVerificationCodeInput: checkVerificationCodeInput!
    ): checkVerificationCodeResponse
  }
  extend type Mutation {
    getUserPhoneVerificationCode(phoneNumber: String!): phoneVerificationResponse!
    userFacebook(token: String!, fcm: String!): googleOrFacebookResponse
    userGoogle(token: String!, fcm: String!): googleOrFacebookResponse
    localSignUp(signUpInput: signUpInput!): User
    getUserForgotPasswordCode(phoneNumber: String!): getForgotPasswordCodeResponse!
    checkUserForgotPasswordCode(
      forgotPasswordByPhoneNumberInput: forgotPasswordByPhoneNumberInput!
    ): forgotPasswordResponse!
    userChangePassword(changePasswordInput: changePasswordInput!): changePasswordResponse!
    getUserForgotPasswordEmailCode(email: String!): getForgotPasswordCodeResponse!
    checkUserForgotPasswordEmailCode(
      forgotPasswordByEmailInput: forgotPasswordByEmailInput!
    ): forgotPasswordResponse!
    localLogin(loginInput: loginInput): User
    userChangeEmailAndSendVerificationCode(newEmail: String): EmailVerificationCode
    getUserEmailVerificationCode(email: String!): getUserEmailVerificationResponse
    checkUserEmailVerificationCode(
      verifyUserEmailInput: verifyUserEmailInput!
    ): checkUserEmailVerificationResponse
    userGoogleWithPhoneVerification(
      userGoogleOrFacebookWithPhoneVerificationInput: userGoogleOrFacebookWithPhoneVerificationInput!
    ): User
    userFacebookWithPhoneVerification(
      userGoogleOrFacebookWithPhoneVerificationInput: userGoogleOrFacebookWithPhoneVerificationInput!
    ): User
    signOut: signOutResponse
    getNewEmailVerificationCode: EmailVerificationCode
    getAdminForgotPasswordCode(emailOrPhoneNumber: String!): getForgotPasswordCodeResponse
    checkAdminForgotPasswordCode(
      checkAdminForgotPasswordInput: checkAdminForgotPasswordInput!
    ): forgotPasswordResponse
    changeAdminPassword(changePasswordInput: changePasswordInput!): changePasswordResponse
  }

  ########## INPUTS & ENUMS ##########
  input AUTH2 {
    token: String!
  }

  input checkAdminForgotPasswordInput {
    emailOrPhoneNumber: String!
    emailOrPhoneNumberForgotPasswordCode: String!
  }

  input signUpInput {
    phoneNumber: String!
    phoneSignUpCode: String!
    password: String!
    email: String!
    fullName: String!
    fcm: String!
  }
  input loginInput {
    emailOrPhoneNumber: String!
    password: String!
    fcm: String!
  }
  input forgotPasswordByPhoneNumberInput {
    phoneNumber: String!
    phoneForgotPasswordCode: String!
  }

  input forgotPasswordByEmailInput {
    email: String!
    phoneForgotPasswordCode: String!
  }

  input changePasswordInput {
    emailOrPhoneNumber: String!
    password: String!
    phoneChangePasswordCode: String!
  }

  input verifyUserEmailInput {
    email: String!
    EmailVerificationCodeFromFront: String!
  }

  input userGoogleOrFacebookWithPhoneVerificationInput {
    phoneNumber: String!
    phoneVerificationCode: String!
    token: String!
    fcm: String!
  }
  input checkVerificationCodeInput {
    phoneVerificationCode: String!
    phoneNumber: String!
  }
`

export default typeDef
