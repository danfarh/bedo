import * as rules from '../rules'

const permissions = {
  Query: {
    getShopReceipt: rules.isUser,
    getShopReceiptByOrderId: rules.isUser
  }
}

export default permissions
