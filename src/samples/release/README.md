## サンプルを実行してみる

```console
$ npx ts-node src/samples/release/releaseSample.ts
```

下記のような JSON データが出力されると思います。

リリース:

```json
[
  {
    "Key": "bb2cxxxx-xxxxx",
    "ProcessKey": "MyAttendedFramework",
    "ProcessVersion": "1.0.2",
    "IsLatestVersion": false,
    "IsProcessDeleted": false,
    "Description": "",
    "Name": "MyAttendedFramework_Main",
    "EnvironmentId": 3,
    "EnvironmentName": "Main",
    "InputArguments": null,
    "Id": 12,
    "Arguments": { "Input": null, "Output": null },
    "ProcessSettings": null
  } ...
]
```

**ProcessKey** とありますが、この値は画面上に表示されるプロセスの「名前」です。

![release01.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/73777/1c27be55-340d-ecd2-5463-4023a6c2a9d2.png)

また **Name** が、タスクトレイに表示されるワークフロー名となります。

![release02.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/73777/2e23bbdc-789b-7d93-d0f9-e31e8b445650.png)

## サンプルコード

```typescript
import config from 'config'
import OrchestratorApi from '../../index'
import logger from '../../logger'

async function sample() {
  const api = new OrchestratorApi(config)

  // まずは認証
  await api.authenticate()
  try {
    const releases: any[] = await api.release.findAll()
    logger.info(releases)

    const release: any = await api.release.findByProcessKey('MyAttendedFramework') // 画面の名前でも検索できる
    logger.info(release)
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



## Orchestrator API との対応表

- findAll (queries?: any)
    - GET ``/odata/Releases``
- findByProcessKey (processKey: string)
    - GET ``/odata/Releases`` に `` $filter: `ProcessKey eq '${processKey}'` ``