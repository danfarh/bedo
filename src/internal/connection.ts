import mongoose from 'mongoose'

import {
  MONGO_CONNECTION_TYPE,
  MONGO_CONNECTION_URI_LOCAL,
  MONGO_CONNECTION_URI,
  DEFAULT_LANGUAGE,
  LANGUAGES_OF_APP
} from '../config'

const setListeners = () => {
  mongoose.connection.on('connecting', () => console.log('connection log: connecting to mongodb'))
  mongoose.connection.on('connected', () => console.log('connection log: connected to mongodb'))
  mongoose.connection.on('disconnecting', () =>
    console.log('connection log: disconnecting  from mongodb')
  )
  mongoose.connection.on('disconnected', () => {
    console.log('connection log: disconnected from mongodb')
    process.exit(3)
  })
  mongoose.connection.on('reconnected', () => console.log('connection log: reconnected to mongodb'))
  mongoose.connection.on('error', () => console.log('connection log: error on mongodb'))
}

function pipelineGenerator(fields: String[], language) {
  const pipeline: any = []
  fields.forEach(field => {
    pipeline.push([
      {
        $addFields: {
          temp: `$${field}`
        }
      },
      {
        $addFields: {
          [`${field}`]: {
            $filter: {
              input: '$temp',
              as: 'item',
              cond: { $eq: ['$$item.lang', language] }
            }
          }
        }
      },
      {
        $addFields: {
          [`${field}`]: {
            $cond: [
              { $ne: [`$${field}`, []] },
              `$${field}`,
              {
                $filter: {
                  input: '$temp',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.lang', DEFAULT_LANGUAGE]
                  }
                }
              }
            ]
          }
        }
      },
      {
        $unset: 'temp'
      },
      {
        $unwind: { path: `$${field}`, preserveNullAndEmptyArrays: true }
      },
      {
        $addFields: {
          [`${field}`]: `$${field}.value`
        }
      }
    ])
  })
  return pipeline.flat()
}

function shopMenuPipeLineGenerator(language) {
  const pipeline = [
    {
      $addFields: {
        temp: {
          $map: {
            input: '$subMenus',
            as: 'el',
            in: {
              name: '$$el.name',
              name_temp: {
                $filter: {
                  input: '$$el.name',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.lang', language]
                  }
                }
              },
              products: '$$el.products'
            }
          }
        }
      }
    },
    {
      $addFields: {
        temp: {
          $map: {
            input: '$temp',
            as: 'el',
            in: {
              name: {
                $cond: [
                  {
                    $ne: ['$$el.name_temp', []]
                  },
                  '$$el.name_temp',
                  {
                    $filter: {
                      input: '$$el.name',
                      as: 'item',
                      cond: {
                        $eq: ['$$item.lang', DEFAULT_LANGUAGE]
                      }
                    }
                  }
                ]
              },
              products: '$$el.products'
            }
          }
        }
      }
    },
    {
      $addFields: {
        temp2: {
          $map: {
            input: '$temp',
            as: 'el',
            in: {
              name: {
                $arrayElemAt: ['$$el.name.value', 0]
              },
              products: '$$el.products'
            }
          }
        }
      }
    },
    {
      $addFields: {
        subMenus: '$temp2'
      }
    },
    {
      $unset: 'temp'
    },
    {
      $unset: 'temp2'
    }
  ]
  return pipeline
}

export function createViews(fields, viewName) {
  LANGUAGES_OF_APP.forEach(async (language: String) => {
    await mongoose.connection.createCollection(`${viewName}-${language}`, {
      viewOn: `${viewName}`,
      pipeline: pipelineGenerator(fields, language)
    })
  })
}
export default function mongoConnected() {
  let uri

  if (MONGO_CONNECTION_TYPE === 'local') {
    uri = MONGO_CONNECTION_URI_LOCAL
  }
  mongoose
    .connect(uri || MONGO_CONNECTION_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true
      // authSource: 'admin'
    })
    .then(() => {
      console.log('connected to DB!')
    })
    .catch(err => {
      console.log(`Error connecting to DB:${err.message}`)
    })
  setListeners()
}

export function createShopMenuViews() {
  const viewName = 'shopmenus'
  LANGUAGES_OF_APP.forEach(async (language: String) => {
    await mongoose.connection.createCollection(`${viewName}-${language}`, {
      viewOn: `${viewName}`,
      pipeline: shopMenuPipeLineGenerator(language)
    })
  })
}

export async function dropViews() {
  mongoose.connection.db.listCollections().toArray((_, names) => {
    const views = names.filter(data => data.type === 'view').map(data => data.name)
    views.forEach(viewName => {
      mongoose.connection.dropCollection(viewName)
    })
  })
}
