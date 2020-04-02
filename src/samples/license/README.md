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


## サンプルコード

```typescript
import config from 'config'
import OrchestratorApi from '../../index'
import { getLogger } from '../../logger'

const logger = getLogger('main')

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
  (async () => {
    await sample()
  })()
}
```



## Orchestrator API との対応表

- find ()
    - GET ``/odata/Settings/UiPath.Server.Configuration.OData.GetLicense``
