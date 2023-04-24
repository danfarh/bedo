/* eslint-disable indent */
import Model from './schema'
import serviceBase from '../../utils/serviceBase'

export default new (class service extends serviceBase {
  async createConversation(Data: Object) {
    const newConversation: any = await new Model({ ...Data, closed: false })
    await newConversation.save()
    return newConversation
  }

  async addUnreadMessage(_id, to) {
    return Model.findOneAndUpdate(
      { _id },
      {
        ...(to
          ? {
              $inc: {
                [`${to}UnreadCount`]: 1
              }
            }
          : {})
      },
      {
        new: true
      }
    )
  }

  async update(_id, Data: Object) {
    return Model.findOneAndUpdate({ _id }, Data, { new: true })
  }

  async updateMany(filters, data) {
    return Model.updateMany(filters, data)
  }
})(Model)
