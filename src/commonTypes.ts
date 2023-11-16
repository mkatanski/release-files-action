export type Config = {
  token: string
  releaseTag: string
  filePath: string
  name: string
  label: string
  contentType: string
  mode: string
  notFoundBehavior: 'error' | 'output'
}

export type Runner = (config: Config) => Promise<void>
