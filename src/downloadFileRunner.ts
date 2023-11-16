import * as core from '@actions/core'
import fs from 'fs'
import axios from 'axios'
import axiosRetry from 'axios-retry'
import { Runner } from './commonTypes'
import { AssetsService } from './AssetsService'

axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay
})

export const downloadFile: Runner = async ({
  filePath,
  name,
  releaseTag,
  token,
  notFoundBehavior
}) => {
  if (fs.existsSync(`${filePath}/${name}`)) {
    core.setFailed(`File found at path: ${filePath}/${name}. Cannot overwrite.`)
    return
  }

  const assetsService = new AssetsService(token, releaseTag)
  const release = await assetsService.getRelease()
  const assets = await assetsService.getReleaseAssets(release.id)

  const asset = assets.find(a => a.name === name)

  if (!asset) {
    if (notFoundBehavior === 'output') {
      core.setOutput('file-not-found', 'true')
      return
    }

    core.setFailed(`File not found in release ${releaseTag}: ${name}`)
    return
  }

  const headers = {
    Accept: 'application/octet-stream',
    Authorization: 'token ' + token
  }

  await axios({
    method: 'get',
    url: asset.url,
    headers: headers,
    responseType: 'stream'
  }).then(resp => {
    resp.data.pipe(fs.createWriteStream(filePath))
  })
}
