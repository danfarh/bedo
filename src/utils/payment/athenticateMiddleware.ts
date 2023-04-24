import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../../config'

function authenticate(req, res, next) {
  let token = req.header('authorization') || ''
  token = token.replace('Bearer ', '')
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    res.status(401).send({ error: { raw: { message: err } } })
  }
}
export default authenticate
