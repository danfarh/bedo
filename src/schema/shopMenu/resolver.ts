import controller from './controller'
import ResolverBase from '../../utils/resolverBase'
import productService from '../product/service'
import productAdminController from '../product/adminController'
import adminController from './adminController'

const resolverBase = new ResolverBase(controller)

const resolver: any = {
  Query: {
    getShopMenu: resolverBase.query.get,
    getShopMenuByShopAdmin: (parent, { pagination }, { user }, info) => {
      return adminController.getShopMenuByShopAdmin(user, pagination)
    },
    getSubMenuProductsByShopAdmin: (parent, { subMenuId }, { user }, info) => {
      return adminController.getSubMenuProductsByShopAdmin(user, subMenuId)
    },
    getSubMenuProductsByAdmin: (parent, { shopId, subMenuId }, { user }, info) => {
      return adminController.getSubMenuProductsByAdmin(shopId, subMenuId)
    }
  },
  Mutation: {
    createShopMenuByAdmin(parent, { inputs }, { user }, info) {
      return adminController.createShopMenuByAdmin(inputs)
    },
    createSubMenuByAdmin(parent, { shopId, inputs }, { user }, info) {
      return adminController.createSubMenuByAdmin(shopId, inputs)
    },
    updateShopMenuByAdmin(parent, { _id, inputs }, { user }, info) {
      return adminController.updateShopMenuByAdmin(user, _id, inputs)
    },
    updateSubMenuByAdmin(parent, { shopId, subMenuId, inputs }, { user }, info) {
      return adminController.updateSubMenuByAdmin(shopId, subMenuId, inputs)
    },
    removeShopMenuProductByAdmin(parent, { inputs }, { user }, info) {
      return adminController.removeShopMenuProductByAdmin(inputs)
    },
    removeShopMenuItemsByAdmin(parent, { inputs }, { user }, info) {
      return adminController.removeShopMenuItemsByAdmin(inputs)
    },
    createShopMenuByShopAdmin(parent, { inputs }, { user }, info) {
      return adminController.createShopMenuByShopAdmin(user, inputs)
    },
    createSubMenuByShopAdmin(parent, { inputs }, { user }, info) {
      return adminController.createSubMenuByShopAdmin(user, inputs)
    },
    updateShopMenuByShopAdmin(parent, { inputs }, { user }, info) {
      return adminController.updateShopMenuByShopAdmin(user, inputs)
    },
    updateSubMenuByShopAdmin(parent, { subMenuId, inputs }, { user }, info) {
      return adminController.updateSubMenuByShopAdmin(user, subMenuId, inputs)
    },
    removeShopMenuProductByShopAdmin(parent, { inputs }, { user }, info) {
      return adminController.removeShopMenuProductByShopAdmin(user, inputs)
    },
    removeShopMenuItemsByShopAdmin(parent, { menuId }, { user }, info) {
      return adminController.removeShopMenuItemsByShopAdmin(user, menuId)
    }
  },
  SubMenu: {
    products: async (parent, { filters, pagination, sort }, { user, language }, series) => {
      let { path } = series
      while (path.prev !== undefined) {
        path = path.prev
      }
      let result
      const origin = path.key
      if (origin === 'getShop' || origin === 'getShops' || origin === 'getShopMenu')
        result = await productService.findFromView(
          { _id: { $in: parent.products }, stock: { $gt: 0 }, ...filters },
          pagination,
          sort,
          language
        )
      else
        result = await productService.find(
          { _id: { $in: parent.products }, ...filters },
          pagination,
          sort
        )
      return Promise.all(
        result.map(async i => {
          return productService.fixProduct(i)
        })
      )
    }
  },
  MultiLanguageSubMenu: {
    products: async (parent, { filters, pagination, sort }) => {
      const result = await productService.find(
        { _id: { $in: parent.products }, ...filters },
        pagination,
        sort
      )
      return Promise.all(
        result.map(async i => {
          return productService.fixProduct(i)
        })
      )
    }
  }
}

export default resolver
