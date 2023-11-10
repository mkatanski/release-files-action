import got from 'got'
import { pipeline } from 'stream'
import { createWriteStream } from 'fs'
import { promisify } from 'util'
const asyncPipeline = promisify(pipeline)

type TDownload = {
  owner: string
  repo: string
  assetId: number
  toLocalFile: string
  githubToken?: string
}

export async function downloadGithubAsset(dl: TDownload) {
  const token = dl.githubToken || process.env.GITHUB_TOKEN
  return asyncPipeline(
    got.stream(
      `https://api.github.com/repos/${dl.owner}/${dl.repo}/releases/assets/${dl.assetId}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/octet-stream',
          Authorization: `token ${token}`,
          'User-Agent': ''
        }
      }
    ),
    createWriteStream(dl.toLocalFile)
  )
}
