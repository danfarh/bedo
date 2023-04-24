import * as rules from '../rules'

const permissions = {
  Query: {
    getRegions: rules.isAdmin,
    getRegionsCount: rules.isAdmin
  },
  Mutation: {
    addRegion: rules.isAdmin,
    updateRegion: rules.isAdmin,
    removeRegion: rules.isAdmin
  }
}

export default permissions
