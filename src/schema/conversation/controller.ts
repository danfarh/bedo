/* eslint-disable indent */
import { ApolloError } from 'apollo-server-express'
import moment from 'moment'
import service from './service'
import controllerBase from '../../utils/controllerBase'
import driverOrPassengerFilters from '../../utils/driverOrPassengerFilters'
import messageService from '../message/service'
import messageController from '../message/controller'
import driverService from '../driver/service'
import userService from '../user/service'
import shopService from '../shop/service'
import tripService from '../trip/service'
import orderService from '../order/service'

export default new (class Controller extends controllerBase {
  async closeOldConversations(user, customFilters = {}) {
    return service.updateMany(
      {
        updatedAt: { $lt: moment().subtract(2, 'days') },
        closed: false,
        $or: [{ user: user.sub }, { admin: user.sub }, { driver: user.sub }, { shop: user.shop }],
        ...customFilters
      },
      {
        closed: true
      }
    )
  }

  async createConversationAndSendMessage(user, inputs, recipient) {
    const { sub, roles }: any = user
    let recipientRoleUnreadCount: any
    const senderRole = roles.toLowerCase().includes('admin') ? 'admin' : roles.toLowerCase()
    if (inputs.messageType === 'Object' && typeof JSON.parse(inputs.messageText) !== 'object') {
      throw new ApolloError('message type is set to "Object" but an Object is not sent', '400')
    }
    let recipientRole = recipient.role.toLowerCase()
    let dbRecipient
    if (!inputs.conversationCategory.toLowerCase().includes('support')) {
      if (recipientRole === 'driver' && recipientRole !== senderRole) {
        dbRecipient = await driverService.findById(recipient._id)
      } else if (recipientRole === 'user' && recipientRole !== senderRole) {
        dbRecipient = await userService.findById(recipient._id)
      } else if (
        recipientRole !== senderRole &&
        (recipientRole === 'grocery' || recipientRole === 'food')
      ) {
        dbRecipient = await shopService.findById(recipient._id)
      } else {
        throw new ApolloError('you can not start non support conversation with admin')
      }
    }

    if (inputs.trip) {
      if (roles === 'USER') {
        const trip: any = await tripService.findOne({ _id: inputs.trip, passenger: user.userId })
        if (!trip) {
          throw new ApolloError('trips does not exists', '400')
        }
      } else if (roles === 'DRIVER') {
        const trip: any = await tripService.findOne({ _id: inputs.trip, driver: user.userId })
        if (!trip) {
          throw new ApolloError('trip does not exists', '400')
        }
      }
    }
    if (inputs.order) {
      if (roles === 'USER') {
        const order: any = await orderService.findOne({ _id: inputs.order, user: user.userId })
        if (!order) {
          throw new ApolloError('order does not exists', '400')
        }
      }
    }

    if (['driver', 'user', 'food', 'grocery'].includes(recipientRole) && !dbRecipient) {
      throw new ApolloError('recipient not found', '400')
    }

    // if (inputs.messageType === 'Upload') {
    //   const upload = await uploadService.findById(inputs.messageUpload)
    //   if (!upload) {
    //     throw new ApolloError('upload not exists', '400')
    //   }
    // } else
    if (!inputs.messageText) {
      throw new ApolloError('text of message can not be empty', '400')
    }

    if (recipientRole === 'food' || recipientRole === 'grocery') {
      recipientRoleUnreadCount = 'adminUnreadCount'
      recipientRole = 'shop'
    } else {
      recipientRoleUnreadCount = `${recipientRole}UnreadCount`
    }

    const newConversation = await service.createConversation({
      title: inputs.conversationTitle,
      conversationCategory: inputs.conversationCategory,
      [senderRole]: sub,
      [recipientRole]: recipient._id,
      conversationType: inputs.conversationType,
      [`${senderRole}UnreadCount`]: 0,
      [recipientRoleUnreadCount]: 1,
      trip: inputs.trip ? inputs.trip : null,
      order: inputs.order ? inputs.order : null,
      shop:
        inputs.conversationType === 'SHOP_SUPPORT'
          ? (await shopService.findOne({ shopAdmin: recipient._id }))._id
          : null
    })

    await messageService.createMessage({
      messageType: inputs.messageType,
      text: inputs.messageText,
      // upload: inputs.messageUpload,
      conversation: newConversation._id,
      [senderRole]: sub,
      senderType: senderRole.toUpperCase().slice(0, 1) + senderRole.slice(1)
    })
    const to = this.findRecipientRole(newConversation, senderRole)
    console.log(to, senderRole)
    const { senderFullName } = await messageController.findSenderNameAndReceiverIdOfMessage(
      roles,
      newConversation,
      to
    )
    await messageController.sendNotificationToReceiverOfMessage(
      senderFullName,
      inputs.messageText,
      to,
      newConversation
    )

    return newConversation
  }

  findRecipientRole(messageConversation, senderRole) {
    let to: any
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
    } else {
      if (messageConversation.driver) to = 'driver'
      if (messageConversation.user) to = 'user'
    }
    return to
  }

  async getConversationForUser(id, user) {
    await this.closeOldConversations(user, {
      _id: id
    })
    let authFilters: any = {
      $or: [{ user: user.userId }, { driver: user.userId }]
    }
    if (user.roles === 'SUPER_ADMIN') {
      authFilters = {}
    }
    if (user.roles === 'SHOP_ADMIN') {
      authFilters = {
        $or: [{ admin: user.userId }, { shop: user.shop }]
      }
    }
    return service.findOne({
      ...authFilters,
      _id: id
    })
  }

  async getConversation(id, user) {
    const conversation = await this.getConversationForUser(id, user)
    if (!conversation) {
      throw new ApolloError('your conversation does not exists', '400')
    }
    return conversation
  }

  async closeConversation(id, user) {
    let authFilters: any = {
      $or: [{ user: user.sub }, { driver: user.sub }]
    }
    if (user.roles === 'SUPER_ADMIN') {
      authFilters = {}
    }
    if (user.roles === 'SHOP_ADMIN') {
      authFilters = { $or: [{ admin: user.userId }, { shop: user.shop }] }
    }
    const conversation: any = await service.findOneAndUpdate(
      {
        ...authFilters,
        _id: id
      },
      {
        closed: true
      }
    )
    if (!conversation) {
      throw new ApolloError('your conversation does not exists', '400')
    }
    return conversation
  }

  async getConversations(
    conversationQuery: any = {},
    pagination,
    user,
    sort: any = { updatedAt: -1 }
  ) {
    await this.closeOldConversations(user)
    conversationQuery = await driverOrPassengerFilters(conversationQuery, true)
    if ('title' in conversationQuery) {
      // eslint-disable-next-line no-param-reassign
      conversationQuery.title = new RegExp(conversationQuery.title, 'gi')
    }

    if ('createdAt' in conversationQuery && 'createdAtFrom' in conversationQuery) {
      conversationQuery.createdAt = {
        $gte: moment(new Date(conversationQuery.createdAtFrom))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(conversationQuery.createdAt))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete conversationQuery.createdAtFrom
    } else if ('createdAtFrom' in conversationQuery) {
      conversationQuery.createdAt = {
        $gte: moment(new Date(conversationQuery.createdAtFrom))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete conversationQuery.createdAtFrom
    } else if ('createdAt' in conversationQuery) {
      conversationQuery.createdAt = {
        $lte: moment(new Date(conversationQuery.createdAt))
          .utc()
          .startOf('date')
          .toDate()
      }
    }
    if ('updatedAt' in conversationQuery) {
      // eslint-disable-next-line no-param-reassign
      conversationQuery.updatedAt = {
        $gte: moment(new Date(conversationQuery.updatedAt))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(conversationQuery.updatedAt))
          .utc()
          .endOf('date')
          .toDate()
      }
    }

    const { roles, sub } = user
    if (roles === 'USER') {
      return service.find({ ...conversationQuery, user: sub }, pagination, sort)
    }
    if (roles === 'DRIVER') {
      return service.find({ ...conversationQuery, driver: sub }, pagination, sort)
    }

    if (roles === 'SUPER_ADMIN') {
      return service.find({ ...conversationQuery }, pagination, sort)
    }

    return service.find(
      {
        ...conversationQuery,
        $or: [{ shop: user.shop }, { admin: user.userId }]
      },
      pagination,
      sort
    )
  }

  async getConversationsCount(conversationQuery: any = {}, user: any) {
    const { roles, userId }: any = user
    conversationQuery = await driverOrPassengerFilters(conversationQuery, true)
    if ('title' in conversationQuery) {
      // eslint-disable-next-line no-param-reassign
      conversationQuery.title = new RegExp(conversationQuery.title, 'gi')
    }

    if ('createdAt' in conversationQuery && 'createdAtFrom' in conversationQuery) {
      conversationQuery.createdAt = {
        $gte: moment(new Date(conversationQuery.createdAtFrom))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(conversationQuery.createdAt))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete conversationQuery.createdAtFrom
    } else if ('createdAtFrom' in conversationQuery) {
      conversationQuery.createdAt = {
        $gte: moment(new Date(conversationQuery.createdAtFrom))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete conversationQuery.createdAtFrom
    } else if ('createdAt' in conversationQuery) {
      conversationQuery.createdAt = {
        $lte: moment(new Date(conversationQuery.createdAt))
          .utc()
          .startOf('date')
          .toDate()
      }
    }
    if ('updatedAt' in conversationQuery) {
      // eslint-disable-next-line no-param-reassign
      conversationQuery.updatedAt = {
        $gte: moment(new Date(conversationQuery.updatedAt))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(conversationQuery.updatedAt))
          .utc()
          .endOf('date')
          .toDate()
      }
    }
    if (roles === 'USER') {
      return service.count({ ...conversationQuery, user: userId })
    }
    if (roles === 'DRIVER') {
      return service.count({ ...conversationQuery, driver: userId })
    }

    if (roles === 'SUPER_ADMIN') {
      return service.count({ ...conversationQuery })
    }

    return service.count({
      ...conversationQuery,
      $or: [{ shop: user.shop }, { admin: userId }]
    })
  }

  async makeUnreadMessagesZero(id, user) {
    const conversation = await this.getConversationForUser(id, user)
    if (!conversation) {
      throw new ApolloError('your conversation does not exists', '400')
    }

    if (user.roles === 'SUPER_ADMIN') {
      return service.findOneAndUpdate(id, { adminUnreadCount: 0 })
    }
    if (user.roles === 'SHOP_ADMIN') {
      return service.findOneAndUpdate(id, { adminUnreadCount: 0 })
    }

    if (!conversation[user.roles.toLowerCase()]) {
      throw new ApolloError('this conversation not belongs to you')
    }

    return service.findOneAndUpdate(id, { [`${user.roles.toLowerCase()}UnreadCount`]: 0 })
  }

  async updateConversation(_id, user, inputs) {
    const conversation: any = await service.findById(_id)
    if (!conversation) {
      throw new ApolloError('your conversation does not exists', '400')
    }
    return service.findOneAndUpdate(_id, inputs)
  }
})(service)
