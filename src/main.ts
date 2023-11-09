import * as core from '@actions/core'
import fs from 'fs'
import { isNativeError } from 'util/types'
import { AssetsService } from './AssetsService'

async function run() {
  try {
    const token = core.getInput('token', { required: true })
    const releaseTag = core.getInput('release-tag', { required: true })
    const file = core.getInput('file', { required: true })
    const name = core.getInput('name', { required: true })
    const label = core.getInput('label', { required: false })
    const contentType = core.getInput('content-type', { required: true })

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

    const fileStream = fs.createReadStream(file)
    const contentLength = fs.statSync(file).size

    const upload_url = release.upload_url.replace(
      '{?name,label}',
      `?name=${name}&label=${label}`
    )

    const fileRes = await assetsService.uploadAsset(
      fileStream,
      contentType,
      contentLength,
      upload_url
    )

    console.log(`Download URL: ${fileRes.browser_download_url}`)

    core.setOutput('download-url', fileRes.browser_download_url)
    core.setOutput('id', fileRes.id)
    core.setOutput('label', fileRes.label)
    core.setOutput('name', fileRes.name)
  } catch (e) {
    const message = isNativeError(e) ? e.message : 'Unknown error'
    core.setFailed(message)
  }
}

run()
