import controller from './controller'
import ResolverBase from '../../utils/resolverBase'
import categoryService from '../category/service'
import adminService from '../admin/service'
import shopMenuService from '../shopMenu/service'
import productService from '../product/service'
import attributeService from '../attribute/service'

const resolverBase = new ResolverBase(controller)

const resolver: any = {
  Query: {
    getShops(parent, { pagination, filters, sort }, { user }, info) {
      // filters.verified = true
      return controller.index({ ...filters, verified: true, isDeleted: false }, pagination, sort)
    },
    getShop: resolverBase.query.get,
    getShopsCount: resolverBase.query.count,

    getSalaryByShopAdmin: (parent, { filters, sort, pagination }, { user }, info) => {
      return controller.getSalaryByShopAdmin(user, filters, sort, pagination)
    },
    getShopByShopAdmin: (parent, args, { user }, info) => {
      return controller.getShopByShopAdmin(user)
    },
    async getShopsByAdmin(parent, { filters, sort, pagination }, { user }, info) {
      return controller.getShopsByAdmin(filters, pagination, sort)
    },
    getShopsByAdminCount: (parent, { filters }, { user }, info) => {
      return controller.getShopsByAdminCount(filters)
    },
    getShopByAdmin: (parent, { id }, { user }, info) => {
      return controller.getShopByAdmin(id)
    },
    getLocationByAddress: (parent, { address }, { user }, info) => {
      return controller.getLocationByAddress(address)
    },
    checkIfUserIsInShopZone: (parent, { input }, { user }, info) => {
      return controller.checkIfUserIsInShopZone(input)
    },
    getSearchShops: async (parent, { filters, pagination }) => {
      return controller.getSearchShops(filters, pagination)
    },
    getSearchShopsCount: async (parent, { filters }) => {
      return controller.getSearchShopsCount(filters)
    },
    getShopDeliveryByShopAdmin: async (parent, args, { user }, info) => {
      return controller.getShopDeliveryByShopAdmin(user)
    }
  },
  Mutation: {
    updateShopByShopAdmin: (parent, { data }, { user }, info) => {
      return controller.updateShopByShopAdmin(data, user, null)
    },
    updateShopAfterRejectedByShopAdmin: (parent, { data }, { user }, info) => {
      return controller.updateShopByShopAdmin(data, user, 'AFTER_REJECTED')
    },
    createShopByShopAdmin: (parent, { shopData }, { user }, info) => {
      return controller.createShopByShopAdmin(user, shopData)
    },
    verifyShop: (parent, { id }, { user }, info) => {
      return controller.verifyShop(id)
    },
    rejectShopByAdmin: (parent, { id, rejectionMessage }, { user }, info) => {
      return controller.rejectShopByAdmin(id, rejectionMessage)
    },
    createShopByAdmin: (parent, { input, shopAdminId }, { user }, info) => {
      return controller.createShopByAdmin(input, shopAdminId)
    },
    deleteShopByAdmin(prent, { idSet }, { user }, info) {
      return controller.deleteShopByAdmin(idSet)
    }
  },
  Shop: {
    shopAdmin(parent, args, ctx, info) {
      return adminService.findById(parent.shopAdmin)
    },
    rootCategory(parent, args, { language }) {
      return categoryService.findOneFromView({ _id: parent.rootCategory }, language)
    },
    shopMenu(parent, args, ctx, info) {
      return shopMenuService.findById(parent.shopMenu)
    },
    attributes(parent, args, ctx, info) {
      return attributeService.find({ _id: { $in: parent.attributes } })
    },

    categories(parent, args, ctx, { language }) {
      return categoryService.find({ _id: { $in: parent.categories } }, language)
    }
  },
  ShopAttributesCount: {
    attribute(parent, args, ctx, info) {
      return attributeService.findOne({ _id: parent.attribute })
    }
  },
  MultiLanguageShop: {
    shopMenu(parent) {
      return shopMenuService.findById(parent.shopMenu)
    },
    rootCategory(parent, args, { language }) {
      return categoryService.findOneFromView({ _id: parent.rootCategory }, language)
    },
    categories(parent, args, ctx, { language }) {
      return categoryService.find({ _id: { $in: parent.categories } }, language)
    },
    shopAdmin(parent, args, ctx, info) {
      return adminService.findById(parent.shopAdmin)
    },
    attributes(parent, args, ctx, info) {
      return attributeService.find({ _id: { $in: parent.attributes } })
    }
  }
}

export default resolver
