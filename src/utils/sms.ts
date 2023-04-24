// import { Twilio } from 'twilio'
// import { SMS_AUTH_TOKEN, SMS_ACCOUNT_SID, SMS_FROM } from '../config'

// function formatPhoneNumberForSms(phoneNumber) {
//   return phoneNumber.replace(/^00/, '+')
// }
// export default function sendSMS(to: string, body: string) {
//   new Twilio(SMS_ACCOUNT_SID, SMS_AUTH_TOKEN).messages
//     .create({
//       body,
//       from: SMS_FROM,
//       to: formatPhoneNumberForSms(to)
//     })
//     .then(message => console.log(message.sid))
//     .catch(e => console.log(e))
// }

import request from 'request'
import moment from 'moment'
import {
  SMS_OPERATION,
  SMS_LOGIN,
  SMS_PASSWORD,
  SMS_TITLE,
  SMS_ISBULK,
  SMS_API_URL
} from '../config'

export default function sendSMS(to: string, body: string) {
  console.log(body)
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<request>
<head>	
<operation>${SMS_OPERATION}</operation>	
<login>${SMS_LOGIN}</login>
<password>${SMS_PASSWORD}</password>
<title>${SMS_TITLE}</title>
<scheduled>${moment().format('YYYY-MM-DD hh:mm:ss')}</scheduled>
<isbulk>${SMS_ISBULK}</isbulk>
<controlid>${Math.random() * 1000000}</controlid>
</head>
<body>
<msisdn>${to}</msisdn>
<message>${body}</message>
</body>
</request>
  `

  request(
    {
      url: SMS_API_URL,
      method: 'POST',
      headers: {
        'content-type': 'application/xml'
      },
      body: xml
    },
    function(error, response, body) {
      if (error) console.log(`error : ${error}`)
      else console.log(`response : ${JSON.stringify(response)}`)
    }
  )
}
