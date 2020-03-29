## サンプルを実行してみる

```console
$ npx ts-node src/samples/asset/assetSample.ts
```

下記のような JSON データが出力されると思います。

アセット:

```json
{
  "Name": "asset009",
  "CanBeDeleted": true,
  "ValueScope": "PerRobot",
  "ValueType": "Integer",
  "Value": "200",
  "StringValue": "",
  "BoolValue": false,
  "IntValue": 200,
  "CredentialUsername": "",
  "CredentialPassword": "",
  "ExternalName": "",
  "CredentialStoreId": null,
  "HasDefaultValue": true,
  "Description": "テスト",
  "Id": 152,
  "KeyValueList": [],
  "RobotValues": [
    {
      "RobotId": 579,
      "RobotName": "WINDOWS",
      "KeyTrail": "***5b6da2c",
      "ValueType": "Integer",
      "StringValue": "",
      "BoolValue": false,
      "IntValue": 100,
      "Value": "100",
      "CredentialUsername": "",
      "CredentialPassword": "",
      "ExternalName": "",
      "CredentialStoreId": null,
      "Id": 161,
      "KeyValueList": []
    }
  ]
}
```


```console
┌─────────┬────────────┬──────────────┬────────────┬───────────┬─────────┬─────────────┬───────────┬──────────┬────────────────────┬────────────────────┬──────────────┬───────────────────┬─────────────────┬─────────────┬─────┬──────────────┬──────────────┐
│ (index) │    Name    │ CanBeDeleted │ ValueScope │ ValueType │  Value  │ StringValue │ BoolValue │ IntValue │ CredentialUsername │ CredentialPassword │ ExternalName │ CredentialStoreId │ HasDefaultValue │ Description │ Id  │ KeyValueList │ RobotValues  │
├─────────┼────────────┼──────────────┼────────────┼───────────┼─────────┼─────────────┼───────────┼──────────┼────────────────────┼────────────────────┼──────────────┼───────────────────┼─────────────────┼─────────────┼─────┼──────────────┼──────────────┤
│    0    │ 'asset002' │     true     │  'Global'  │  'Text'   │ 'A100'  │   'A100'    │   false   │    0     │         ''         │         ''         │      ''      │       null        │      true       │    'テスト'    │ 144 │      []      │      []      │
│    1    │ 'asset008' │     true     │  'Global'  │  'Text'   │ 'A100'  │   'A100'    │   false   │    0     │         ''         │         ''         │      ''      │       null        │      true       │    'テスト'    │ 148 │      []      │      []      │
│    2    │ 'asset009' │     true     │ 'PerRobot' │ 'Integer' │  '200'  │     ''      │   false   │   200    │         ''         │         ''         │      ''      │       null        │      true       │    'テスト'    │ 152 │      []      │ [ [Object] ] │
│    3    │    'B'     │     true     │  'Global'  │  'Bool'   │ 'False' │     ''      │   false   │    0     │         ''         │         ''         │      ''      │       null        │      true       │    null     │ 151 │      []      │      []      │
└─────────┴────────────┴──────────────┴────────────┴───────────┴─────────┴─────────────┴───────────┴──────────┴────────────────────┴────────────────────┴──────────────┴───────────────────┴─────────────────┴─────────────┴─────┴──────────────┴──────────────┘
asset009 のRobot毎の値:
┌─────────┬─────────┬───────────┬──────────────┬───────────┬─────────────┬───────────┬──────────┬───────┬────────────────────┬────────────────────┬──────────────┬───────────────────┬─────┬──────────────┐
│ (index) │ RobotId │ RobotName │   KeyTrail   │ ValueType │ StringValue │ BoolValue │ IntValue │ Value │ CredentialUsername │ CredentialPassword │ ExternalName │ CredentialStoreId │ Id  │ KeyValueList │
├─────────┼─────────┼───────────┼──────────────┼───────────┼─────────────┼───────────┼──────────┼───────┼────────────────────┼────────────────────┼──────────────┼───────────────────┼─────┼──────────────┤
│    0    │   579   │ 'WINDOWS' │ '***5b6da2c' │ 'Integer' │     ''      │   false   │   100    │ '100' │         ''         │         ''         │      ''      │       null        │ 161 │      []      │
└─────────┴─────────┴───────────┴──────────────┴───────────┴─────────────┴───────────┴──────────┴───────┴────────────────────┴────────────────────┴──────────────┴───────────────────┴─────┴──────────────┘
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
    let assets: any[] = await api.asset.findAllEx()
    console.table(assets)

    for (const asset of assets) {
      if (asset.ValueScope === 'PerRobot') {
        const robotValues: Array<any> = asset.RobotValues
        console.log(`${asset.Name} のRobot毎の値:`)
        console.table(robotValues)
      }
    }

    assets = await api.asset.findAllEx()
    assets = assets.filter(asset => asset.ValueScope === 'PerRobot')
    console.log(assets[0])
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

- findAll (queries?: any)
    - GET ``/odata/Assets``
- findAllEx (queries?: any)
    - GET ``/odata/Assets`` に、{ $expand: 'RobotValues' } を追加
- find (id: number)
    - GET ``/odata/Assets(${id})``
- create (asset: any) 
    - POST ``/odata/Assets``
- update (asset: any)
    - PUT ``/odata/Assets(${asset.Id})``
- delete (id: number)
    - DELETE ``/odata/Assets(${id})``