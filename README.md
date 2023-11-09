# Release Files Action
GitHub Action for uploading files and artifacts to existing release.

Example usage:

```yml

jobs:
    upload-artifacts:
        name: 'Upload artifacts to current release'
        runs-on: ubuntu-latest
        steps:
            - uses: @mkatanski/release-files-action@1
            - with:
                token: ${{ secrets.GITHUB_API }}
                release-tag: ${{ github.ref_name }}
                file: my-app-${{ github.ref_name }}.zip
                name: my-app-${{ github.ref_name }}.zip


```
