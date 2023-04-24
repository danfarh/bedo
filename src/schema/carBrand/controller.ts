/* eslint-disable no-await-in-loop */
import { ApolloError } from 'apollo-server-express'
import { Types } from 'mongoose'
import rimraf from 'rimraf'
import xlsx from 'xlsx'
import service from './service'
import controllerBase from '../../utils/controllerBase'
import carService from '../car/service'
import carModelService from '../carModel/service'
import uploadController from '../upload/controller'

export default new (class Controller extends controllerBase {
  async createCarBrandByAdmin(input, userId) {
    if (!input.name) {
      throw new ApolloError('Name can not be empty.', '400')
    }

    const brandRegex = new RegExp(`^${input.name}$`, 'i')
    const brand = await service.findOne({ name: { $regex: brandRegex } })

    if (brand) {
      throw new ApolloError('Car Brand with this name exists.', '400')
    }

    return service.create({ ...input, admin: userId })
  }

  async getCarBrand(id) {
    return service.findOne({ _id: id })
  }

  async getCarBrands(Pagination, filters, sort) {
    return service.find(filters, Pagination, sort)
  }

  async getCarBrandsCount() {
    return service.count()
  }

  async updateCarBrandByAdmin(id: Types.ObjectId, input) {
    if (!input.name) {
      throw new ApolloError('Name can not be empty.', '400')
    }

    const brandRegex = new RegExp(`^${input.name}$`, 'i')
    const brand = await service.findOne({ name: { $regex: brandRegex } })

    if (brand && String(brand._id) !== String(id)) {
      throw new ApolloError('Brand with this name exists.', '400')
    }
    return service.findOneAndUpdate({ _id: id }, input)
  }

  async deleteCarBrandByAdmin(idSet: Types.ObjectId[]) {
    for (let index = 0; index < idSet.length; index++) {
      const id = idSet[index]
      const carBrand = await service.findById(id)
      if (!carBrand) throw new ApolloError('This brand does not exist.', '400')
      const carSet: any = await carService.find({ brand: carBrand._id, isDeleted: false })
      if (carSet.length !== 0) {
        throw new ApolloError('This brand is used by at least one car(s).', '400')
      }
      const modelSet: any = await carModelService.find({ brand: id })
      if (modelSet.length !== 0)
        throw new ApolloError('This brand is used by at least one model(s).')
    }
    return idSet.map(id => service.findOneAndUpdate(id, { isDeleted: true }))
  }

  async validateBrandData(brand, rowIndex) {
    if (!brand.name) {
      throw new ApolloError(`Name can not be empty in row ${rowIndex}.`, '400')
    }
    const brandRegex = new RegExp(`^${brand.name}$`, 'i')
    const carBrand = await service.findOne({ name: { $regex: brandRegex } })

    if (carBrand) {
      throw new ApolloError(`Car Brand with this name exists in row ${rowIndex}.`, '400')
    }
  }

  async readBrandsFromExcel(excelFileUrl, state, userId) {
    const workbook: any = await xlsx.readFile(`${excelFileUrl}`)
    const workSheet: any = workbook.Sheets[workbook.SheetNames[0]]
    delete workSheet['!ref']
    delete workSheet['!margins']
    const keys: String[] = ['name']
    const excelColumns = ['A']
    const workSheetKeys = Object.keys(workSheet)
    const rowCountArray = workSheetKeys[workSheetKeys.length - 1].match(/\d+/g)
    const rowCount = rowCountArray ? rowCountArray[0] : 0
    const brandNameSet: String[] = []
    for (let rowIndex = 2; rowIndex <= rowCount; rowIndex++) {
      const brand: any = {}
      for (let index = 0; index < excelColumns.length; index++) {
        const letter = excelColumns[index]
        const column = letter + rowIndex
        const value: String = workSheet[column] ? workSheet[column].v : null
        brand[String(keys[index])] = value
      }
      if (state === 'VALIDATION') {
        await this.validateBrandData(brand, rowIndex)
        if (brandNameSet.includes(brand.name))
          throw new ApolloError(`You must add unique name for your brand in row ${rowIndex}`)
        brandNameSet.push(brand.name)
      }
      if (state === 'ADD') {
        await this.createCarBrandByAdmin(brand, userId)
      }
    }
  }

  async addCarBrandViaExcel(excelFile, user) {
    console.log(excelFile)
    const { url } = await uploadController.uploadFile({
      args: { data: { file: excelFile, folderName: 'excel' } },
      user
    })
    const excelFilePath = `build/public/${url}`
    try {
      await this.readBrandsFromExcel(excelFilePath, 'VALIDATION', null)
      await this.readBrandsFromExcel(excelFilePath, 'ADD', user.sub)
      rimraf.sync(excelFilePath)
      return 'Brands added successfully'
    } catch (error) {
      rimraf.sync(excelFilePath)
      throw new ApolloError(error.message)
    }
  }
})(service)
