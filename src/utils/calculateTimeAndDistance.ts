import axios from 'axios'
import _ from 'lodash'
import { GOOGLE_API_KEY } from '../config'

export default async function(
  origin: { lat: Number; long: Number },
  destinations: { lat: Number; long: Number }[]
) {
  const dests: String[] = []
  // eslint-disable-next-line no-restricted-syntax
  for (const dest of destinations) {
    const d = `${dest.lat},${dest.long}`
    dests.push(d)
  }
  const locations = [`${origin.lat},${origin.long}`, ...dests]
  // const distances: any = []
  const distances = await Promise.all(
    locations.map(async (location, index) => {
      if (index != locations.length - 1) {
        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${
          locations[index]
        }&destinations=${locations[index + 1]}&key=${GOOGLE_API_KEY}`
        const res = (await axios.get(url)).data
        if (res.rows.length === 0) {
          throw new Error(res.error_message)
        }
        const [googleDistances] = res.rows[0].elements.map(el => {
          if (el.status === 'OK')
            return {
              distance: Number(el.distance.value) / 1000,
              duration: Math.ceil(Number(el.duration.value) / 60)
            }
          return null
        })
        console.log({
          origin: locations[index],
          destination: locations[index + 1],
          detail: googleDistances
        })
        return googleDistances
      }
      return null
    })
  )
  // remove the last element of distances array because it is always null
  // distances.pop()
  _.remove(distances, o => o === null)
  return distances
}
