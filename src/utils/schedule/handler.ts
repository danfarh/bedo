import { MongoClient } from 'mongodb'
import {
  MONGO_CONNECTION_TYPE,
  MONGO_CONNECTION_URI_LOCAL,
  MONGO_CONNECTION_URI
} from '../../config'
//! connect to mongodb
export default async function updateAgenda() {
  let URL
  if (MONGO_CONNECTION_TYPE === 'local') {
    URL = MONGO_CONNECTION_URI_LOCAL
  }
  try {
    const db = await MongoClient.connect(URL || MONGO_CONNECTION_URI)
    const dbo = db.db('spark')
    const agenda = await dbo.collection('agendaJobs')
    const result = await agenda.find()
    return result
  } catch (err) {
    console.log('error in connecting mongodb ', err)
    return err
  }
}
