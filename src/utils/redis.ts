import redis from 'redis'
import { Types } from 'mongoose'
import _ from 'lodash'
import flatter from 'flat'
import { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } from '../config'

export const client: any = redis.createClient({
  host: REDIS_HOST,
  port: REDIS_PORT,
  ...(REDIS_PASSWORD ? { password: REDIS_PASSWORD } : {})
})
export const subClient: any = redis.createClient({
  host: REDIS_HOST,
  port: REDIS_PORT,
  ...(REDIS_PASSWORD ? { password: REDIS_PASSWORD } : {})
})

export async function RedisGetKeys() {
  return new Promise((resolve, reject) => {
    client.keys('*', function(err, keys) {
      if (err) {
        reject(err)
      }
      resolve(keys)
    })
  })
}

export function RedisGet(key): Promise<string> {
  return new Promise((resolve, reject) => {
    client.get(String(key), function(err, res) {
      if (err) {
        reject(err)
      }
      resolve(res)
    })
  })
}
export function RedisDelete(key) {
  return new Promise((resolve, reject) => {
    client.del(String(key), function(err, res) {
      if (err) {
        reject(err)
      }
      resolve(res)
    })
  })
}
export function RedisSetExpireDate(key, value, expireDate) {
  return new Promise((resolve, reject) => {
    client.setex(String(key), expireDate, JSON.stringify(value), function(err, res) {
      if (err) {
        reject(err)
      }
      resolve(res)
    })
  })
}
export function setAngle(key, value) {
  return new Promise((resolve, reject) => {
    client.set(String(key), String(value), function(err, res) {
      if (err) {
        reject(err)
      }
      resolve(res)
    })
  })
}
export function RedisSet(key, value) {
  return new Promise((resolve, reject) => {
    client.set(String(key), JSON.stringify(value), function(err, res) {
      if (err) {
        reject(err)
      }
      resolve(res)
    })
  })
}
export function RedisPushList(list, value) {
  return new Promise((resolve, reject) => {
    client.rpush(String(list), JSON.stringify(value), function(err, res) {
      if (err) {
        reject(err)
      }
      resolve(res)
    })
  })
}
export function RedisGetListLastItem(list) {
  return new Promise((resolve, reject) => {
    client.lindex(String(list), -1, function(err, res) {
      if (err) {
        reject(err)
      }
      resolve(res)
    })
  })
}
export function RedisRemoveListLastItem(list) {
  return new Promise((resolve, reject) => {
    client.rpop(String(list), (err, res) => {
      if (err) {
        reject(err)
      }
      resolve(res)
    })
  })
}
export function RedisGetListAll(list) {
  return new Promise((resolve, reject) => {
    client.lrange(String(list), 0, -1, (err, res) => {
      if (err) {
        reject(err)
      }
      resolve(res)
    })
  })
}
export function getCarsAround(
  location: any,
  carType: Types.ObjectId,
  radius: number
): Promise<any> {
  return new Promise((resolve, reject) => {
    client.georadius(
      String(carType),
      location.long,
      location.lat,
      radius * 1000,
      'm',
      'WITHCOORD',
      // 'WITHDIST',
      'ASC',
      (err, res) => {
        if (err) {
          return reject(err)
        }
        return resolve(res)
      }
    )
  })
}

export function setOnlineCar(
  id: Types.ObjectId,
  long: number,
  lat: number,
  carType: Types.ObjectId
): Promise<number> {
  return new Promise((resolve, reject) => {
    client.geoadd(String(carType), long, lat, String(id), (err, res) => {
      if (err) {
        return reject(err)
      }
      return resolve(res)
    })
  })
}
export function setOfflineCar(id: Types.ObjectId, carType: Types.ObjectId) {
  RedisGetKeys()
  return new Promise((resolve, reject) => {
    client.zrem(String(carType), String(id), (err, res) => {
      console.log('redis set offline result', res)
      if (err) {
        return reject(err)
      }
      return resolve(res)
    })
  })
}
export function setExpireByKey(key: string, time: number) {
  return new Promise((resolve, reject) => {
    client.expire(key, time, (err, res) => {
      if (err) return reject(err)
      return resolve(res)
    })
  })
}

