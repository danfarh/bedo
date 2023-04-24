import program from 'commander'
import fs from 'fs'
import path from 'path'
import { red, green } from 'chalk'
import mongoConnected from './src/internal/connection'
import seedAllModels from './src/utils/seedAllModels'
import initDatabaseData from './src/utils/initDatabaseData'

mongoConnected()

program.version('1.0.0')

program
  .command('seed [count] [model]')
  .option('-a, --add', 'add new docs and not remove old data')
  .option('-k, --keep-users', 'keep users data or not')
  .description('seed a model')
  .action(async (argCount, modelName, ctx) => {
    const count = Number(argCount) || 1
    if (!modelName) {
      return seedAllModels(count, ctx)
    }
    const modelPath = path.join(__dirname, `src/schema/${modelName}/schema.js`)
    const seederPath = path.join(__dirname, `src/schema/${modelName}/schema.js`)
    const modelPathTs = modelPath.replace(/\.js$/, '.ts')
    const seederPathTs = modelPath.replace(/\.js$/, '.ts')
    if (!fs.existsSync(modelPath) || !fs.existsSync(seederPath)) {
      if (!fs.existsSync(modelPathTs) || !fs.existsSync(seederPathTs)) {
        console.log(red('seeder or model not exists'))

        return process.exit()
      }
    }

    const { default: model } = await import(`./src/schema/${modelName}/schema`)
    if (!ctx.new) {
      await model.deleteMany({})
    }
    const { default: seeder } = await import(`./src/schema/${modelName}/seeder`)
    console.log(green('seeding data'))
    const data = await seeder(count)
    console.log(green(`${data.length} ${modelName} was created`))
    process.exit()
  })

program
  .command('init-db')
  .description('seed init database')
  .action(async ctx => {
    await initDatabaseData()
    process.exit()
  })

setTimeout(() => {
  program.parse(process.argv)
}, 400)
