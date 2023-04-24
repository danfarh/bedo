import * as rules from '../rules'

export default {
  Query: {
    getSingleAdvertisement: rules.isAuthenticated,
    getAdvertisements: rules.isAuthenticated,
    getSingleAdvertisementByAdmin: rules.isAdmin,
    getAdvertisementsByAdmin: rules.isAdmin
  },
  Mutation: {
    createAdvertisementByAdmin: rules.isAdmin,
    updateAdvertisementByAdmin: rules.isAdmin,
    removeAdvertisementByAdmin: rules.isAdmin
  }
}
