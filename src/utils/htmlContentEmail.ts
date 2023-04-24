import nodeMailer from 'nodemailer'
import { ApolloError } from 'apollo-server-express'
import ejs from 'ejs'
import fs from 'fs'
import path from 'path'
import {
  SPARK_EMAIL_USERNAME,
  SPARK_EMAIL_PASSWORD,
  EMAIL_FROM,
  SPARK_EMAIL_HOST,
  SPARK_EMAIL_PORT,
  SPARK_EMAIL_SERVICE
} from '../config'

const templates = {}
const templatesDir = path.join(__dirname, '../../templates/emails/')
const templateFiles = fs.readdirSync(templatesDir)
templateFiles.forEach(i => {
  if (i.endsWith('ejs')) {
    const fileName = i.replace(/\.ejs$/, '')
    templates[fileName] = ejs.compile(fs.readFileSync(path.join(templatesDir, i), 'utf8'))
  }
})

export default async function sendHtmlContentEmail(
  to: string,
  subject: string,
  templateName: string,
  data = {},
  text = ''
) {
  console.log(
    'SPARK_EMAIL_USERNAME',
    'SPARK_EMAIL_PASSWORD :',
    SPARK_EMAIL_USERNAME,
    SPARK_EMAIL_PASSWORD
  )
  console.log(data)
  const transporter = nodeMailer.createTransport({
    host: SPARK_EMAIL_HOST,
    port: SPARK_EMAIL_PORT,
    service: SPARK_EMAIL_SERVICE,
    auth: {
      user: SPARK_EMAIL_USERNAME,
      pass: SPARK_EMAIL_PASSWORD
    }
  })
  const template = templates[templateName]
  if (!template) {
    throw new ApolloError(`${templateName} template not found`, '400')
  }
  const mailOptions = {
    to,
    from: EMAIL_FROM,
    subject,
    html: template(data),
    text
  }
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) return reject(error)
      return resolve(info)
    })
  })
}
