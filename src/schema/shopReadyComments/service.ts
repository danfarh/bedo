import * as _ from 'lodash'
import { Types } from 'mongoose'
import Model, { ShopReadyCommentsViews } from './schema'
import serviceBase from '../../utils/serviceBase'

export default new (class service extends serviceBase {
  async findById(_id) {
    return Model.findOne({ _id })
  }
})(Model, ShopReadyCommentsViews)
