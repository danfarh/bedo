/* eslint-disable no-plusplus */
/* eslint-disable guard-for-in */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import faker from 'faker'
import { green } from 'chalk'
import User from '../schema/user/schema'
import Product from '../schema/product/schema'
import Category from '../schema/category/schema'
import Shop from '../schema/shop/schema'
import ShopMenu from '../schema/shopMenu/schema'
import Admin from '../schema/admin/schema'
import Attribute from '../schema/attribute/schema'
import AttributeGroup from '../schema/attributeGroup/schema'
import ShopReadyComments from '../schema/shopReadyComments/schema'
import CommentOnShop from '../schema/commentOnShop/schema'
import Cart from '../schema/cart/schema'
import OrderPromotion from '../schema/orderPromotion/schema'
import Order from '../schema/order/schema'

import productSeeder from '../schema/product/seeder'
import categorySeeder from '../schema/category/seeder'
import adminSeeder from '../schema/admin/seeder'
import attributeSeeder from '../schema/attribute/seeder'
import attributeGroupSeeder from '../schema/attributeGroup/seeder'
import shopSeeder from '../schema/shop/seeder'
import shopMenuSeeder from '../schema/shopMenu/seeder'
import ShopReadyCommentsSeeder from '../schema/shopReadyComments/seeder'
import commentOnShopSeeder from '../schema/commentOnShop/seeder'
import cartSeeder from '../schema/cart/seeder'
import orderPromotionSeeder from '../schema/orderPromotion/seeder'
import orderSeeder from '../schema/order/seeder'

