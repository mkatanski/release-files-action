import * as core from '@actions/core'
import fs from 'fs'
import { AssetsService } from './AssetsService'
import { Runner } from './commonTypes'
import { downloadReleaseAsset } from './downloadReleaseAsset'

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

  if (!process.env.GITHUB_REPOSITORY) {
    throw new Error('GITHUB_REPOSITORY not set')
  }

  const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/')

  await downloadReleaseAsset({
    owner,
    repo,
    tag: releaseTag,
    file: name,
    filePath,
    token
  })
}
