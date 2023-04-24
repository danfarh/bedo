import { GraphQLSchema } from 'graphql'
import bcrypt from 'bcryptjs'
import { HASH_SALT } from '../config'
import permissionService from '../schema/permission/schema'
import adminService from '../schema/admin/service'
import roleService from '../schema/role/service'

export default async function(schema: GraphQLSchema) {
  // @ts-ignore
  const mutations = Object.keys(schema.getMutationType().getFields())
  // @ts-ignore
  const queries = Object.keys(schema.getQueryType().getFields())
  // @ts-ignore
  const subscriptions = Object.keys(schema.getSubscriptionType().getFields())

  const permissionsInApp = [...Array.from(new Set([...queries, ...mutations, ...subscriptions]))]
  // @ts-ignore
  let permissionsInDb = await permissionService.find().select('name')
  // @ts-ignore
  permissionsInDb = permissionsInDb.map(per => per.name)
  const permissionsToAddToDb: any[] = []
  permissionsInApp.forEach(per => {
    // @ts-ignore
    if (!permissionsInDb.includes(per)) {
      permissionsToAddToDb.push(per)
    }
  })

  if (permissionsToAddToDb.length > 0) {
    // eslint-disable-next-line no-restricted-syntax
    for (const per of permissionsToAddToDb) {
      // eslint-disable-next-line no-await-in-loop
      await permissionService.create({
        name: per,
        description: per
      })
    }
    console.log('new permissions added.')
  }
  // eslint-disable-next-line no-use-before-define
  await createOrUpdateSuperAdmin()
}

async function createOrUpdateShopAdminRole() {
  let shopAdminRole = await roleService.findOne({ name: 'SHOP-ADMIN' })
  const shopAdminPermissionSet = await permissionService.find({
    name: { $regex: '.*ByShopAdmin.*' }
  })
  if (!shopAdminRole) {
    shopAdminRole = await roleService.create({
      name: 'SHOP-ADMIN',
      description: 'Role for shop admins.',
      permissions: shopAdminPermissionSet
    })
    return shopAdminRole
  }
  shopAdminRole.permissions = shopAdminPermissionSet
  await shopAdminRole.save()
  return shopAdminRole
}

async function createOrUpdateAdminRole() {
  let adminRole = await roleService.findOne({ name: 'SUPER-ADMIN' })
  const permissions = await permissionService
    .find({
      $and: [
        { name: { $ne: 'role' } },
        { name: { $ne: 'roles' } },
        { name: { $ne: 'createRoleByAdmin' } },
        { name: { $ne: 'updateRoleByAdmin' } },
        { name: { $ne: 'deleteAdminBySystemAdmin' } }
      ]
    })
    .select('_id')
  if (!adminRole) {
    adminRole = await roleService.create({
      name: 'SUPER-ADMIN',
      description: 'An admin with full permission',
      permissions
    })
    return adminRole
  }
  adminRole.permissions = permissions
  await adminRole.save()
  return adminRole
}

async function createSystemAdmin() {
  let mainAdminRole = await roleService.findOne({ name: 'SYSTEM-ADMINISTRATOR' })
  const permissions = await permissionService.find().select('_id')
  if (!mainAdminRole) {
    mainAdminRole = await roleService.create({
      name: 'SYSTEM-ADMINISTRATOR',
      description: 'An admin with full permission + Managing admins',
      permissions
    })
    return mainAdminRole
  }
  mainAdminRole.permissions = permissions
  await mainAdminRole.save()
  return mainAdminRole
}

async function createOrUpdateSuperAdmin() {
  let admin = await adminService.findByEmail('testmail@testmail.com')
  await createOrUpdateShopAdminRole()
  await createOrUpdateAdminRole()
  const systemAdmin = await createSystemAdmin()
  if (!admin) {
    admin = await adminService.create({
      fullName: 'Test Admin',
      email: 'testmail@testmail.com',
      phoneNumber: '09121111111',
      passwordHash: bcrypt.hashSync('testpassword', HASH_SALT),
      phoneNumberVerified: true,
      state: 'ACTIVE',
      verificationState: 'VERIFIED',
      type: 'SUPER-ADMIN',
      roles: [systemAdmin._id]
    })
    return admin
  }
  // @ts-ignore
  admin.roles = [systemAdmin._id]
  await admin.save()
  return admin
}
