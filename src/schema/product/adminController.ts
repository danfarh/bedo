/* eslint-disable no-plusplus */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import { Types } from 'mongoose'
import { ApolloError } from 'apollo-server-express'
import moment from 'moment'
import * as _ from 'lodash'
import decompress from 'decompress'
import xlsx from 'xlsx'
import fs from 'fs'
import path from 'path'
import rimraf from 'rimraf'
import mkdirp from 'mkdirp'
import Service from './service'
import controllerBase from '../../utils/controllerBase'
import CartModel from '../cart/schema'
import shopMenuService from '../shopMenu/service'
import shopService from '../shop/service'
import orderService from '../order/service'
import ProductModel from './schema'
import reqCarTypeService from '../reqCarType/service'
import uploadController from '../upload/controller'

export default new (class Controller extends controllerBase {
  async createProductByAdmin(user: Object, data: Object): Promise<any> {
    return Service.createProductByAdmin(user, data)
  }

  async updateProductByAdmin(
    user: Object,
    _id: String | Types.ObjectId,
    data: Object
  ): Promise<any> {
    return Service.updateProductByAdmin(user, _id, data)
  }

  async removeProductByAdmin(user: Object, idSet: Types.ObjectId[]): Promise<any> {
    return Service.removeProductByAdmin(user, idSet)
  }

  async createProductByShopAdmin(user: any, data: Object): Promise<any> {
    if (!user.shop) {
      throw new ApolloError('your shop does not exists')
    }
    return Service.createProductByShopAdmin(user, data)
  }

  async updateProductByShopAdmin(
    user: any,
    _id: String | Types.ObjectId,
    data: Object
  ): Promise<any> {
    if (!user.shop) {
      throw new ApolloError('your shop does not exists')
    }
    return Service.updateProductByShopAdmin(user, _id, data)
  }

  async removeProductByShopAdmin(user: any, idSet: Types.ObjectId[]): Promise<any> {
    if (!user.shop) {
      throw new ApolloError('your shop does not exists')
    }
    return Service.removeProductByShopAdmin(user, idSet)
  }

  async getProductSetByAdminWithoutPagination(filters) {
    return ProductModel.find({ ...filters, isDeleted: false })
  }

  async getProductsByAdmin(filters: any = {}, pagination = { skip: 0, limit: 15 }, sort) {
    if ('promotion' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['promotion.percent'] = filters.promotion
      // eslint-disable-next-line no-param-reassign
      filters = _.omit(filters, 'promotion')
    }
    if ('description' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['description.value'] = new RegExp(filters.description, 'gi')
      delete filters.description
    }
    if ('title' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['title.value'] = new RegExp(filters.title, 'gi')
      delete filters.title
    }
    if ('discountFrom' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['promotion.discountFrom'] = {
        $gte: moment(new Date(filters.discountFrom))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.discountFrom))
          .utc()
          .endOf('date')
          .toDate()
      }
      filters = _.omit(filters, 'discountFrom')
    }

    if ('discountTo' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['promotion.discountTo'] = {
        $gte: moment(new Date(filters.discountTo))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.discountTo))
          .utc()
          .endOf('date')
          .toDate()
      }
      filters = _.omit(filters, 'discountTo')
    }
    if ('price' in filters && 'priceFrom' in filters) {
      filters['productDetails.price'] = {
        $gte: filters.priceFrom,
        $lte: filters.price
      }
      delete filters.priceFrom
      delete filters.price
    } else if ('priceFrom' in filters) {
      filters['productDetails.price'] = {
        $gte: filters.priceFrom
      }
      delete filters.priceFrom
    } else if ('price' in filters) {
      filters['productDetails.price'] = {
        $lte: filters.price
      }
      delete filters.price
    }
    if ('stock' in filters && 'stockFrom' in filters) {
      filters['productDetails.stock'] = {
        $gte: filters.stockFrom,
        $lte: filters.stock
      }
      delete filters.stockFrom
      delete filters.stock
    } else if ('stockFrom' in filters) {
      filters['productDetails.stock'] = {
        $gte: filters.stockFrom
      }
      delete filters.stockFrom
    } else if ('stock' in filters) {
      filters['productDetails.stock'] = {
        $lte: filters.stock
      }
      delete filters.stock
    }
    if ('size' in filters) {
      if (filters.size === 'SMALL' || filters.size === 'MEDIUM' || filters.size === 'LARGE') {
        // eslint-disable-next-line no-param-reassign
        filters['productDetails.size'] = filters.size
      }
      delete filters.size
    }
    if ('createdAt' in filters && 'createdAtFrom' in filters) {
      filters.createdAt = {
        $gte: moment(new Date(filters.createdAtFrom))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.createdAt))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.createdAtFrom
    } else if ('createdAtFrom' in filters) {
      filters.createdAt = {
        $gte: moment(new Date(filters.createdAtFrom))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.createdAtFrom
    } else if ('createdAt' in filters) {
      filters.createdAt = {
        $lte: moment(new Date(filters.createdAt))
          .utc()
          .startOf('date')
          .toDate()
      }
    }
    if ('updatedAt' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.updatedAt = {
        $gte: moment(new Date(filters.updatedAt))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.updatedAt))
          .utc()
          .endOf('date')
          .toDate()
      }
    }
    if ('shopMenu' in filters) {
      const regex = new RegExp(`.*${filters.shopMenu}.*`)
      delete filters.shopMenu
      const products = await Service.find({ ...filters, isDeleted: false }, pagination, sort)

      return products.filter(element => regex.test(element.shopMenuName))
    }
    return Service.find({ ...filters, isDeleted: false }, pagination, sort)
    // .sort(sort)
    // .skip(pagination.skip)
    // .limit(pagination.limit)
  }

  async getProductByAdmin(_id) {
    return Service.findOne({ _id })
  }

  async getProductsByAdminCount(filters: any = {}) {
    if ('promotion' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['promotion.percent'] = filters.promotion
      // eslint-disable-next-line no-param-reassign
      filters = _.omit(filters, 'promotion')
    }
    if ('description' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['description.value'] = new RegExp(filters.description, 'gi')
      delete filters.description
    }
    if ('title' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['title.value'] = new RegExp(filters.title, 'gi')
      delete filters.title
    }
    if ('discountFrom' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['promotion.discountFrom'] = {
        $gte: moment(new Date(filters.discountFrom))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.discountFrom))
          .utc()
          .endOf('date')
          .toDate()
      }
      filters = _.omit(filters, 'discountFrom')
    }

    if ('discountTo' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['promotion.discountTo'] = {
        $gte: moment(new Date(filters.discountTo))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.discountTo))
          .utc()
          .endOf('date')
          .toDate()
      }
      filters = _.omit(filters, 'discountTo')
    }
    if ('price' in filters && 'priceFrom' in filters) {
      filters['productDetails.price'] = {
        $gte: filters.priceFrom,
        $lte: filters.price
      }
      delete filters.priceFrom
      delete filters.price
    } else if ('priceFrom' in filters) {
      filters['productDetails.price'] = {
        $gte: filters.priceFrom
      }
      delete filters.priceFrom
    } else if ('price' in filters) {
      filters['productDetails.price'] = {
        $lte: filters.price
      }
      delete filters.price
    }
    if ('stock' in filters && 'stockFrom' in filters) {
      filters['productDetails.stock'] = {
        $gte: filters.stockFrom,
        $lte: filters.stock
      }
      delete filters.stockFrom
      delete filters.stock
    } else if ('stockFrom' in filters) {
      filters['productDetails.stock'] = {
        $gte: filters.stockFrom
      }
      delete filters.stockFrom
    } else if ('stock' in filters) {
      filters['productDetails.stock'] = {
        $lte: filters.stock
      }
      delete filters.stock
    }
    if ('size' in filters) {
      if (filters.size === 'SMALL' || filters.size === 'MEDIUM' || filters.size === 'LARGE') {
        // eslint-disable-next-line no-param-reassign
        filters['productDetails.size'] = filters.size
      }
      delete filters.size
    }
    if ('createdAt' in filters && 'createdAtFrom' in filters) {
      filters.createdAt = {
        $gte: moment(new Date(filters.createdAtFrom))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.createdAt))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.createdAtFrom
    } else if ('createdAtFrom' in filters) {
      filters.createdAt = {
        $gte: moment(new Date(filters.createdAtFrom))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.createdAtFrom
    } else if ('createdAt' in filters) {
      filters.createdAt = {
        $lte: moment(new Date(filters.createdAt))
          .utc()
          .startOf('date')
          .toDate()
      }
    }
    if ('updatedAt' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.updatedAt = {
        $gte: moment(new Date(filters.updatedAt))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.updatedAt))
          .utc()
          .endOf('date')
          .toDate()
      }
    }
    return this.service.count(filters)
  }

  async getProductsByShopAdmin(
    shopId,
    filters: any = {},
    pagination = { skip: 0, limit: 15 },
    sort
  ) {
    if ('promotion' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['promotion.percent'] = filters.promotion
      // eslint-disable-next-line no-param-reassign
      filters = _.omit(filters, 'promotion')
    }
    if ('description' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['description.value'] = new RegExp(filters.description, 'gi')
      delete filters.description
    }
    if ('title' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['title.value'] = new RegExp(filters.title, 'gi')
      delete filters.title
    }
    if ('discountFrom' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['promotion.discountFrom'] = {
        $gte: moment(new Date(filters.discountFrom))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.discountFrom))
          .utc()
          .endOf('date')
          .toDate()
      }
      filters = _.omit(filters, 'discountFrom')
    }

    if ('discountTo' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['promotion.discountTo'] = {
        $gte: moment(new Date(filters.discountTo))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.discountTo))
          .utc()
          .endOf('date')
          .toDate()
      }
      filters = _.omit(filters, 'discountTo')
    }
    if ('price' in filters && 'priceFrom' in filters) {
      filters['productDetails.price'] = {
        $gte: filters.priceFrom,
        $lte: filters.price
      }
      delete filters.priceFrom
      delete filters.price
    } else if ('priceFrom' in filters) {
      filters['productDetails.price'] = {
        $gte: filters.priceFrom
      }
      delete filters.priceFrom
    } else if ('price' in filters) {
      filters['productDetails.price'] = {
        $lte: filters.price
      }
      delete filters.price
    }
    if ('stock' in filters && 'stockFrom' in filters) {
      filters['productDetails.stock'] = {
        $gte: filters.stockFrom,
        $lte: filters.stock
      }
      delete filters.stockFrom
      delete filters.stock
    } else if ('stockFrom' in filters) {
      filters['productDetails.stock'] = {
        $gte: filters.stockFrom
      }
      delete filters.stockFrom
    } else if ('stock' in filters) {
      filters['productDetails.stock'] = {
        $lte: filters.stock
      }
      delete filters.stock
    }
    if ('size' in filters) {
      if (filters.size === 'SMALL' || filters.size === 'MEDIUM' || filters.size === 'LARGE') {
        // eslint-disable-next-line no-param-reassign
        filters['productDetails.size'] = filters.size
      }
      delete filters.size
    }
    if ('createdAt' in filters && 'createdAtFrom' in filters) {
      filters.createdAt = {
        $gte: moment(new Date(filters.createdAtFrom))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.createdAt))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.createdAtFrom
    } else if ('createdAtFrom' in filters) {
      filters.createdAt = {
        $gte: moment(new Date(filters.createdAtFrom))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.createdAtFrom
    } else if ('createdAt' in filters) {
      filters.createdAt = {
        $lte: moment(new Date(filters.createdAt))
          .utc()
          .startOf('date')
          .toDate()
      }
    }
    if ('updatedAt' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.updatedAt = {
        $gte: moment(new Date(filters.updatedAt))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.updatedAt))
          .utc()
          .endOf('date')
          .toDate()
      }
    }
    if ('shopMenu' in filters) {
      const regex = new RegExp(`.*${filters.shopMenu}.*`)
      delete filters.shopMenu
      const products = await Service.find(
        { ...filters, isDeleted: false, shop: shopId },
        pagination,
        sort
      )
      return products.filter(element => regex.test(element.shopMenuName))
    }
    return Service.find({ ...filters, isDeleted: false, shop: shopId }, pagination, sort)

    // return this.service.find({ shop: shopId, ...filters }, pagination, sort)
  }

  async getProductsByShopAdminCount(shopId, filters: any = {}) {
    if ('promotion' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['promotion.percent'] = filters.promotion
      // eslint-disable-next-line no-param-reassign
      filters = _.omit(filters, 'promotion')
    }
    if ('description' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['description.value'] = new RegExp(filters.description, 'gi')
      delete filters.description
    }
    if ('title' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['title.value'] = new RegExp(filters.title, 'gi')
      delete filters.title
    }
    if ('discountFrom' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['promotion.discountFrom'] = {
        $gte: moment(new Date(filters.discountFrom))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.discountFrom))
          .utc()
          .endOf('date')
          .toDate()
      }
      filters = _.omit(filters, 'discountFrom')
    }

    if ('discountTo' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters['promotion.discountTo'] = {
        $gte: moment(new Date(filters.discountTo))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.discountTo))
          .utc()
          .endOf('date')
          .toDate()
      }
      filters = _.omit(filters, 'discountTo')
    }
    if ('price' in filters && 'priceFrom' in filters) {
      filters['productDetails.price'] = {
        $gte: filters.priceFrom,
        $lte: filters.price
      }
      delete filters.priceFrom
      delete filters.price
    } else if ('priceFrom' in filters) {
      filters['productDetails.price'] = {
        $gte: filters.priceFrom
      }
      delete filters.priceFrom
    } else if ('price' in filters) {
      filters['productDetails.price'] = {
        $lte: filters.price
      }
      delete filters.price
    }
    if ('stock' in filters && 'stockFrom' in filters) {
      filters['productDetails.stock'] = {
        $gte: filters.stockFrom,
        $lte: filters.stock
      }
      delete filters.stockFrom
      delete filters.stock
    } else if ('stockFrom' in filters) {
      filters['productDetails.stock'] = {
        $gte: filters.stockFrom
      }
      delete filters.stockFrom
    } else if ('stock' in filters) {
      filters['productDetails.stock'] = {
        $lte: filters.stock
      }
      delete filters.stock
    }
    if ('size' in filters) {
      if (filters.size === 'SMALL' || filters.size === 'MEDIUM' || filters.size === 'LARGE') {
        // eslint-disable-next-line no-param-reassign
        filters['productDetails.size'] = filters.size
      }
      delete filters.size
    }
    if ('createdAt' in filters && 'createdAtFrom' in filters) {
      filters.createdAt = {
        $gte: moment(new Date(filters.createdAtFrom))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.createdAt))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.createdAtFrom
    } else if ('createdAtFrom' in filters) {
      filters.createdAt = {
        $gte: moment(new Date(filters.createdAtFrom))
          .utc()
          .endOf('date')
          .toDate()
      }
      delete filters.createdAtFrom
    } else if ('createdAt' in filters) {
      filters.createdAt = {
        $lte: moment(new Date(filters.createdAt))
          .utc()
          .startOf('date')
          .toDate()
      }
    }
    if ('updatedAt' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.updatedAt = {
        $gte: moment(new Date(filters.updatedAt))
          .utc()
          .startOf('date')
          .toDate(),
        $lte: moment(new Date(filters.updatedAt))
          .utc()
          .endOf('date')
          .toDate()
      }
    }
    return this.service.count({ shop: shopId, ...filters })
  }

  async getProductByShopAdmin(_id, shopId) {
    return Service.findOne({ shop: shopId, _id })
  }

  async deleteProductByAdmin(idSet: Types.ObjectId[]) {
    for (let index = 0; index < idSet.length; index++) {
      const id = idSet[index]
      const product = await Service.findById(id)
      if (!product) throw new ApolloError('Product does not exist')
      const cartSet = await CartModel.find({ products: { $elemMatch: { product: id } } })
      const unfinishedOrder: any = await Promise.all(
        cartSet.map(async cart => {
          const order = await orderService.findOne({ cart: cart._id })
          return order.finished ? null : order
        })
      )
      if (unfinishedOrder.length !== 0) throw new ApolloError('There is an active order.')
    }
    return idSet.map(id => this.service.findOneAndUpdate(id, { isDeleted: true }))
  }

  async extractZipFileImages(source, target) {
    try {
      await decompress(String(source), String(target))
      rimraf.sync(source)
    } catch (e) {
      rimraf.sync(source)
      throw new ApolloError(e.message, '400')
    }
  }

  async getProductImageUrl(rowIndex, imageSetPath, sourcePath, shopId) {
    const fileSet: String[] = await fs.readdirSync(sourcePath)
    const fileSetWithIntendedIndex = fileSet.filter((file: any) => {
      const regex1 = RegExp(`^${rowIndex}`)
      const regex2 = RegExp(`^(${rowIndex}+-)`)
      return regex1.test(file) || regex2.test(file)
    })
    return fileSetWithIntendedIndex.slice(0, 4).map(intendedFile => {
      return this.getImagePath(intendedFile, sourcePath, shopId)
    })
  }

  async readProductSetFromExcel(excelFileUrl, tempFolder, state, imageSetPath, sourcePath, user) {
    const workbook: any = await xlsx.readFile(`${excelFileUrl}`)
    const workSheet: any = workbook.Sheets[workbook.SheetNames[0]]
    delete workSheet['!ref']
    delete workSheet['!margins']
    const keys: String[] = [
      'title',
      'price',
      'stock',
      'description',
      'discount',
      'percentage',
      'discountStart',
      'discountEnd',
      'parent',
      'deliveryVehicle'
    ]
    const excelColumns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
    const workSheetKeys = Object.keys(workSheet)
    const rowCountArray = workSheetKeys[workSheetKeys.length - 1].match(/\d+/g)
    const rowCount = rowCountArray ? rowCountArray[0] : 0
    const productTitleSet: String[] = []
    for (let rowIndex = 2; rowIndex <= rowCount; rowIndex++) {
      const product: any = {}
      for (let index = 0; index < excelColumns.length; index++) {
        const letter = excelColumns[index]
        const column = letter + rowIndex
        const value: String = workSheet[column] ? workSheet[column].v : null
        product[String(keys[index])] = value
      }
      if (state === 'VALIDATION') {
        await this.validateProductData(product, rowIndex, user)
        if (productTitleSet.includes(product.title))
          throw new ApolloError(`You must add unique title for your product in row ${rowIndex}`)
        productTitleSet.push(product.title)
      }
      if (state === 'ADD') {
        product.photoUrl = await this.getProductImageUrl(
          rowIndex,
          imageSetPath,
          sourcePath,
          user.shop
        )
        await this.createProduct(product, user)
      }
    }
  }

  async getCategorizedImageSet(imagePath) {
    const fileSet = await fs.readdirSync(imagePath)
    const filteredFileSet = fileSet.filter(file => {
      const arr = file.split('.')
      const mimeType = arr[arr.length - 1]
      if (mimeType === 'jpg' || mimeType === 'png' || mimeType === 'jpeg') return true
    })
    const imageSetName: any = {}
    filteredFileSet.forEach(file => {
      const [fileName] = file.split('.')
      const [number] = fileName.split('-')
      if (!Number.isInteger(Number(number)))
        throw new ApolloError('You did not send pictures with right format.', '400')
      if (imageSetName[Number(number)] === undefined) {
        imageSetName[Number(number)] = [file]
      } else {
        imageSetName[Number(number)].push(file)
      }
    })
    return imageSetName
  }

  getImagePath(image, sourcePath, shopId) {
    const date = moment()
    const dirRelativePath = `public/files/${date.format('YYYY')}/${date.format('MM')}/${date.format(
      'DD'
    )}`
    const dir = path.join(__dirname, `../../../${dirRelativePath}`)
    if (!fs.existsSync(dir)) {
      mkdirp.sync(dir)
    }
    const mimeType = image.split('.')[image.split('.').length - 1]
    let newFileName
    if (mimeType === 'png') {
      newFileName = `${image.split('.')[0]}-${Date.now()}-${shopId}.png`
    } else if (mimeType === 'jpeg') {
      newFileName = `${image.split('.')[0]}-${Date.now()}-${shopId}.jpeg`
    } else if (mimeType === 'jpg') {
      newFileName = `${image.split('.')[0]}-${Date.now()}-${shopId}.jpg`
    }
    const fileRelativePath = `${dirRelativePath}/${newFileName}`
    const fileFullPath = `${dir}/${newFileName}`
    const url = `/${fileRelativePath.replace('public/', '')}`
    fs.copyFileSync(`${sourcePath}/${image}`, fileFullPath)
    return url
  }

  async validateProductData(product, rowIndex, user) {
    if (!product.title || !product.price || product.price === '-' || product.title === '-')
      throw new ApolloError(`You must enter title and price for in row ${rowIndex}.`, '400')
    const productRegex = new RegExp(`^${product.title}$`, 'i')
    const duplicateProductSet = await this.service.find({
      title: { $regex: productRegex },
      shop: user.shop
    })
    if (duplicateProductSet.length)
      throw new ApolloError(`You must add unique title for your product in row ${rowIndex}`)
    if (String(product.discount).toLowerCase() === 'yes') {
      if (!product.percentage || product.percentage > 100 || product.percentage < 0)
        throw new ApolloError(
          `You must enter correct percentage for discount in row ${rowIndex}.`,
          '400'
        )

      if (!product.discountStart || !product.discountEnd)
        throw new ApolloError(
          `You must enter discountFrom and discountEnd in row ${rowIndex}.`,
          '400'
        )

      if (
        moment(product.discountStart).isBefore() ||
        !moment(product.discountStart).isBefore(product.discountEnd, 'seconds')
      )
        throw new ApolloError(
          `please enter a valid date from today or later for start and expiry date in row ${rowIndex}.`,
          '400'
        )
    }
    if (product.parent) {
      const shop: any = await shopService.findOne({ _id: user.shop })
      if (!shop) throw new ApolloError('Shop does not exist.', '400')
      if (!shop.shopMenu) throw new ApolloError('Shop does not have any menu.', '400')
      const shopMenu: any = await shopMenuService.findById(shop.shopMenu)
      if (!shopMenu) throw new ApolloError('Shop menu does not exist.', '400')
      const intendedShopMenu = shopMenu.subMenus.find(item => item.name === product.parent)
      if (!intendedShopMenu) throw new ApolloError(`Parent not found in row ${rowIndex}`, '400')
    }

    if (!product.deliveryVehicle)
      throw new ApolloError(`You must enter a delivery vehicle in row ${rowIndex}.`, '400')
    const reqCarType = await reqCarTypeService.findOne({
      name: String(product.deliveryVehicle).toUpperCase()
    })
    if (!reqCarType) throw new ApolloError(`Delivery vehicle does not exist ${rowIndex}.`, '400')
  }

  async createProduct(product, user) {
    const data: any = {}
    data.title = product.title
    data.price = product.price
    data.stock = product.stock ? product.stock : 0
    data.description = product.description ? product.description : ''
    if (String(product.discount).toLowerCase() === 'yes') {
      data.promotion = {
        percent: product.percentage,
        discountFrom: new Date(product.discountStart),
        discountTo: new Date(product.discountEnd)
      }
    }
    const reqCarType = await reqCarTypeService.findOne({
      name: String(product.deliveryVehicle).toUpperCase()
    })
    if (product.parent) {
      const shop: any = await shopService.findOne({ _id: user.shop })
      const shopMenu: any = await shopMenuService.findById(shop.shopMenu)
      const intendedShopMenu = shopMenu.subMenus.find(item => item.name === product.parent)
      data.subMenu = intendedShopMenu._id
    }
    data.reqCarTypes = [reqCarType._id]
    data.photoUrl = product.photoUrl
    return this.createProductByShopAdmin(user, data)
  }

  async findExcelFileUrl(sourceFolderName) {
    const files = fs.readdirSync(sourceFolderName)
    return `${sourceFolderName}/${files.find(item => item.includes('.xlsx'))}`
  }

  async getImageIdSet(productSetImageSet, sourcePath, shopId) {
    // productSetImageSet.forEach(productImageSet => {
    for (const key in productSetImageSet) {
      const productImageSet = productSetImageSet[key]
      productImageSet.forEach((image, index) => {
        const newPath = this.getImagePath(image, sourcePath, shopId)
        productImageSet[index] = newPath
      })
    }
    // })
    return productSetImageSet
  }

  async countExcelFileRows(excelFileUrl) {
    const workbook: any = await xlsx.readFile(`${excelFileUrl}`)
    const workSheet: any = workbook.Sheets[workbook.SheetNames[0]]
    delete workSheet['!ref']
    delete workSheet['!margins']
    const cellArray = Object.keys(workSheet)
    const lastCell: any = cellArray[cellArray.length - 1].match(/\d+/g)
    return lastCell - 1
  }

  async validateImageSet(imageCount, imageSetPath) {
    const fileSet: String[] = await fs.readdirSync(imageSetPath)
    const filteredFileSet = fileSet.filter(file => {
      const fileExtension = file.split('.')[file.split('.').length - 1]
      return fileExtension !== 'xlsx'
    })
    if (filteredFileSet.length < imageCount)
      throw new ApolloError('You did not send enough images for products', '400')
    for (let index = 2; index <= Number(imageCount) + 1; index++) {
      const fileSetWithIntendedIndex = filteredFileSet.filter((file: any) => {
        const regex1 = RegExp(`^${index}[.]`)
        const regex2 = RegExp(`^(${index}+-)`)
        return regex1.test(file) || regex2.test(file)
      })
      if (!fileSetWithIntendedIndex.length)
        throw new ApolloError(`You did not send picture for row ${index}`, '400')
    }
  }

  async addProductViaExcel(input, user) {
    const { url: zipFileUrl } = await uploadController.uploadFile({
      args: { data: { file: input.zipFile, folderName: 'zip' } },
      user
    })
    const tempFolder = `public/temp-${Date.now()}-${user.shop}`
    try {
      await this.extractZipFileImages(`build/public${zipFileUrl}`, tempFolder)
      const sourceFolderPath = `${tempFolder}`
      const excelFileUrl = await this.findExcelFileUrl(sourceFolderPath)
      const excelFileRowsCount: number = await this.countExcelFileRows(excelFileUrl)
      await this.validateImageSet(excelFileRowsCount, sourceFolderPath)
      await this.readProductSetFromExcel(excelFileUrl, tempFolder, 'VALIDATION', _, _, user)
      await this.readProductSetFromExcel(
        excelFileUrl,
        tempFolder,
        'ADD',
        tempFolder,
        sourceFolderPath,
        user
      )
      rimraf.sync(tempFolder)
      return { message: 'Products added Successfully' }
    } catch (error) {
      rimraf.sync(tempFolder)
      throw new ApolloError(error.message, '400')
    }
  }
})(Service)
