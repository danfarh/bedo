import Message from './schema'
import serviceBase from '../../utils/serviceBase'

export default new (class service extends serviceBase {
  async createMessage(Data: Object) {
    const newMessage = await new Message(Data)
    await newMessage.save()
    return newMessage
  }
})(Message)
