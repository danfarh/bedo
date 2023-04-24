import { Types } from 'mongoose'
import service from './service'

export default new (class Controller {
  async getAll() {
    return service.find()
  }

  async log(log: String, when: String) {
    return service.create({ log, when })
  }
})()
