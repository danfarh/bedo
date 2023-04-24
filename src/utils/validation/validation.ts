const Joi = require('@hapi/joi')

const phoneNumberValidation = Joi.object({
  phoneNumber: Joi.string()
    // .min(11)
    // .max(11)
    .required()
    .messages({
      'string.base': 'phone number should be type of String',
      'string.empty': 'phone number cannot be an empty field',
      // 'string.min': 'phone number should have a minimum length of {#limit}',
      // 'string.max': 'phone number should have a maximum length of {#limit}',
      'any.required': 'phone number is a required field'
    })
})

const signUpValidation = Joi.object({
  phoneNumber: Joi.string()
    // .min(11)
    // .max(11)
    .required()
    .messages({
      'string.base': 'phone number should be type of String',
      'string.empty': 'phone number cannot be an empty field',
      // 'string.min': 'phone number should have a minimum length of {#limit}',
      // 'string.max': 'phone number should have a maximum length of {#limit}',
      'any.required': 'phone number is a required field'
    }),
  password: Joi.string()
    .min(8)
    .required()
    .messages({
      'string.base': 'password should be type of String',
      'string.empty': 'password cannot be an empty field',
      'string.min': 'password should have a minimum length of {#limit}',
      'string.max': 'password should have a maximum length of {#limit}',
      'any.required': 'password is a required field'
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'email is not valid',
      'string.base': 'email should be type of String',
      'string.empty': 'email cannot be an empty field',
      'any.required': 'email is a required field'
    }),
  fullName: Joi.string()
    .min(4)
    .max(50)
    .required()
    .messages({
      'string.base': 'full name should be type of String',
      'string.empty': 'full name cannot be an empty field',
      'string.min': 'full name should have a minimum length of {#limit}',
      'string.max': 'full name should have a maximum length of {#limit}',
      'any.required': 'full name is a required field'
    })
})

const emailExistsValidation = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'email is not valid ',
      'string.base': 'email should be type of String',
      'string.empty': 'email cannot be an empty field',
      'any.required': 'email is a required field'
    })
})
const changePasswordByPhoneNumberValidation = Joi.object({
  phoneNumber: Joi.string()
    // .min(11)
    // .max(11)
    .required()
    .messages({
      'string.base': 'phone number should be type of String',
      'string.empty': 'phone number cannot be an empty field',
      // 'string.min': 'phone number should have a minimum length of {#limit}',
      // 'string.max': 'phone number should have a maximum length of {#limit}',
      'any.required': 'phone number is a required field'
    }),
  password: Joi.string()
    .min(8)
    .required()
    .messages({
      'string.base': 'password should be type of String',
      'string.empty': 'password cannot be an empty field',
      'string.min': 'password should have a minimum length of {#limit}',
      'string.max': 'password should have a maximum length of {#limit}',
      'any.required': 'password is a required field'
    })
})
const addOrUpdateCreditCard = Joi.object({
  cardHolderName: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.base': 'holder name should be type of String',
      'string.empty': 'holder name  cannot be an empty field',
      'string.min': 'holder name should have a minimum length of {#limit}',
      'string.max': 'holder name should have a maximum length of {#limit}',
      'any.required': 'holder name number is a required field'
    }),
  creditCardNumber: Joi.string()
    .min(16)
    .max(16)
    .required()
    .messages({
      'string.base': 'credit card number should be type of String',
      'string.empty': 'credit card number cannot be an empty field',
      'string.min': 'credit card number should have a minimum length of {#limit}',
      'string.max': 'credit card number should have a maximum length of {#limit}',
      'any.required': 'credit card number is a required field'
    }),
  cvv2: Joi.string()
    .min(3)
    .max(5)
    .required()
    .messages({
      'string.base': 'cvv2  should be type of String',
      'string.empty': 'cvv2 cannot be an empty field',
      'string.min': 'cvv2 should have a minimum length of {#limit}',
      'string.max': 'cvv2 should have a maximum length of {#limit}',
      'any.required': 'cvv2 is a required field'
    }),
  expirationMonth: Joi.string()
    .min(2)
    .max(2)
    .required()
    .messages({
      'string.base': 'expiration month should be type of String',
      'string.empty': 'expiration month  cannot be an empty field',
      'string.min': 'expiration month should have a minimum length of {#limit}',
      'string.max': 'expiration month should have a maximum length of {#limit}',
      'any.required': 'expiration month number is a required field'
    }),
  expirationYear: Joi.string()
    .min(2)
    .max(2)
    .required()
    .messages({
      'string.base': 'expiration year should be type of String',
      'string.empty': 'expiration year  cannot be an empty field',
      'string.min': 'expiration year should have a minimum length of {#limit}',
      'string.max': 'expiration year should have a maximum length of {#limit}',
      'any.required': 'expiration year number is a required field'
    }),
  type: Joi.string()
    .required()
    .messages({
      'string.base': 'type should be type of String',
      'string.empty': 'type cannot be an empty field',
      'string.min': 'type should have a minimum length of {#limit}',
      'string.max': 'type should have a maximum length of {#limit}',
      'any.required': 'type is a required field'
    })
})
const addOrUpdatePaypalAccountValidation = Joi.object({
  type: Joi.string()
    .required()
    .messages({
      'string.base': 'type should be type of String',
      'string.empty': 'type cannot be an empty field',
      'any.required': 'type is a required field'
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'email is not valid ',
      'string.base': 'email should be type of String',
      'string.empty': 'email cannot be an empty field',
      'any.required': 'email is a required field'
    })
})

