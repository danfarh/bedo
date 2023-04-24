import { Twilio } from 'twilio'
const ACCOUNT_SID = 'ACfd4dc628a689124a55760cfd5aca5bbe'
const AUTH_TOKEN = 'c88ed27dd80bf098cc027dcf50aed824'
const client = require('twilio')(ACCOUNT_SID, AUTH_TOKEN);
function formatPhoneNumber(phoneNumber) {
    return phoneNumber.replace(/^00/, '+')
  }

  client.proxy.services('KS9945492d9e0f4544ed350984fd701317')
  .sessions
  .create({ttl:5000})
  .then(session => console.log(session.ttl)).catch(e => console.log(e));