const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const { ncp } = require('ncp')

// copy .env file to build directory
if (fs.existsSync(path.join(__dirname, '.env'))) {
  fs.copyFileSync(path.join(__dirname, '.env'), path.join(__dirname, 'build/.env'))
} else {
  fs.copyFileSync(path.join(__dirname, '.env.example'), path.join(__dirname, 'build/.env'))
}

mkdirp.sync('build/public/')
mkdirp.sync('public/images')

if (fs.existsSync(path.join(__dirname, 'src/config/sparkFireBase.json'))) {
  fs.copyFileSync(
    path.join(__dirname, 'src/config/sparkFireBase.json'),
    path.join(__dirname, 'build/src/config/sparkFireBase.json')
  )
}

ncp('public/images', 'build/public/images', err => {
  if (err) console.log(err)
})

ncp('templates', 'build/templates', err => {
  if (err) console.log(err)
})
