import FavoritePlaces from './schema'
import serviceBase from '../../utils/serviceBase'

export default new (class service extends serviceBase {
  async findOneForUserOrCreate(filters: any) {
    let resource = await this.findOne(filters)
    if (!resource && filters.user) {
      resource = await this.create({
        user: filters.user,
        favorites: []
      })
    }
    return resource
  }
})(FavoritePlaces)
