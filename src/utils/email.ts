import nodeMailer from 'nodemailer'
import {
  SPARK_EMAIL_USERNAME,
  SPARK_EMAIL_PASSWORD,
  SPARK_EMAIL_SERVICE,
  EMAIL_FROM,
  SPARK_EMAIL_HOST,
  SPARK_EMAIL_PORT
} from '../config'

export default function sendEmail(receiver: string, subject: string, text: string) {
  console.log(SPARK_EMAIL_USERNAME, SPARK_EMAIL_PASSWORD)
  const transporter = nodeMailer.createTransport({
    host: SPARK_EMAIL_HOST,
    port: SPARK_EMAIL_PORT,
    //service: SPARK_EMAIL_SERVICE,
    auth: {
      user: SPARK_EMAIL_USERNAME,
      pass: SPARK_EMAIL_PASSWORD
    }
  })

  const mailOptions = {
    to: receiver, // list of receivers
    from: EMAIL_FROM, // sender address
    subject, // Subject line
    text // plain text body
  }
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error, 'error')
    } else {
      console.log('Message %s sent: %s', info.messageId, info.response)
    }
  })
}
