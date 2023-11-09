import github from '@actions/github'
import fs from 'fs'

type RepoData = {
  owner: string
  repo: string
}

export type Asset = {
  url: string
  browser_download_url: string
  id: number
  node_id: string
  name: string
  label: string
  state: 'uploaded' | 'open'
  content_type: string
  size: number
  download_count: number
  created_at: string
  updated_at: string
  uploader: {
    login: string
    id: number
    node_id: string
    avatar_url: string
    gravatar_id: string
    url: string
    html_url: string
    followers_url: string
    following_url: string
    gists_url: string
    starred_url: string
    subscriptions_url: string
    organizations_url: string
    repos_url: string
    events_url: string
    received_events_url: string
    type: string
    site_admin: false
  }
}

const HEADERS_BASE = {
  'X-GitHub-Api-Version': '2022-11-28'
}

export class AssetsService {
  private octokit: ReturnType<typeof github.getOctokit>
  private repoData: RepoData

  constructor(
    private token: string,
    private releaseTag: string
  ) {
    this.octokit = github.getOctokit(this.token)

    if (!process.env.GITHUB_REPOSITORY) {
      throw new Error('GITHUB_REPOSITORY not set')
    }

    const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/')
    this.repoData = { owner, repo }
  }

  async getRelease() {
    const result = await this.octokit.request(
      'GET /repos/{owner}/{repo}/releases/tags/{tag}',
      {
        ...this.repoData,
        tag: this.releaseTag,
        headers: HEADERS_BASE
      }
    )

    const release = result.data

    if (!release) {
      throw new Error(`Release ${this.releaseTag} not found`)
    }

    if (release.draft) {
      throw new Error(`Skipping release: ${this.releaseTag} is a draft`)
    }

    return release
  }

  async getReleaseAssets(release_id: number) {
    const result = await this.octokit.request(
      'GET /repos/{owner}/{repo}/releases/{release_id}/assets',
      {
        ...this.repoData,
        release_id: release_id,
        headers: HEADERS_BASE
      }
    )

    return result.data as Asset[]
  }

  async deleteAsset(asset_id: number) {
    await this.octokit.request(
      'DELETE /repos/{owner}/{repo}/releases/assets/{asset_id}',
      {
        ...this.repoData,
        asset_id,
        headers: HEADERS_BASE
      }
    )
  }

  async uploadAsset(
    release_id: number,
    data: fs.ReadStream,
    contentType: string,
    contentLength: number,
    name?: string,
    label?: string
  ) {
    const fileRes = await this.octokit.request(
      'POST /repos/{owner}/{repo}/releases/{release_id}/assets{?name,label}',
      {
        ...this.repoData,
        release_id: release_id,
        data,
        name,
        label,
        headers: {
          ...HEADERS_BASE,
          'content-type': contentType,
          'content-length': contentLength
        }
      }
    )

    return fileRes.data as Asset
  }
}
