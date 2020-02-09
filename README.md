# uipath-orchestrator-api-node

UiPath Orchestrator のAPIを、Node.jsから呼び出すライブラリです。

```
const api = new OrchestratorApi(config)
// まずは認証
await api.authenticate()

// ロボットを取得する
const robots: any[] = await api.robot.findAll()
for (const robot of robots) {
  console.log(robot)
}
```

こんな感じでOrchestrator上の情報をAPI経由で取得します。


## 前準備

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

という設定ファイルを作成しておいてください。

## 利用方法(TypeScriptから)

最終的に、ディレクトリ構成はこんな感じになります。

```
$ tree
.
├── src
│   └── index.ts
├── config
│   └── local.json
├── package.json
└── tsconfig.json
$
```

それぞれのファイルは以下のようにします。

```
$ cat package.json 
{
  "name": "api_use_ts",
  "version": "1.0.0",
  "description": "",
  "main": "dist/index.js",
  "scripts": {
     "tsc": "tsc",
     "start": "node ."
  },
  "license": "ISC",
  "devDependencies": {
    "@types/config": "0.0.36",
    "@types/node": "^13.7.0",
    "npm-run-all": "^4.1.5",
    "typescript": "^3.7.5"
  },
  "dependencies": {
    "config": "^3.2.5",
    "uipath-orchestrator-api-node": "^0.2.0"
  }
}
```

```
$ cat tsconfig.json 
{
    "compilerOptions": {
      "target": "ES2019", 
      "module": "commonjs", 
      "sourceMap": true, 
      "outDir": "./dist", 
      "strict": true, 
      "esModuleInterop": true,
      "forceConsistentCasingInFileNames": true 
    },
    "include": [
      "src/**/*"
    ],
}
$
```

```
$ cat src/index.ts 
import config from 'config'
import OrchestratorApi from 'uipath-orchestrator-api-node'

async function main() {
    const api = new OrchestratorApi(config)
    // まずは認証
    await api.authenticate()

    // ロボットを取得する
    const robots: any[] = await api.robot.findAll()
    for (const robot of robots) {
        console.log(robot)
    }

    // ライセンスを取得する
    const license: any = await api.license.find()
    console.log(license)
}

if (!module.parent) {
    main()
}
$ 
```

実行してみます。
```
$ npm i
$ npx tsc
$ node dist/index.js
```


## 改訂履歴

- 0.2.0 メソッド追加、インタフェース仕様変更
- 0.1.0 初版作成
