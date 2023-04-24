import { ValidationError as ApolloValidationError, ValidationError } from 'apollo-server-express'
import { ValidationError as JoiValidationError } from '@hapi/joi'

const validationErrorType = 'VALIDATION_ERROR'

const handleApolloValidationError = err => {
  const pathSearchResult = /^field\s([^\s]+)/i.exec(err.message)
  const path = pathSearchResult && pathSearchResult[1] ? pathSearchResult[1] : ''
  const field = path ? path.split('.')[path.split('.').length - 1] : path

  // !apollo errors are frozen!
  return {
    type: validationErrorType,
    field,
    ...err
  }
}

const handleJoiValidationError = err => {
  const { message, path } = err.originalError.details[0]
  const field = path[0]
  return {
    type: validationErrorType,
    field,
    message,
    ...err
  }
}

export default err => {
  // apollo validation error
  if (err instanceof ApolloValidationError) {
    return handleApolloValidationError(err)
  }
  // joi validation error
  if (err.originalError instanceof JoiValidationError) {
    return handleJoiValidationError(err)
  }

  // format other errors

  // default format
  return err
}
