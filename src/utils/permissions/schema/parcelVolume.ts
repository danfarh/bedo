import * as rules from '../rules'

const permissions = {
  Query: {
    getParcelVolumesByAdmin: rules.isAdmin,
    getParcelVolumes: rules.isAuthenticated,
    getParcelVolume: rules.isAuthenticated,
    getParcelVolumesCount: rules.isAuthenticated,
    getParcelVolumesByAdminCount: rules.isAdmin
  },
  Mutation: {
    createParcelVolumeByAdmin: rules.isAdmin,
    updateParcelVolumeByAdmin: rules.isAdmin,
    removeParcelVolumeByAdmin: rules.isAdmin
  }
}

export default permissions
