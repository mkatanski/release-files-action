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
  https.get(download_url, function (response) {
    response.pipe(file)
  })
}
