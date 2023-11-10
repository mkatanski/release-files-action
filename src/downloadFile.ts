import * as core from '@actions/core'
import fs from 'fs'
import { AssetsService } from './AssetsService'
import { Runner } from './commonTypes'
import axios from 'axios'

export const downloadFile: Runner = async ({
  filePath,
  name,
  releaseTag,
  token
}) => {
  if (fs.existsSync(filePath)) {
    core.setFailed(`File found at path: ${filePath}. Cannot overwrite.`)
    return
  }

  const assetsService = new AssetsService(token, releaseTag)
  const release = await assetsService.getRelease()
  const assets = await assetsService.getReleaseAssets(release.id)
  const asset = assets.find(({ name: asset_name }) => asset_name == name)

  if (!asset) {
    core.setFailed(`Asset ${name} not found`)
    return
  }

  const download_url = asset.url

  core.debug('Create write stream to: ' + filePath)
  const fileWriter = fs.createWriteStream(filePath)

  core.debug('Downloading file from: ' + download_url)
  await axios({
    url: download_url,
    method: 'GET',
    responseType: 'stream' // important
  }).then(response => {
    return new Promise((resolve, reject) => {
      response.data.pipe(fileWriter)
      let error: Error | null = null

      fileWriter.on('error', err => {
        error = err
        core.debug('Error writing to file: ' + filePath)
        core.debug(err.message)
        fileWriter.close()
        reject(err)
      })

      fileWriter.on('close', () => {
        if (!error) {
          core.debug('File downloaded successfully.')
          resolve(true)
        }
      })
    })
  })
}