const sendMessageValidation = Joi.object({
  text: Joi.string()
    .min(1)
    .required()
    .messages({
      'string.base': 'text should be type of String',
      'string.empty': 'text cannot be an empty field',
      'string.max': 'text should have a minimum length of {#limit}',
      'any.required': 'password is a required field'
    }),
  type: Joi.string()
    .min(1)
    .messages({
      'string.base': 'conversation type should be type of String',
      'string.empty': 'conversation type cannot be an empty field',
      'string.min': 'conversation type should have a minimum length of {#limit}'
    }),
  conversation: Joi.string()
    .min(1)
    .messages({
      'string.base': 'conversation ID should be type of String',
      'string.empty': 'conversation ID cannot be an empty field',
      'string.max': 'conversation ID should have a minimum length of {#limit}'
    }),
  title: Joi.string()
    .min(1)
    .messages({
      'string.base': 'title should be type of String',
      'string.empty': 'title cannot be an empty field',
      'string.min': 'title should have a minimum length of {#limit}'
    }),
  messageType: Joi.string()
    .required()
    .messages({
      'string.base': 'title should be type of String',
      'string.empty': 'title cannot be an empty field',
      'any.required': 'password is a required field'
    })
})

const changePasswordByEmailValidation = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'email is not valid ',
      'string.base': 'email should be type of String',
      'string.empty': 'email cannot be an empty field',
      'any.required': 'email is a required field'
    }),
  password: Joi.string()
    .min(8)
    .required()
    .messages({
      'string.base': 'password should be type of String',
      'string.empty': 'password cannot be an empty field',
      'string.min': 'password should have a minimum length of {#limit}',
      'string.max': 'password should have a maximum length of {#limit}',
      'any.required': 'password is a required field'
    })
})

const updateUserInformationValidation = Joi.object({
  email: Joi.string()
    .email()
    .messages({
      'string.email': 'email is not valid ',
      'string.base': 'email should be type of String',
      'string.empty': 'email cannot be an empty field'
    }),
  profileImageUrl: Joi.string()
    .min(1)
    .messages({
      'string.base': 'profile image url should be type of String',
      'string.empty': 'profile image url cannot be an empty field',
      'string.min': 'profile image url  should have a minimum length of {#limit}'
    }),
  fullName: Joi.string()
    .min(4)
    .max(25)
    .messages({
      'string.base': 'full name should be type of String',
      'string.empty': 'full name cannot be an empty field',
      'string.min': 'full name should have a minimum length of {#limit}',
      'string.max': 'full name should have a maximum length of {#limit}'
    }),
  full: Joi.string()
    .min(1)
    .max(250)
    .messages({
      'string.base': 'address should be type of String',
      'string.empty': 'address cannot be an empty field',
      'string.min': 'address should have a minimum length of {#limit}',
      'string.max': 'address should have a maximum length of {#limit}'
    }),
  zipCode: Joi.string()
    .min(0)
    .messages({
      'number.empty': 'zip code  cannot be an empty field',
      'number.min': 'zip code  should have a minimum length of {#limit}'
    }),
  birthDate: Joi.date()
    .min(1)
    .messages({
      'date.base': 'birth date should be type of Date',
      'date.empty': 'birth date cannot be an empty field',
      'date.min': 'birth date should have a minimum length of {#limit}'
    })
})

const updateUserPasswordInformationValidation = Joi.object({
  passwordHash: Joi.string()
    .min(8)
    .messages({
      'string.base': 'password should be type of String',
      'string.empty': 'password cannot be an empty field',
      'string.min': 'password should have a minimum length of {#limit}'
    })
})

