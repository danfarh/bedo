import controller from './controller'
import adminController from './adminController'
import ResolverBase from '../../utils/resolverBase'
import shopService from '../shop/service'
import attributeGroupService from '../attributeGroup/service'
import attributeService from '../attribute/service'
import reqCarTypeService from '../reqCarType/service'

const resolverBase = new ResolverBase(controller)

const resolver = {
  Query: {
    getProduct: async (parent, { _id }, { language }) => {
      return controller.getProduct(_id, language)
    },
    getProducts: async (parent, { filters, pagination, sort }, { language }) => {
      return controller.getProducts(filters, pagination, sort, language)
    },
    getProductsCount: async (parent, { filters }, { language }) => {
      return controller.getProductsCount(filters, language)
    },
    getProductsByAdmin: async (parent, { filters, pagination, sort }) => {
      return adminController.getProductsByAdmin({ ...filters, isDeleted: false }, pagination, sort)
    },
    getProductByAdmin: async (parent, { _id }) => {
      return adminController.getProductByAdmin(_id)
    },
    getProductsByAdminCount: async (parent, { filters }) => {
      return adminController.getProductsByAdminCount(filters)
    },
    getProductsByShopAdmin: async (parent, { filters, pagination, sort }, { user }) => {
      return adminController.getProductsByShopAdmin(
        user.shop,
        { ...filters, isDeleted: false },
        pagination,
        sort
      )
    },
    getProductByShopAdmin: async (parent, { _id }, { user }) => {
      return adminController.getProductByShopAdmin(_id, user.shop)
    },
    getProductsByShopAdminCount: async (parent, { filters }, { user }) => {
      return adminController.getProductsByShopAdminCount(user.shop, filters)
    },
    getSearchProducts: async (parent, { filters, pagination, sort }, { language }) => {
      return controller.getSearchProducts(filters, pagination, sort, language)
    },
    getSearchProductsCount: async (parent, { filters }, { language }) => {
      return controller.getSearchProductsCount(filters, language)
    }
  },
  Mutation: {
    addProductViaExcel(parent, { input }, { user }, info) {
      return adminController.addProductViaExcel(input, user)
    },
    createProductByAdmin(parent, { input }, { user }, info) {
      return adminController.createProductByAdmin(user, input)
    },
    updateProductByAdmin(parent, { id, input }, { user }, info) {
      return adminController.updateProductByAdmin(user, id, input)
    },
    removeProductByAdmin(parent, { idSet }, { user }, info) {
      return adminController.removeProductByAdmin(user, idSet)
    },
    createProductByShopAdmin(parent, { input }, { user }, info) {
      return adminController.createProductByShopAdmin(user, input)
    },
    updateProductByShopAdmin(parent, { id, input }, { user }, info) {
      return adminController.updateProductByShopAdmin(user, id, input)
    },
    removeProductByShopAdmin(parent, { idSet }, { user }, info) {
      return adminController.removeProductByShopAdmin(user, idSet)
    }
  },
  Product: {
    shop(parent, args, ctx, info) {
      return shopService.findById(parent.shop)
    },
    reqCarTypes(parent, args, ctx, info) {
      return reqCarTypeService.find({ _id: { $in: parent.reqCarTypes } })
    }
  },
  AttributeItem: {
    attributeGroup(parent, args, ctx, info) {
      return attributeGroupService.findById(parent.attributeGroup)
    },
    att(parent, args, ctx, info) {
      return attributeService.find({ _id: { $in: parent.att } })
    }
  }
}

export default resolver
