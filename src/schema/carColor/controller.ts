/* eslint-disable no-await-in-loop */
import { ApolloError } from 'apollo-server-express'
import { Types } from 'mongoose'
import { Type } from 'typescript'
import xlsx from 'xlsx'
import rimraf from 'rimraf'
import service from './service'
import controllerBase from '../../utils/controllerBase'
import carService from '../car/service'
import uploadController from '../upload/controller'

export default new (class Controller extends controllerBase {
  async createCarColorByAdmin(input, userId) {
    if (!input.name) {
      throw new ApolloError('Name can not be empty.', '400')
    }
    if (!input.code) {
      throw new ApolloError('Color code can not be empty.', '400')
    }
    for (let index = 0; index < input.name.length; index++) {
      const objectOfName = input.name[index]
      console.log(objectOfName)
      const colorNameRegex = new RegExp(`^${objectOfName.value}$`, 'i')
      const existenceCarColorSet = await service.find({
        name: { $elemMatch: { value: { $regex: colorNameRegex }, lang: objectOfName.lang } }
      })
      console.log(existenceCarColorSet)
      if (existenceCarColorSet.length) {
        throw new ApolloError('Car color with this name exists.', '400')
      }
    }

    return service.create({ ...input, admin: userId })
  }

  async getCarColor(id, language) {
    return service.findOneFromView({ _id: id }, language)
  }

  async getCarColors(pagination, filters, language) {
    return service.findFromView(filters, pagination, {}, language)
  }

  async getCarColorsCount(filters, language) {
    return this.service.countFromView(filters, language)
  }

  async getCarColorByAdmin(id) {
    return service.findOne({ _id: id })
  }

  async getCarColorsByAdmin(pagination, filters) {
    return service.find(filters, pagination)
  }

  async getCarColorsCountByAdmin(filters) {
    return this.service.count(filters)
  }

  async validateColorData(color, rowIndex) {
    if (!color.name) {
      throw new ApolloError(`Name can not be empty in row ${rowIndex}.`, '400')
    }
    if (!color.code) {
      throw new ApolloError(`Color code can not be empty in row ${rowIndex}.`, '400')
    }
    const colorNameRegex = new RegExp(`^${color.name}$`, 'i')
    const carColor = await service.findOne({ name: { $regex: colorNameRegex } })

    if (carColor) {
      throw new ApolloError(`Car color with this name exists in row ${rowIndex}.`, '400')
    }
    const colorCodeRegex = new RegExp(/^#[0-9A-F]{6}$/i)
    if (!colorCodeRegex.test(color.code))
      throw new ApolloError(`Color code is not valid in row ${rowIndex}`, '400')
  }

  async readColorsFromExcel(excelFileUrl, state, userId) {
    const workbook: any = await xlsx.readFile(`${excelFileUrl}`)
    const workSheet: any = workbook.Sheets[workbook.SheetNames[0]]
    delete workSheet['!ref']
    delete workSheet['!margins']
    const keys: String[] = ['name', 'code']
    const excelColumns = ['A', 'B']
    const workSheetKeys = Object.keys(workSheet)
    const rowCountArray = workSheetKeys[workSheetKeys.length - 1].match(/\d+/g)
    const rowCount = rowCountArray ? rowCountArray[0] : 0
    const colorNameSet: String[] = []
    for (let rowIndex = 2; rowIndex <= rowCount; rowIndex++) {
      const color: any = {}
      for (let index = 0; index < excelColumns.length; index++) {
        const letter = excelColumns[index]
        const column = letter + rowIndex
        const value: String = workSheet[column] ? workSheet[column].v : null
        color[String(keys[index])] = value
      }
      if (state === 'VALIDATION') {
        await this.validateColorData(color, rowIndex)
        if (colorNameSet.includes(color.name))
          throw new ApolloError(`You must add unique name for your color in row ${rowIndex}`)
        colorNameSet.push(color.name)
      }
      if (state === 'ADD') {
        await this.createCarColorByAdmin(color, userId)
      }
    }
  }

  async addCarColorViaExcel(excelFile, user) {
    const { url } = await uploadController.uploadFile({
      args: { data: { file: excelFile, folderName: 'excel' } },
      user
    })
    const excelFilePath = `build/public/${url}`
    try {
      await this.readColorsFromExcel(excelFilePath, 'VALIDATION', null)
      await this.readColorsFromExcel(excelFilePath, 'ADD', user.sub)
      rimraf.sync(excelFilePath)
      return 'Colors added successfully'
    } catch (error) {
      rimraf.sync(excelFilePath)
      throw new ApolloError(error.message)
    }
  }

  async updateCarColorByAdmin(id: Types.ObjectId, input) {
    if (!input.name) {
      throw new ApolloError('Name can not be empty.', '400')
    }
    if (!input.code) {
      throw new ApolloError('Color code can not be empty.', '400')
    }
    const colorNameRegex = new RegExp(`^${input.name}$`, 'i')
    const carColor = await service.findOne({ name: { $regex: colorNameRegex } })

    if (carColor && String(carColor._id) !== String(id)) {
      throw new ApolloError('Color with this name exists.', '400')
    }
    return service.findOneAndUpdate({ _id: id }, input)
  }

  async deleteCarColorByAdmin(idSet: Types.ObjectId[]) {
    for (let index = 0; index < idSet.length; index++) {
      const id = idSet[index]
      const carColor: any = await service.findById(id)
      if (!carColor) throw new ApolloError('Color does not exist.')
      if (carColor.isDeleted) throw new ApolloError('Color has deleted before.')
      const carSet = await carService.find({ color: id, isDeleted: false })
      if (carSet.length !== 0) throw new ApolloError('Color is used by at least one car(s).')
    }
    return idSet.map(id => service.findOneAndUpdate(id, { isDeleted: true }))
  }
})(service)
