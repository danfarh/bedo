import { UserInputError, ApolloError } from 'apollo-server-express'

export default function returnErrorFields(error) {
  const errors: any = []
  error.details.map(element =>
    errors.push({ message: element.message, field: element.context.key })
  )
  throw new ApolloError('error messages', '403', errors)
}