const addOrUpdateCarValidation = Joi.object({
  color: Joi.string()
    .min(1)
    .messages({
      'string.base': 'color should be type of String',
      'string.empty': 'color cannot be an empty field',
      'string.min': 'color should have a minimum length of {#limit}',
      'string.max': 'color should have a maximum length of {#limit}'
    }),
  description: Joi.string()
    .min(1)
    .messages({
      'string.base': 'description should be type of String',
      'string.empty': 'description cannot be an empty field',
      'string.min': 'description should have a minimum length of {#limit}'
    }),
  plate: Joi.string()
    .min(1)
    .messages({
      'string.base': 'plate  should be type of String',
      'string.empty': 'plate cannot be an empty field',
      'string.min': 'plate should have a minimum length of {#limit}'
    }),
  carType: Joi.string()
    .min(1)
    .messages({
      'string.base': 'car type should be type of String',
      'string.empty': 'car type cannot be an empty field',
      'string.min': 'car type should have a minimum length of {#limit}'
    }),
  brand: Joi.string()
    .min(1)
    .messages({
      'string.base': 'brand should be type of String',
      'string.empty': 'brand cannot be an empty field',
      'string.min': 'brand should have a minimum length of {#limit}',
      'string.max': 'brand should have a maximum length of {#limit}'
    }),
  model: Joi.string()
    .min(1)
    .messages({
      'string.base': 'model should be type of String',
      'string.empty': 'model cannot be an empty field',
      'string.min': 'model should have a minimum length of {#limit}',
      'string.max': 'model should have a maximum length of {#limit}'
    }),
  registrationDocumentUrl: Joi.string()
    .min(1)
    .messages({
      'string.base': 'registration document url should be type of String',
      'string.empty': 'registration document url cannot be an empty field',
      'string.min': 'registration document url should have a minimum length of {#limit}'
    }),
  manufacturingYear: Joi.number().messages({
    'number.base': 'manufacturing year should be type of number',
    'string.empty': 'manufacturing year  cannot be an empty field',
    'string.min': 'manufacturing year  should have a minimum length of {#limit}'
  }),
  expireDate: Joi.date().messages({
    'date.base': 'expire date should be type of Date',
    'date.empty': 'expire date cannot be an empty field',
    'date.min': 'expire date should have a minimum length of {#limit}'
  }),
  insuranceImageUrl: Joi.string()
    .min(1)
    .messages({
      'string.base': 'registration document url should be type of String',
      'string.empty': 'registration document url cannot be an empty field',
      'string.min': 'registration document url should have a minimum length of {#limit}'
    }),
  url: Joi.string()
    .min(1)
    .messages({
      'string.base': 'image url should be type of String',
      'string.empty': 'image url cannot be an empty field',
      'string.min': 'image url url should have a minimum length of {#limit}'
    })
})

const addOrUpdateAdvertisement = Joi.object({
  description: Joi.string()
    .min(1)
    .messages({
      'string.min': 'description should have a minimum length of {#limit}',
      'string.base': 'description should be type of String',
      'string.empty': 'description cannot be an empty field'
    }),
  redirectTo: Joi.string()
    .min(1)
    .messages({
      'string.min': 'redirect to should have a minimum length of {#limit}',
      'string.base': 'redirect to should be type of String',
      'string.empty': 'redirect to cannot be an empty field'
    }),
  title: Joi.string()
    .min(1)
    .messages({
      'string.base': 'title should be type of String',
      'string.empty': 'title cannot be an empty field',
      'string.min': 'title should have a minimum length of {#limit}'
    }),
  startAt: Joi.date().messages({
    'string.base': 'start date should be type of Date',
    'string.empty': 'start date cannot be an empty field',
    'string.min': 'start date should have a minimum length of {#limit}',
    'date.base': 'start date must be a valid date'
  }),
  endAt: Joi.date().messages({
    'string.base': 'end date should be type of Date',
    'string.empty': 'end date cannot be an empty field',
    'string.min': 'end date should have a minimum length of {#limit}',
    'date.base': 'end date must be a valid date'
  })
})

const addNotificationValidation = Joi.object({
  body: Joi.string()
    .min(1)
    .messages({
      'string.min': 'body should have a minimum length of {#limit}',
      'string.base': 'body should be type of String',
      'string.empty': 'body cannot be an empty field'
    }),
  title: Joi.string()
    .min(1)
    .messages({
      'string.base': 'title should be type of String',
      'string.empty': 'title cannot be an empty field',
      'string.min': 'title should have a minimum length of {#limit}'
    })
})

const changeShopAdminPasswordValidation = Joi.object({
  password: Joi.string()
    .min(8)
    .required()
    .messages({
      'string.base': 'password should be type of String',
      'string.empty': 'password cannot be an empty field',
      'string.min': 'password should have a minimum length of {#limit}',
      'any.required': 'password is a required field'
    })
})

const shopAdminPasswordValidation = Joi.object({
  passwordHash: Joi.string()
    .min(8)
    .required()
    .messages({
      'string.base': 'password should be type of String',
      'string.empty': 'password cannot be an empty field',
      'string.min': 'password should have a minimum length of {#limit}',
      'string.max': 'password should have a maximum length of {#limit}',
      'any.required': 'password is a required field'
    })
})

export {
  phoneNumberValidation,
  signUpValidation,
  emailExistsValidation,
  changePasswordByPhoneNumberValidation,
  sendMessageValidation,
  addOrUpdateCreditCard,
  addOrUpdatePaypalAccountValidation,
  changePasswordByEmailValidation,
  updateUserInformationValidation,
  updateUserPasswordInformationValidation,
  addOrUpdateCarValidation,
  addNotificationValidation,
  addOrUpdateAdvertisement,
  changeShopAdminPasswordValidation,
  shopAdminPasswordValidation
}
