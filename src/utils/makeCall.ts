import { Twilio } from 'twilio'
import { SMS_AUTH_TOKEN, SMS_ACCOUNT_SID } from '../config'

const client = require('twilio')(SMS_ACCOUNT_SID, SMS_AUTH_TOKEN)

export const makeEmergencyCall = tripId => {
  client.calls.create(
    {
      url: 'http://demo.twilio.com/docs/voice.xml',
      to: '+989196265366',
      from: '+12267731620'
    },
    (err, call) => {
      if (err) throw err
      console.log(call)
    }
  )
}

export default makeEmergencyCall