export function getCarLocation(carType: Types.ObjectId | String, carId: Types.ObjectId | String) {
  return new Promise((resolve, reject) => {
    client.geopos(String(carType), String(carId), (err, res) => {
      if (err) return reject(err)
      // returns [[long , lat]] (as number)
      return resolve(res.map(i => i.map(j => Number(j))))
    })
  })
}

export function RedisSetObject(key: String, value: Object) {
  return new Promise((resolve, reject) => {
    const objToArray: any[] = []

    const flattedValue = flatter(value, { maxDepth: 10 })
    const objKeys = Object.keys(flattedValue)
    const objValues = Object.values(flattedValue)

    for (let i = 0; i < objKeys.length; i++) {
      objToArray.push(objKeys[i], objValues[i])
    }
    client.hmset(String(key), objToArray, (err, res) => {
      if (err) {
        reject(err)
      }
      resolve(res)
    })
  })
}

export function RedisGetObject(key: String) {
  return new Promise((resolve, reject) => {
    client.hgetall(String(key), (err, res) => {
      if (err) {
        reject(err)
      }
      resolve(flatter.unflatten(res))
    })
  })
}

export async function RedisAddToSetWithExpTime(key, tripId, exp) {
  const setexResult = await client.setex(`${key}-${tripId}`, exp, String(tripId))
  const saddResult = await client.sadd(key, String(tripId))
  // return new Promise((resolve, reject) => {
  //   client.setex(`${key}-${tripId}`, exp, String(tripId), (errTwo, resTwo) => {
  //     if (errTwo) reject(errTwo)
  //     resolve(resTwo)
  //   })
  //   client.sadd(key, String(tripId), (errThree, resThree) => {
  //     if (errThree) reject(errThree)
  //     // resolve(resThree)
  //   })
  // })
}

export async function RedisRemoveFromSet(key, tripId) {
  const delResult = await client.del(`${key}-${tripId}`)
  const sremResult = await client.srem(key, String(tripId))
  // return new Promise((resolve, reject) => {
  //   client.srem(key, String(tripId), (err, res) => {
  //     if (err) reject(err)
  //     resolve(res)
  //   })
  // })
}

export async function RedisGetFromSet(key): Promise<any> {
  return new Promise((resolve, reject) => {
    client.smembers(key, (err, res) => {
      if (err) reject(err)
      resolve(res)
    })
  })
}

export async function updateTripsInRedis(key) {
  const currentTripsId = await RedisGetFromSet(key)
  const result = await Promise.all(
    currentTripsId.map(async tripId => {
      const promise = new Promise((resolve, reject) => {
        client.get(`${key}-${tripId}`, (errOne, resOne) => {
          if (errOne) reject(errOne)
          resolve(resOne)
        })
      }).then(availableTrip => {
        if (!availableTrip) {
          const result = new Promise((resolve, reject) => {
            client.srem(key, String(tripId), (errTwo, resTwo) => {
              if (errTwo) reject(errTwo)
              resolve(resTwo)
            })
          })
        }
      })
      return promise
    })
  )
  return result
  // const availableTripsId = await Promise.all(
  //   currentTripsId.map(async tripId => {
  //     const state = new Promise((resolve, reject) => {
  //       client.get(`${key}-${tripId}`, (err, res) => {
  //         if (err) reject(err)
  //         resolve(res)
  //       })
  //     })
  //     return state
  //   })
  // )
  // _.remove(availableTripsId, o => o === null)
  // function getExpiredTrips (currentTripsId , availableTrips){
  // }
}

export async function getConstant(
  key: String
): Promise<{ attribute: String; value: String; typeOfAttribute: String }> {
  const constantsRaw: any = await RedisGetListAll('constants')
  const constants = constantsRaw.map(JSON.parse)
  return constants.find(i => i.attribute === key) || null
}

export async function getConstantValue(key: String, defaultValue: any = null): Promise<any> {
  const result = await getConstant(key)
  if (!result) {
    return defaultValue
  }
  const booleanType = result.value === 'true' ? true : result.value === 'false' ? false : null
  const formattedValue =
    result.typeOfAttribute === 'STRING'
      ? String(result.value)
      : result.typeOfAttribute === 'NUMBER'
      ? Number(result.value)
      : result.typeOfAttribute === 'BOOLEAN'
      ? booleanType
      : result.value
  return formattedValue == null ? defaultValue : formattedValue
}
