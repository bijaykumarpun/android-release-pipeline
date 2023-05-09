# android-release-pipeline
 <div style={display:flex;}>

<img src="https://img.shields.io/github/languages/code-size/bijaykumarpun/android-release-pipeline?style=flat-square"/>
<!-- <img src="https://img.shields.io/github/downloads/bijaykumarpun/android-release-pipeline/total"/> -->
<img src="https://img.shields.io/github/last-commit/bijaykumarpun/android-release-pipeline?style=flat-square"/>
</div><br>

> `git push origin PlayStore`


 GitHub Action for releasing Android app `straight` to Play Store
 


  


### Required Inputs
- #### packageName
    Application package name
- #### serviceAccountJson
    Service account JSON file content
- #### releaseFileDir
    Release file directory
- #### track
    Release track
- #### mappingFileDir
    Mapping file directory
    
### Usage Example
```yaml
  - name: Release to PlayStore
        uses: BijayKumarPun/android-release-pipeline@v1.0.0-alpha
        with:
          serviceAccountJson: ${{vars.SERVICE_ACCOUNT_JSON}}
          packageName:  ${{vars.PACKAGE_NAME}}
          releaseFileDir: 'app/build/outputs/bundle/release/app-release.aab'
          mappingFileDir: 'app/build/outputs/mapping/release/mapping.txt'
          track: 'production'
```

### License
<img src="https://img.shields.io/badge/license-MIT-brightgreen?style=flat-square"/>


