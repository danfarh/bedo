import axios from 'axios'
import { GOOGLE_API_KEY } from '../config'

export default async function(Address: string) {
  const address = Address.replace(' ', '%20')
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${GOOGLE_API_KEY}`
  const res: any = await axios.get(url)
  if (res.data.results.length === 0) {
    throw new Error('cant find coordinates for this address')
  }
  const coords = res.data.results[0].geometry.location
  return { lat: coords.lat, long: coords.lng }
}