export default async (count = 1, ctx: any = {}) => {
  // reset db
  if (!ctx.new) {
    console.log(green('deleting old db data'))
    await Category.deleteMany({})
    await Product.deleteMany({})
    await Admin.deleteMany({})
    await Attribute.deleteMany({})
    await AttributeGroup.deleteMany({})
    await Shop.deleteMany({})
    await ShopMenu.deleteMany({})
    await ShopReadyComments.deleteMany({})
    await CommentOnShop.deleteMany({})
    await Cart.deleteMany({})
    await OrderPromotion.deleteMany({})
    await Order.deleteMany({})
  }

  // admins
  console.log('seeding admins')
  let admins: any = []
  for (let i = 0; i < count; i++) {
    admins = admins.concat(
      await adminSeeder({
        email: 'shopadmin@gmail.com',
        password: 'secret100',
        verificationState: 'VERIFIED',
        type: 'SHOP-ADMIN',
        fullName: 'shopAdmin'
      })
    )
  }

  const users = await User.find({})

  // categories
  console.log('seeding categories')

  let rootCategories: any[] = []
  rootCategories = rootCategories.concat(
    await categorySeeder({
      parent: null,
      title: 'Restaurant',
      photoUrl: null
    })
  )

  rootCategories = rootCategories.concat(
    await categorySeeder({
      parent: null,
      title: 'Grocery',
      photoUrl: null
    })
  )

  const categories: any[] = await categorySeeder(
    { parent: faker.random.arrayElement(rootCategories) },
    5
  )

  // seed attributeGroups
  console.log('seeding attributeGroups')
  let attributeGroups: any[] = []
  attributeGroups = attributeGroups.concat(
    await attributeGroupSeeder({
      rootCategory: faker.random.arrayElement(rootCategories),
      name: 'Country'
    })
  )
  attributeGroups = attributeGroups.concat(
    await attributeGroupSeeder({
      rootCategory: faker.random.arrayElement(rootCategories),
      name: 'Food type'
    })
  )
  attributeGroups = attributeGroups.concat(
    await attributeGroupSeeder({
      rootCategory: faker.random.arrayElement(rootCategories),
      name: 'Allergy proof'
    })
  )

  // seed attributes
  console.log('seeding attributes')
  let attributes: any[] = []
  attributes = attributes.concat(
    await attributeSeeder({
      attributeGroup: faker.random.arrayElement(attributeGroups),
      name: 'Italian',
      photoUrl: faker.image.imageUrl()
    })
  )
  attributes = attributes.concat(
    await attributeSeeder({
      attributeGroup: faker.random.arrayElement(attributeGroups),
      name: 'Halal',
      photoUrl: faker.image.imageUrl()
    })
  )
  attributes = attributes.concat(
    await attributeSeeder({
      attributeGroup: faker.random.arrayElement(attributeGroups),
      name: 'Seafood',
      photoUrl: faker.image.imageUrl()
    })
  )

  // seed products
  console.log('seeding products')
  let products: any[] = []
  for (let i = 0; i < count; i++) {
    const attribute = faker.random.arrayElement(attributes)
    const { category } = attributeGroups.find(item => item._id === attribute.attributeGroup._id)
    const price = faker.random.number({ min: 1, max: 2000 })
    const percent = faker.random.number({ min: 1, max: 99 })
    const percentagedPrice = Number((Number(price) * Number(percent)) / 100)
    const afterDiscountPrice = Number(Number(price) - Number(percentagedPrice)).toFixed(2)
    products = products.concat(
      await productSeeder({
        category,
        attribute,
        afterDiscountPrice,
        price,
        percent
      })
    )
  }

  // shopReadyComments
  console.log('seeding shopReadyComments')
  const shopReadyComments: any[] = await ShopReadyCommentsSeeder(count)

  // seed shopMenu
  console.log('seeding shopMenues')
  let shopMenues: any[] = []
  for (let i = 0; i < count; i++) {
    const product = products[i]
    shopMenues = shopMenues.concat(
      await shopMenuSeeder({
        product
      })
    )
  }
  // seed shops
  console.log('seeding shops')
  let shops: any[] = []
  for (let i = 0; i < count; i++) {
    const shopMenu = shopMenues[i]
    const category = faker.random.arrayElement(categories)
    const attribute = faker.random.arrayElement(attributes)
    const product = products[i]
    const admin: any = admins[i]
    shops = shops.concat(
      await shopSeeder({
        shopMenu,
        category,
        attribute,
        admin,
        product
      })
    )

    const lastShop = shops[i]
    // update product's shop
    Product.updateOne({ _id: product._id }, { shop: lastShop._id }).exec()

    // update admin's shop
    Admin.updateOne({ _id: admin._id }, { shop: lastShop._id }).exec()

    // update shop menu's shop
    ShopMenu.updateOne({ _id: shopMenu._id }, { shop: lastShop._id })
  }

  // seed cart
  console.log('seeding carts')
  let carts: any[] = []
  for (let i = 0; i < count; i++) {
    const product = faker.random.arrayElement(products)
    const shop = faker.random.arrayElement(shops)
    const user = faker.random.arrayElement(users)
    carts = carts.concat(
      await cartSeeder({
        rootCategory: faker.random.arrayElement(rootCategories),
        product,
        shop,
        user
      })
    )
  }

  // seed orderPromotion
  console.log('seeding orderPromotions')
  let orderPromotions: any[] = []
  for (let i = 0; i < count; i++) {
    const userCanUse = faker.random.arrayElement(users)
    const userCanNotUse = faker.random.arrayElement(users.filter(u => u._id !== userCanUse._id))
    orderPromotions = orderPromotions.concat(
      await orderPromotionSeeder({
        userCanUse,
        userCanNotUse
      })
    )
  }

  // seed orders
  console.log('seeding orders')
  let orders: any[] = []
  for (let i = 0; i < count; i++) {
    const shop = shops[i]
    const cart = faker.random.arrayElement(carts)
    const { user } = cart
    const promotion = faker.random.arrayElement(orderPromotions)
    orders = orders.concat(
      await orderSeeder({
        cart,
        shop,
        user,
        promotion
      })
    )
  }

  // seed commentOnShop
  console.log('seeding commentOnShops')
  let commentsOnShop: any[] = []
  for (let i = 0; i < count; i++) {
    const order = faker.random.arrayElement(orders)
    const shop = shops[i]
    const { user } = order
    commentsOnShop = commentsOnShop.concat(
      await commentOnShopSeeder({
        readyCommentsArray: shopReadyComments,
        order,
        shop,
        user
      })
    )
  }

  console.log(green('shop models are seeded'))
}
