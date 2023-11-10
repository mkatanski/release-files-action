# Release Files Action
GitHub Action for uploading or downloading assets to or from existing release.

## Inputs

```yaml
  token:
    description: 'GitHub token'
    type: string
    required: true

  release-tag:
    description: 'Tag releated to release'
    type: string
    required: true

  file-path:
    description: 'File path to upload or download'
    type: string
    required: true

  name:
    description: 'Asset name (default to file-path name)'
    type: string
    required: false

  label:
    description: 'Asset label'
    type: string
    required: false

  content-type:
    description: 'File content type'
    type: string
    default: 'application/zip'
    required: false

  mode:
    description: 'Choose to download or upload asset'
    type: string
    default: upload
    required: false
```


Example usage:

```yml

jobs:
  upload-release-assets:
    runs-on: ubuntu-latest
    name: Upload release assets
    steps:
      - uses: actions/checkout@v4

      - name: Create artifact from dist folder
        run: zip -r release-files-dist-${{ github.ref_name }}.zip dist

      - name: Upload created artifact to release assets
        id: upload-assets
        uses: ./
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          release-tag: ${{ github.ref_name }}
          file-path: release-files-dist-${{ github.ref_name }}.zip

  download-release-assets:
    runs-on: ubuntu-latest
    name: Download release assets
    needs: upload-release-assets
    steps:
      - uses: actions/checkout@v4

      - name: Download release assets
        id: download-assets
        uses: ./
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          release-tag: ${{ github.ref_name }}
          file-path: downloaded-${{ github.ref_name }}.zip
          name: release-files-dist-${{ github.ref_name }}.zip
          mode: download


```
