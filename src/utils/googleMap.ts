import googleMapModule from '@google/maps'
import { GOOGLE_API_KEY } from '../config'

console.log(GOOGLE_API_KEY)
if (!GOOGLE_API_KEY) {
  console.error('google api key is invalid')
}

const googleMapsClient = googleMapModule.createClient({
  key: GOOGLE_API_KEY,
  Promise
})

export default googleMapsClient
