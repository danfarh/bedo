// database request
import Constant from './schema'
import ServiceBase from '../../utils/serviceBase'

export default new (class service extends ServiceBase {
  async findAll() {
    const result = await Constant.find().exec()
    return result
  }

  async save(attribute: String, value: String, typeOfAttribute: String) {
    const constant = new Constant({
      attribute,
      value,
      typeOfAttribute
    })
    await constant.save()
    return constant
  }

  // async findOneByPhoneNumber(phoneNumber: String) {
  //   const user = await User.findOne({ phoneNumber }).exec()
  //   return user
  // }

  // async findByEmail(email: String) {
  //   if (email === null || email === undefined) {
  //     return null
  //   }
  //   const user = await User.findOne({ email }).exec()
  //   return user
  // }

  // async changeUserPassword(phoneNumber: String, password: String) {
  //   const passwordHash = await bcrypt.hash(String(password), HASH_SALT)
  //   const user = await User.findOneAndUpdate(
  //     { phoneNumber },
  //     {
  //       $set: { passwordHash: passwordHash }
  //     },
  //     {
  //       new: true
  //     }
  //   ).exec()
  //   return user
  // }
})(Constant)
