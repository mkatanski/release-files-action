import * as core from '@actions/core'
import fs from 'fs'
import { AssetsService } from './AssetsService'
import https from 'https'
import { Runner } from './commonTypes'

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
  const file = fs.createWriteStream(filePath)

  const headers = {
    Accept: 'application/octet-stream',
    'User-Agent': 'request module'
  }

  const downloadRequest = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      file.on('finish', () => {
        core.debug('File downloaded successfully.')
        resolve()
      })

      file.on('error', err => {
        core.debug('There was an issue downloading file.')
        core.setFailed('Error downloading file:' + err.message)
        reject('Error downloading file:' + err.message)
      })

      https.get(
        {
          headers,
          href: download_url
        },
        function (response) {
          core.debug('Downloading file...')
          core.debug('Response status code: ' + response.statusCode)
          core.debug(
            'Response headers: ' + JSON.stringify(response.headers, null, 2)
          )

          response.pipe(file)
        }
      )
    })
  }

  core.debug('Downloading file from: ' + download_url)
  await downloadRequest()
}
