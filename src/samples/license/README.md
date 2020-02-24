<p>
  <a href="https://www.npmjs.com/package/uipath-orchestrator-api-node" target="_blank">
    <img alt="Version" src="https://img.shields.io/npm/v/uipath-orchestrator-api-node.svg">
  </a>
  <a href="https://github.com/masatomix/uipath-orchestrator-api-node#readme" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://github.com/masatomix/uipath-orchestrator-api-node/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  </a>
  <a href="https://github.com/masatomix/uipath-orchestrator-api-node/blob/master/LICENSE" target="_blank">
    <img alt="License: Apache--2.0" src="https://img.shields.io/github/license/masatomix/uipath-orchestrator-api-node" />
  </a>
</p>

## サンプルを実行してみる

```console
$ npx ts-node src/samples/license/licenseSample.ts
```

下記のような JSON データが出力されると思います。

ライセンス:

```json
{
  "@odata.context": "https://xxx/odata/$metadata#UiPath.Orchestrator.Application.Dto.License.LicenseDto",
  "HostLicenseId": null,
  "Id": 4,
  "ExpireDate": 1601528400,
  "GracePeriodEndDate": 1601528400,
  "GracePeriod": null,
  "AttendedConcurrent": true,
  "DevelopmentConcurrent": true,
  "StudioXConcurrent": false,
  "IsRegistered": true,
  "IsExpired": false,
  "CreationTime": "2019-12-17T17:19:23.7Z",
  "Code": "386xxx",
  "Allowed": { "Unattended": 10, "Attended": 10, "NonProduction": 10, "Development": 10, "StudioX": 0 },
  "Used": { "Unattended": 1, "Attended": 0, "NonProduction": 0, "Development": 1, "StudioX": 0 }
}
```

だいたいこんな結果が得られます。

## コード抜粋

```typescript
import config from 'config'
import OrchestratorApi from '../../index'
import logger from '../../logger'

async function sample() {
  const api = new OrchestratorApi(config)

  // まずは認証
  await api.authenticate()
  try {
    // ライセンスを取得する
    const license: any = await api.license.find()
    logger.info(license)
  } catch (error) {
    logger.error(error)
  }
}

if (!module.parent) {
  ;(async () => {
    await sample()
  })()
}
```
