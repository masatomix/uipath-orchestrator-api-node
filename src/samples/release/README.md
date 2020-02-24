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

だいたいこんな結果が得られます。

**ProcessKey** とありますが、この値は画面上に表示されるプロセスの「名前」です。

![release01.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/73777/1c27be55-340d-ecd2-5463-4023a6c2a9d2.png)

また **Name** が、タスクトレイに表示されるワークフロー名となります。

![release02.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/73777/2e23bbdc-789b-7d93-d0f9-e31e8b445650.png)

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
