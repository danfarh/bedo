/* eslint-disable dot-notation */
import express from 'express'
import http from 'http'
import path from 'path'
import fs from 'fs'
import * as bodyParser from 'body-parser'
import { ApolloServer, makeExecutableSchema } from 'apollo-server-express'
import { applyMiddleware } from 'graphql-middleware'
import cors from 'cors'
import mongoose from 'mongoose'
import mongoConnected, { dropViews } from './src/internal/connection'
import initDatabaseData from './src/utils/initDatabaseData'
import { PORT, DEFAULT_LANGUAGE, MONGO_CONNECTION_URI_LOCAL } from './src/config'
import authenticate from './src/utils/getUserId'
import startAgenda from './src/utils/schedule/agenda'
import { typeDefs, resolvers } from './src/schema'
import Permission from './src/utils/permissions/permissions'
import log from './src/utils/logger'
import Calc from './src/utils/calculation'
import { RedisDelete } from './src/utils/redis'
import errorFormatter from './src/utils/errorFormatter'
// import Permission from './src/permission';
// import getUserIdBySub from './src/utils/getUserIdBySub'
// import Permission from './src/permission';
import getUserIdBySub from './src/utils/getUserIdBySub'
// import fs from "fs"
// import morgan from 'morgan'
import driverController from './src/schema/driver/controller'
import seedAllModels from './src/utils/seedAllModels'
import seedShopModels from './src/utils/seedShopModels'
import tripController from './src/schema/trip/controller'
import logController from './src/schema/log/controller'
import userTokenController from './src/schema/userToken/controller'
import payment from './src/utils/payment/payment'
import webHooks from './src/utils/payment/webHooks'
import addPermissionToDb from './src/utils/addPermissions'
import sendHtmlContentEmail from './src/utils/htmlContentEmail'
import User from './src/schema/user/schema'
import UserService from './src/schema/user/service'
import errorsKeys from './src/schema/errors/errors'
import errorSchema from './src/schema/errors/schema'

mongoConnected()
Calc.insertConstantsToRedis()
Calc.insertReqCarTypesToRedis()
Calc.insertParcelConstantsToRedis()
// var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
// Create a new express application instance
const app = express()
app.use(cors())
app.use(webHooks)
app.use(bodyParser.json({ limit: '10mb' }))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
app.get('/public/files/:folderName/:fileName', (req, res) => {
  res.sendFile(`./public/files/${req.params.folderName}/${req.params.fileName}`, {
    root: __dirname
  })
})

app.get('/version', async (req, res) => {
  res.send({ ok: true, type: 'stage', version: '1.0.0' })
})

if (['development', 'local'].includes(process.env.APP_ENV || '')) {
  app.get('/logs', async (req, res) => {
    const logs = await logController.getAll()
    res.send(logs)
  })

  app.get('/users', async (req, res) => {
    const users2 = User.find({}).exec(function(error, users) {
      res.send({ users, error })
    })
  })
  app.get('/seed/shop/:count?', async (req, res) => {
    await seedShopModels(Number(req.params.count || 1), req.query)
    res.send('seeded')
  })
  app.get('/seed/:count?', async (req, res) => {
    await seedAllModels(Number(req.params.count || 1), req.query)
    res.send('seeded')
  })
  app.get('/api/v1/dropViews', (req, res) => {
    dropViews()
    res.send('Views dropped successfully')
  })
  app.get('/dropDB', async (req, res) => {
    mongoose.connect(MONGO_CONNECTION_URI_LOCAL, function() {
      /* Drop the DB */
      mongoose.connection.db.dropDatabase()
    })
    res.send('db dropped')
  })
}
app.get('/api/v1/initdb', async (req, res) => {
  await initDatabaseData()
  res.send('done')
})
// seed all multilanguage errors
app.get('/api/seedAllErrors', async (req, res) => {
  await errorSchema.deleteMany({})
  for (let i = 0; i < errorsKeys.length; i += 1) {
    errorSchema.create(errorsKeys[i])
  }
  res.send('done')
})
// agenda
startAgenda()
// payment routes
app.use(payment)

// email verification route
app.get('/api/v1/email/verify/:verificationCode', async (req: any, res) => {
  const result: any = await userTokenController.emailVerification(req.params.verificationCode)
  if (result && result === 'USER') {
    return res.redirect('bedo://verifyEmail/success/')
  }
  if (result && result === 'DRIVER') {
    return res.redirect('bedoDriver://verifyEmail/success/')
  }
  return res.send(
    `You requested a new email verification code,
     this code is invalid now,
     please check your email or request a new one`
  )
})

// app.use(morgan('combined', { stream: accessLogStream }))
// app.get('/', function (req: any, res: any) {
//     res.send('Hello World!');
// });
const schema = applyMiddleware(
  makeExecutableSchema({
    typeDefs,
    resolvers
  }),
  Permission
)

// create apollo server
const server = new ApolloServer({
  schema,

  // middleware: [Permission],
  introspection: true,
  playground: true,
  uploads: {
    // Limits here should be stricter than config for surrounding
    // infrastructure such as Nginx so errors can be handled elegantly by
    // graphql-upload:
    // https://github.com/jaydenseric/graphql-upload#type-uploadoptions
    maxFileSize: 10000000, // 10 MB
    maxFiles: 50
  },
  subscriptions: {
    onConnect: (connectionParams, webSocket) => {
      console.log('connected')
      const authHeader = connectionParams['authorization']

      if (authHeader) {
        const user = getUserIdBySub(authHeader)
        return { user }
      }
    },
    onDisconnect: async (webSocket, context) => {
      console.log('onDisconnect')
      const data: any = await context.initPromise
      if (data) {
        const { user } = data
        if (user && user.roles === 'DRIVER') {
          console.log('  user: ', user.userId)
          Promise.all([
            driverController.setWorkDriverStatus(user.userId, 'INACTIVE'),
            tripController.setOfflineCar(user.userId)
          ])
        }
      }
    }
  },
  formatError: errorFormatter,
  context: ctx => {
    if (ctx.connection) {
      return {
        user: ctx.connection.context.user
      }
    }
    const language = ctx.req.headers.lang || String(DEFAULT_LANGUAGE).toLocaleLowerCase()
    const token = ctx.req.headers.authorization || ''
    const user = authenticate(token)
    return { user, language }
  }
})
// add app as apollo server middleware
server.applyMiddleware({ app }) // set /graphql router
// server.applyMiddleware({ Permission })
const httpServer = http.createServer(app)
server.installSubscriptionHandlers(httpServer)
httpServer.listen(PORT, () => {
  RedisDelete('constants')
  RedisDelete('reqCarTypes')
  RedisDelete('parcelConstants')
  addPermissionToDb(schema)
  log('🚀  server running on port', PORT)
  console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}${server.subscriptionsPath}`)
})
// if (!fs.existsSync('static')) {
//     fs.mkdirSync('static');
// }
// if (!fs.existsSync('static/profile')) {
//     fs.mkdirSync('static/profile');
// }
// if (!fs.existsSync('static/list')) {
//     fs.mkdirSync('static/list');
// }
