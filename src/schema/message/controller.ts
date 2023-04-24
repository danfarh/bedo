/* eslint-disable no-case-declarations */
/* eslint-disable indent */

import { ApolloError } from 'apollo-server-express'
import service from './service'
import driverService from '../driver/service'
import userService from '../user/service'
import shopService from '../shop/service'
import controllerBase from '../../utils/controllerBase'
import {
  createNotificationAndSendToDriver,
  createNotificationAndSendToUser
} from '../../utils/createNotificationAndSend'
// import jwt from 'jsonwebtoken'
import conversationService from '../conversation/service'

export default new (class Controller extends controllerBase {
  async sendMessage(inputs: any, user: Object) {
    const { sub, roles, shop }: any = user

    const senderRole: string = roles.toLowerCase().includes('admin') ? 'admin' : roles.toLowerCase()

    const messageConversation: any = await conversationService.findOne({
      _id: inputs.conversation,
      ...(senderRole !== 'admin' ? { [senderRole]: sub } : {}),
      closed: false
    })
    if (!messageConversation) {
      throw new ApolloError('your conversation does not exists', '400')
    }
    if (roles === 'SHOP_ADMIN') {
      if (
        String(messageConversation.shop) !== String(shop) &&
        String(messageConversation.admin) !== String(sub)
      ) {
        throw new ApolloError('your conversation does not exists', '400')
      }
    }
    if (!inputs.text) {
      throw new ApolloError('text of message can not be empty', '400')
    }

    const newMessage = await service.createMessage({
      [senderRole]: sub,
      text: inputs.text,
      messageType: inputs.messageType,
      conversation: messageConversation._id,
      senderType: senderRole.toUpperCase().slice(0, 1) + senderRole.slice(1)
    })

    let to
    if (messageConversation.conversationCategory === 'MESSAGE') {
      if (
        messageConversation.conversationType === 'RIDE' ||
        messageConversation.conversationType === 'DELIVERY'
      ) {
        to = ['user', 'driver'].find(i => i !== senderRole)
      } else if (
        messageConversation.conversationType === 'FOOD' ||
        messageConversation.conversationType === 'GROCERY'
      ) {
        to = ['user', 'admin'].find(i => i !== senderRole)
      }
    } else if (
      messageConversation.conversationType === 'SUPPORT' &&
      (senderRole === 'user' || senderRole === 'driver')
    ) {
      to = 'admin'
    } else if (senderRole === 'admin') {
      if (messageConversation.driver) to = 'driver'
      if (messageConversation.user) to = 'user'
    }

    await conversationService.addUnreadMessage(messageConversation._id, to)

    if (senderRole === 'admin') {
      await conversationService.findOneAndUpdate(messageConversation._id, {
        repliedByAdmin: true
      })
    }

    const { senderFullName } = await this.findSenderNameAndReceiverIdOfMessage(
      roles,
      messageConversation,
      to
    )
    await this.sendNotificationToReceiverOfMessage(
      senderFullName,
      inputs.text,
      to,
      messageConversation
    )
    return newMessage
  }

  async findSenderNameAndReceiverIdOfMessage(roles, messageConversation, to) {
    let senderFullName: any
    let sender
    console.log(roles)
    // eslint-disable-next-line default-case
    switch (roles) {
      case 'USER':
        sender = await userService.findById(messageConversation.user)
        senderFullName = sender.fullName
        break
      case 'DRIVER':
        sender = await driverService.findById(messageConversation.driver)
        senderFullName = sender.fullName
        break
      case 'SHOP_ADMIN':
        sender = await shopService.findById(messageConversation.shop)
        senderFullName = sender.name
        break
      case 'SUPER_ADMIN':
        senderFullName = 'SUPPORT'
        break
    }
    return { senderFullName }
  }

  async sendNotificationToReceiverOfMessage(senderFullName, body: string, to, conversation) {
    let receiverId
    const notificationBody = body.length < 50 ? body : `${body.substring(0, 50)}...`
    if (to === 'driver' && conversation.driver) {
      receiverId = conversation.driver
      await createNotificationAndSendToDriver(
        conversation.driver,
        'GENERAL',
        senderFullName,
        notificationBody
      )
    }
    if (to === 'user' && conversation.user) {
      receiverId = conversation.user
      await createNotificationAndSendToUser(
        conversation.user,
        'GENERAL',
        senderFullName,
        notificationBody
      )
    }
    console.log({ senderFullName, receiverId, body, to })
  }

  async getMessages(user, filters, pagination) {
    const { userId } = user
    const { conversation }: any = filters
    if (user.roles !== 'SUPER_ADMIN' && user.roles !== 'SHOP_ADMIN') {
      const conversationExists = await conversationService.findOne({
        _id: conversation,
        $or: [{ user: userId }, { driver: userId }]
      })
      if (!conversationExists) {
        throw new ApolloError('this conversation does not belong to you', '400')
      }
      return this.index(
        user,
        {
          ...filters
        },
        pagination
      )
    }
    if (user.roles === 'SUPER_ADMIN') {
      return this.index(
        user,
        {
          ...filters
        },
        pagination
      )
    }
    const conversationExists = await conversationService.findOne({
      _id: conversation,
      $or: [{ admin: userId }, { shop: user.shop }]
    })
    if (!conversationExists) {
      throw new ApolloError('this conversation does not belong to you', '400')
    }
    return this.index(user, { ...filters }, pagination)
  }

  async getMessage(user, _id) {
    let { userId } = user
    if (user.roles === 'SUPER_ADMIN') {
      userId = null
    }
    return this.get(user, {
      _id,
      ...(userId
        ? {
            $or: [{ driver: userId }, { user: userId }, { admin: userId }]
          }
        : {})
    })
  }

  async getMessagesCount(user, filters: any = {}) {
    const { conversation }: any = filters
    const { userId } = user
    if (user.roles === 'SUPER_ADMIN') {
      return service.count({ ...filters })
    }
    if (conversation) {
      if (user.roles === 'USER' || user.roles === 'DRIVER') {
        const conversationExists = await conversationService.findOne({
          _id: conversation,
          $or: [{ user: userId }, { driver: userId }]
        })
        if (!conversationExists) {
          throw new ApolloError('this conversation does not belong to you', '400')
        }
        return service.count({ ...filters })
      }
      const conversationExists = await conversationService.findOne({
        _id: conversation,
        $or: [{ admin: userId }, { shop: user.shop }]
      })
      if (!conversationExists) {
        throw new ApolloError('this conversation does not belong to you', '400')
      }
      return service.count({
        ...filters
      })
    }
    return service.count({
      ...filters,
      $or: [{ driver: userId }, { user: userId }, { admin: userId }]
    })
  }

  async updateMessage(user, _id, inputs) {
    return this.update(user, _id, inputs)
  }

  async deleteMessage(user, _id) {
    return this.delete(user, _id)
  }
})(service)
