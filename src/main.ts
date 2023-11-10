import * as core from '@actions/core'
import { isNativeError } from 'util/types'
import { Config, Runner } from './commonTypes'
import { uploadFile } from './uploadFile'
import { downloadFile } from './downloadFile'

const getFileName = () => {
  if (!core.getInput('name', { required: false })) {
    const filePath = core.getInput('file-path', { required: true })
    const name = filePath.split('/').pop()

    if (!name) {
      throw new Error('Could not determine file name')
    }

    return name
  }

  return core.getInput('name', { required: false })
}

async function run() {
  try {
    const config: Config = {
      token: core.getInput('token', { required: true }),
      releaseTag: core.getInput('release-tag', { required: true }),
      filePath: core.getInput('file-path', { required: true }),
      name: getFileName(),
      label: core.getInput('label', { required: false }),
      contentType: core.getInput('content-type', { required: false }),
      mode: core.getInput('mode', { required: false })
    }

    if (config.mode !== 'upload' && config.mode !== 'download') {
      core.setFailed('Invalid mode. Must be either "upload" or "download"')
      return
    }

    const runner: Runner = config.mode === 'upload' ? uploadFile : downloadFile

    await runner(config)
  } catch (e) {
    const message = isNativeError(e) ? e.message : 'Unknown error'
    core.setFailed(message)
  }
}

run()
