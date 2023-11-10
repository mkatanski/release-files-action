import * as core from '@actions/core'
import fs from 'fs'
import { Runner } from './commonTypes'
import { downloadReleaseAsset } from './downloadReleaseAsset'

export const downloadFile: Runner = async ({
  filePath,
  name,
  releaseTag,
  token
}) => {
  if (fs.existsSync(`${filePath}/${name}`)) {
    core.setFailed(`File found at path: ${filePath}/${name}. Cannot overwrite.`)
    return
  }

  if (!process.env.GITHUB_REPOSITORY) {
    throw new Error('GITHUB_REPOSITORY not set')
  }

  const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/')

  await downloadReleaseAsset({
    owner: 'mkatanski',
    repo: 'release-files-action',
    tag: releaseTag,
    file: name,
    filePath,
    token
  })
}
