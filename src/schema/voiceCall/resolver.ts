import controller from './controller'

const resolver = {
  Mutation: {
    createCall: async (parent, { data }, { user }) => {
      console.log(data)
      const { tripId, destinationOrder, to } = data
      const result = await controller.createCall(tripId, destinationOrder, to)
      return result
    },
    createEmergencyCall: async (parent, { tripId }, { user }) => {
      const result = await controller.createEmergencyCall(tripId)
      return result
    }
  }
}

export default resolver
