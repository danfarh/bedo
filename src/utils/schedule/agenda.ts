import Agenda from 'agenda'
import moment from 'moment'
import transactionController from '../../schema/transaction/controller'
import logController from '../../schema/log/controller'
import {
  MONGO_CONNECTION_TYPE,
  MONGO_CONNECTION_URI_LOCAL,
  MONGO_CONNECTION_URI
} from '../../config'
const canada = 'America/Toronto'
export default async function startAgenda() {
  //! connect to mongodb
  let URL
  if (MONGO_CONNECTION_TYPE === 'local') {
    URL = MONGO_CONNECTION_URI_LOCAL
  }
  const agenda = await new Agenda({
    db: {
      address: URL || MONGO_CONNECTION_URI,
      collection: 'agendaJobs'
    }
  })

  //! define jobs
  agenda.define('payShopsPayments', async job => {
    const success = await transactionController.payShopPayments()
    const now = moment().format('DD hh:mm:ss')
    if (success) {
      await logController.log('pay shops Payments success', now)
    } else {
      await logController.log('pay shops Payments fail', now)
    }
  })

  await agenda.define('payDriversPayments', async job => {
    const success = await transactionController.payDriverPayments()
    const now = moment().format('DD hh:mm:ss')
    if (success) {
      await logController.log('pay Drivers Payments success', now)
    } else {
      await logController.log('pay Drivers Payments fail', now)
    }
  })

  //! start agenda
  // await agenda.purge()
  await agenda.start()
  // agenda.every('15 minutes', 'payShopsPayments')
  // agenda.every('15 minutes', 'payDriversPayments')
  agenda.every('3 hours', 'payShopsPayments')
  agenda.every('3 hours', 'payDriversPayments')
}
