import * as core from '@actions/core'
import fs from 'fs'
import { AssetsService } from './AssetsService'
import { Runner } from './commonTypes'
import { mkdir, writeFile } from 'fs/promises'
import { dirname } from 'path'

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

  const {
    body,
    headers: { accept, 'user-agent': userAgent },
    method,
    url
  } = assetsService.getReleaseAssetEndpoint(asset.id)

  if (!process.env.GITHUB_REPOSITORY) {
    throw new Error('GITHUB_REPOSITORY not set')
  }

  const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/')

  let headers: HeadersInit = {
    accept: accept || 'application/octet-stream',
    authorization: `token ${token}`,
    'user-agent': repo
  }

  if (typeof userAgent !== 'undefined')
    headers = { ...headers, 'user-agent': userAgent }

  console.log('headers', headers)
  console.log('url', url)
  console.log('method', method)
  console.log('body', body)

  const response = await fetch(url, { body, headers, method })
  if (!response.ok) {
    const text = await response.text()
    core.warning(text)
    throw new Error('Invalid response')
  }
  const blob = await response.blob()
  const arrayBuffer = await blob.arrayBuffer()

  await mkdir(dirname(filePath), { recursive: true })
  void (await writeFile(filePath, new Uint8Array(arrayBuffer)))
}
