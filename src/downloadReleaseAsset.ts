import * as core from '@actions/core'
import fs from 'fs'
import axios from 'axios'
import axiosRetry from 'axios-retry'

axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay
})

export type Options = {
  owner: string
  repo: string
  tag: string
  file: string
  filePath: string
  token: string
}

export async function downloadReleaseAsset({
  owner,
  repo,
  tag,
  file,
  token,
  filePath
}: Options) {
  const api = 'https://api.github.com'

  // Get release
  const url = `${api}/repos/${owner}/${repo}/releases/tags/${tag}`

  let headers = {
    Accept: 'application/json',
    Authorization: 'token ' + token
  }

  let resp = await axios({
    method: 'get',
    url,
    headers: headers
  })
  const assetsData = resp.data

  // Construct regex
  let re
  if (file[0] == '/' && file[file.length - 1] == '/') {
    re = new RegExp(file.substr(1, file.length - 2))
  } else {
    re = new RegExp('^' + file + '$')
  }

  // Get assets
  let assets = []
  for (let a of assetsData.assets) {
    if (re.test(a.name)) {
      assets.push(a)
    }
  }

  // Download assets
  headers = {
    Accept: 'application/octet-stream',
    Authorization: 'token ' + token
  }

  await Promise.all(
    assets.map(a =>
      axios({
        method: 'get',
        url: a.url,
        headers: headers,
        responseType: 'stream'
      }).then(resp => {
        resp.data.pipe(fs.createWriteStream(filePath))
      })
    )
  )
}
