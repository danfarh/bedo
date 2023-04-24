import { Types } from 'mongoose'
import service from './service'
import controllerBase from '../../utils/controllerBase'

export default new (class Controller extends controllerBase {
  async updateCart(
    shop: string,
    product: any,
    category: string,
    userLocation: any,
    user: any
  ): Promise<any> {
    const updatedCart = await service.updateCart(
      shop,
      product,
      category,
      userLocation,
      user.sub,
      true,
      false
    )
    return updatedCart
  }

  async resetCart(shop: string, category: string, user: any): Promise<any> {
    const updatedCart = await service.updateCart(
      shop,
      {
        id: '',
        detailId: '',
        quantity: { quantity_small: 0, quantity_medium: 0, quantity_large: 0 }
      },
      category,
      { long: 0, lat: 0 },
      user.sub,
      true,
      true
    )
    return updatedCart
  }

  async cartVerification(category: String, user: any) {
    return service.cartVerification(category, user.sub)
  }

  async getUserCart(user: any, category: String) {
    return service.getUserCart(`cart_${category}_user-${user.sub}`)
  }

  async cartRejection(category: String, user: any) {
    const response = await service.cartRejection(category, user)
    return {
      message: response
    }
  }
})(service)
