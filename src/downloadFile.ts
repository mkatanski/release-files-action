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

  const file = fs.createWriteStream(filePath)

  const headers = {
    Accept: 'application/octet-stream',
    'User-Agent': 'request module'
  }

  https.get(
    {
      headers,
      href: download_url
    },
    function (response) {
      console.log('Downloading file...')
      console.log('Response status code: ' + response.statusCode)
      console.log(
        'Response headers: ' + JSON.stringify(response.headers, null, 2)
      )

      response.pipe(file)

      response.on('end', () => {
        file.close()
        console.log('Download Completed')
      })
    }
  )
}
