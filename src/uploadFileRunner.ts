import * as core from '@actions/core'
import fs from 'fs'
import { AssetsService } from './AssetsService'
import { Runner } from './commonTypes'

export const uploadFile: Runner = async ({
  contentType,
  filePath,
  label,
  name,
  releaseTag,
  token
}) => {
  if (!fs.existsSync(filePath)) {
    core.setFailed(`File not found at path: ${filePath}`)
    return
  }

  const assetsService = new AssetsService(token, releaseTag)
  const release = await assetsService.getRelease()
  const assets = await assetsService.getReleaseAssets(release.id)

  assets
    .filter(asset => asset)
    .forEach(({ id: asset_id, name: asset_name }) => {
      if (asset_name == name) {
        assetsService.deleteAsset(asset_id)
      }
    })

  const upload_url = release.upload_url.replace(
    '{?name,label}',
    `?name=${name}&label=${label}`
  )

  const fileRes = await assetsService.uploadAsset(
    filePath,
    upload_url,
    contentType
  )

  console.log(`Download URL: ${fileRes.browser_download_url}`)
}
