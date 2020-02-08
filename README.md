# uipath-orchestrator-api-node

UiPath Orchestrator のAPIを、Node.jsから呼び出すライブラリです。

## インストール


```
$ npm i  uipath-orchestrator-api-node --save
```


UiPath Orchestrator がEnterprise版の場合:

```
$ cat config/local.json
{
  "userinfo": {
    "tenancyName": "default",
    "usernameOrEmailAddress": "admin",
    "password": "xxxxxx"
  },
  "serverinfo": {
    "servername": "https://www.example.com/"
  }
}
```

UiPath Orchestrator がCommunity版の場合:

```
$ cat config/local.json
{
  "serverinfo": {
    "servername": "https://platform.uipath.com/[AccountLogicalName]/[ServiceName]",
    "refresh_token": "[User Key]",
    "tenant_logical_name": "[Tenant Logical Name]",
    "client_id": "[Client Id]]"
  }
}
```

という設定ファイルを作成して、

```
$ npx tsc
$ node dist/index.js
```


サンプルコード(index.ts)

```
import config from 'config'
import OrchestratorApi from 'uipath-orchestrator-api-node'

async function main() {
    const api = new OrchestratorApi(config)

    // まずは認証
    await api.authenticate()

    // ロボットを取得する
    const robots: any[] = await api.getRobots()
    for (const robot of robots) {
        console.log(robot)
    }

    // ライセンスを取得する
    const license: any = await api.getLicense()
    console.log(license)
}

if (!module.parent) {
    main()
}
```
