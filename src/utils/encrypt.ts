import CryptoJS from 'crypto-js'
import { ENCRYPT_SECRET_KEY } from '../config'

export default function encrypt(data: Object) {
  const encryptedValue = CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPT_SECRET_KEY).toString()
  return encryptedValue
}
