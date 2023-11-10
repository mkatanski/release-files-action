export type Config = {
  token: string
  releaseTag: string
  filePath: string
  name: string
  label: string
  contentType: string
  mode: string
}

export type Runner = (config: Config) => Promise<void>
