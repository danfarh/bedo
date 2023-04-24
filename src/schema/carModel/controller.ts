/* eslint-disable no-await-in-loop */
import { ApolloError } from 'apollo-server-express'
import { Types } from 'mongoose'
import rimraf from 'rimraf'
import xlsx from 'xlsx'
import service from './service'
import controllerBase from '../../utils/controllerBase'
import carService from '../car/service'
import carBrandService from '../carBrand/service'
import uploadController from '../upload/controller'

export default new (class Controller extends controllerBase {
  async createCarModelByAdmin(input, userId) {
    if (!input.name) {
      throw new ApolloError('Name can not be empty.', '400')
    }
    const carBrand = await carBrandService.findById(input.brand)

    if (!carBrand) {
      throw new ApolloError('Brand does not exists.', '400')
    }

    const modelRegex = new RegExp(`^${input.name}$`, 'i')
    const carModel = await service.findOne({ name: { $regex: modelRegex } })

    if (carModel) {
      throw new ApolloError('Car model With this name exists.', '400')
    }
    return service.create({ ...input, admin: userId })
  }

  async getCarModel(id) {
    return service.findOne({ _id: id })
  }

  async getCarModels(pagination, filters: any = {}) {
    if ('name' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.name = new RegExp(filters.name, 'gi')
    }
    return service.find(filters, pagination)
  }

  async getCarModelsCount(filters: any = {}) {
    if ('name' in filters) {
      // eslint-disable-next-line no-param-reassign
      filters.name = new RegExp(filters.name, 'gi')
    }
    return this.service.count(filters)
  }

  async updateCarModelByAdmin(id: Types.ObjectId, input) {
    if (!input.name) {
      throw new ApolloError('Name can not be empty.', '400')
    }
    if (!input.brand) {
      throw new ApolloError('Brand can not be empty.', '400')
    }
    const modelRegex = new RegExp(`^${input.name}$`, 'i')
    const carModel = await service.findOne({ name: { $regex: modelRegex } })

    if (carModel && String(carModel._id) !== String(id)) {
      throw new ApolloError('Car model with this name exists.', '400')
    }
    return service.findOneAndUpdate({ _id: id }, input)
  }

  async deleteCarModelByAdmin(idSet: Types.ObjectId[]) {
    for (let index = 0; index < idSet.length; index++) {
      const id = idSet[index]
      const carModel: any = await service.findById(id)
      if (!carModel) throw new ApolloError('Model does not exist.', '400')
      if (carModel.isDeleted) throw new ApolloError('Model has deleted before.', '400')
      const carSet = await carService.find({ model: id })
      if (carSet.length !== 0) throw new ApolloError('Model is used by at least one car(s).', '400')
    }
    return idSet.map(id => service.findOneAndUpdate(id, { isDeleted: true }))
  }

  async validateModelData(model, rowIndex) {
    if (!model.name) throw new ApolloError(`Name can not be empty in row ${rowIndex}.`, '400')

    if (!model.brand) throw new ApolloError(`Brand can not be empty in row ${rowIndex}.`, '400')

    const modelRegex = new RegExp(`^${model.name}$`, 'i')
    const carModel = await service.findOne({ name: { $regex: modelRegex } })
    if (carModel)
      throw new ApolloError(`Car Model with this name exists in row ${rowIndex}.`, '400')

    const brandRegex = new RegExp(`^${model.brand}$`, 'i')
    const carBrand = await carBrandService.find({ name: { $regex: brandRegex } })
    console.log(carBrand)
    if (!carBrand)
      throw new ApolloError(`Car Brand with this name does not exist in row ${rowIndex}.`, '400')
  }

  async readModelsFromExcel(excelFileUrl, state, userId) {
    const workbook: any = await xlsx.readFile(`${excelFileUrl}`)
    const workSheet: any = workbook.Sheets[workbook.SheetNames[0]]
    delete workSheet['!ref']
    delete workSheet['!margins']
    const keys: String[] = ['name', 'brand']
    const excelColumns = ['A', 'B']
    const workSheetKeys = Object.keys(workSheet)
    const rowCountArray = workSheetKeys[workSheetKeys.length - 1].match(/\d+/g)
    const rowCount = rowCountArray ? rowCountArray[0] : 0
    const modelNameSet: String[] = []
    for (let rowIndex = 2; rowIndex <= rowCount; rowIndex++) {
      const model: any = {}
      for (let index = 0; index < excelColumns.length; index++) {
        const letter = excelColumns[index]
        const column = letter + rowIndex
        const value: String = workSheet[column] ? workSheet[column].v : null
        model[String(keys[index])] = value
      }
      if (state === 'VALIDATION') {
        await this.validateModelData(model, rowIndex)
        if (modelNameSet.includes(model.name))
          throw new ApolloError(`You must add unique name for your model in row ${rowIndex}`)
        modelNameSet.push(model.name)
      }
      if (state === 'ADD') {
        const brandRegex = new RegExp(`^${model.brand}$`, 'i')
        const carBrand = await carBrandService.findOne({ name: { $regex: brandRegex } })
        model.brand = carBrand._id
        await this.createCarModelByAdmin(model, userId)
      }
    }
  }

  async addCarModelViaExcel(excelFile, user) {
    const { url } = await uploadController.uploadFile({
      args: { data: { file: excelFile, folderName: 'excel' } },
      user
    })
    const excelFilePath = `build/public/${url}`
    try {
      await this.readModelsFromExcel(excelFilePath, 'VALIDATION', null)
      await this.readModelsFromExcel(excelFilePath, 'ADD', user.sub)
      rimraf.sync(excelFilePath)
      return 'Models added successfully'
    } catch (error) {
      rimraf.sync(excelFilePath)
      throw new ApolloError(error.message)
    }
  }
})(service)
