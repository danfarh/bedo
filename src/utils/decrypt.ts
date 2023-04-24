import CryptoJS from 'crypto-js'
import { ENCRYPT_SECRET_KEY } from '../config'

export default function decrypt(encryptedValue: String) {
  const bytes = CryptoJS.AES.decrypt(String(encryptedValue), ENCRYPT_SECRET_KEY)
  const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
  return decryptedData
}
