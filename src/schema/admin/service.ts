// database request
import { Types } from 'mongoose'
import bcrypt from 'bcryptjs'
import Admin from './schema'
import { HASH_SALT } from '../../config'
import ServiceBase from '../../utils/serviceBase'
import { Pagination } from '../../utils/interfaces'

export default new (class service extends ServiceBase {
  async find(
    filters: Object = {},
    pagination: Pagination = {
      skip: 0,
      limit: 15
    },
    sort: Object = { createdAt: -1 }
  ): Promise<Array<any>> {
    return this.model
      .find({ ...filters, isDeleted: false })
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
  }

  async findOne(filters: String | Types.ObjectId | Object): Promise<any> {
    if (typeof filters === 'string' || filters instanceof Types.ObjectId) {
      // eslint-disable-next-line no-param-reassign
      filters = {
        _id: filters
      }
    }
    return this.model.findOne({ ...filters, isDeleted: false })
  }

  async changePassword(value: String, password: String, type: String) {
    console.log(value, type, password)
    const passwordHash = await bcrypt.hash(String(password), HASH_SALT)
    if (type === 'phoneNumber') {
      const admin = await Admin.findOneAndUpdate(
        { phoneNumber: value },
        {
          $set: { passwordHash }
        },
        {
          new: true
        }
      ).exec()
      return admin
    }
    const admin = await Admin.findOneAndUpdate(
      { email: value },
      {
        $set: { passwordHash }
      },
      {
        new: true
      }
    ).exec()
    return admin
  }

  async count(filters: Object = {}): Promise<number> {
    return this.model.countDocuments({ ...filters, isDeleted: false })
  }

  async findById(_id) {
    return this.findOne({ _id })
  }

  async findOneByPhoneNumber(phoneNumber: String) {
    const admin = await Admin.findOne({ phoneNumber, isDeleted: false }).exec()
    return admin
  }

  async findByEmail(email: String) {
    const admin = await Admin.findOne({
      email: String(email).toLowerCase(),
      isDeleted: false
    }).exec()
    return admin
  }
})(Admin)
