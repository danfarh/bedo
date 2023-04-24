"use strict";
exports.__esModule = true;
var ACCOUNT_SID = 'ACfd4dc628a689124a55760cfd5aca5bbe';
var AUTH_TOKEN = 'c88ed27dd80bf098cc027dcf50aed824';
var client = require('twilio')(ACCOUNT_SID, AUTH_TOKEN);
function formatPhoneNumber(phoneNumber) {
    return phoneNumber.replace(/^00/, '+');
}
client.proxy.services('KS9945492d9e0f4544ed350984fd701317')
    .sessions
    .create({ ttl: 5000 })
    .then(function (session) { return console.log(session.ttl); })["catch"](function (e) { return console.log(e); });
