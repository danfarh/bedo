import { ApolloError } from 'apollo-server-express'
import fs from 'fs'
import path from 'path'
import mkdirp from 'mkdirp'
import moment from 'moment'

export default new (class Controller {
  async uploadFile(data) {
    const file = await data.args.data.file
    const { folderName } = data.args.data
    const date = moment()
    const dirRelativePath = `public/files/${date.format('YYYY')}/${date.format('MM')}/${date.format(
      'DD'
    )}/${folderName}`
    const dir = path.join(__dirname, `../../../${dirRelativePath}`)
    if (!fs.existsSync(dir)) {
      mkdirp.sync(dir)
    }
    if (file) {
      if (data.user.userId) {
        const { createReadStream, filename, mimetype } = file
        console.log(mimetype)
        let newFileName: string
        if (mimetype === 'image/png') {
          newFileName = `${filename.split('.')[0]}-${Date.now()}-${data.user.userId}.png`
        } else if (mimetype === 'image/jpeg') {
          newFileName = `${filename.split('.')[0]}-${Date.now()}-${data.user.userId}.jpg`
        } else if (mimetype === 'video/mp4') {
          newFileName = `${filename.split('.')[0]}-${Date.now()}-${data.user.userId}.mp4`
        } else if (mimetype === 'audio/mpeg3' || mimetype === 'audio/x-mpeg-3') {
          newFileName = `${filename.split('.')[0]}-${Date.now()}-${data.user.userId}.mp3`
        } else if (mimetype === 'application/pdf') {
          newFileName = `${filename.split('.')[0]}-${Date.now()}-${data.user.userId}.pdf`
        } else if (
          mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ) {
          newFileName = `${filename.split('.')[0]}-${Date.now()}-${data.user.userId}.xlsx`
        } else if (mimetype === 'application/x-zip-compressed') {
          newFileName = `${filename.split('.')[0]}-${Date.now()}-${data.user.userId}.zip`
        } else {
          throw new ApolloError('invalid type', '403')
        }

        const fileStream = createReadStream()

        const fileRelativePath = `${dirRelativePath}/${newFileName}`
        const fileFullPath = `${dir}/${newFileName}`
        await new Promise(resolve => {
          fileStream.pipe(fs.createWriteStream(fileFullPath)).on('close', resolve)
        })
        return {
          url: `/${fileRelativePath.replace('public/', '')}` // remove public prefix from url
        }
      }
      throw new ApolloError('you need to login', '403')
    }
    throw new ApolloError('file not send', '500')
  }
})()
