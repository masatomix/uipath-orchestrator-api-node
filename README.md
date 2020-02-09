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

実行結果

```
{
  LicenseKey: null,
  MachineName: 'PBPC0124',
  MachineId: 4,
  Name: 'PBPC0124_kino',
  Username: 'xx\\kino',
  ExternalName: null,
  Description: null,
  Version: '19.10.2.0',
  Type: 'Development',
  HostingType: 'Standard',
  ProvisionType: 'Manual',
  Password: null,
  CredentialStoreId: null,
  UserId: null,
  CredentialType: null,
  RobotEnvironments: 'Main',
  IsExternalLicensed: false,
  Id: 2,
  ExecutionSettings: null }
{
  ...
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
    "uipath-orchestrator-api-node": "latest"
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






## 利用方法(JavaScriptから)

最終的に、ディレクトリ構成はこんな感じになります。

```
$ tree
.
├── config
│   └── local.json
├── index.js
└── package.json

$
```

それぞれのファイルは以下のようにします。

```
$ cat package.json 
{
  "name": "api_use",
  "version": "1.0.3",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "uipath-orchestrator-api-node": "latest",
    "config": "^3.2.5"
  }
}
```



```
$ cat index.js 
const config = require('config')
const OrchestratorApi = require('uipath-orchestrator-api-node')

const oc = new OrchestratorApi(config)

const main = async () => {
  const token = await oc.authenticate()
  const robots = await oc.robot.findAll()
  for (const robot of robots) {
    console.log(robot)
  }
}

if (!module.parent) {
  main()
$ 
```

実行してみます。

```
$ npm i
$ node index.js
```

## ソースコードなどリポジトリ

- https://github.com/masatomix/uipath-orchestrator-api-node
- https://www.npmjs.com/package/uipath-orchestrator-api-node


## 改訂履歴

- 0.2.3 user はCRUD作成完了、UnitTest追加( jest )、API に、汎用的なメソッドを追加。requestライブラリはformでなげると application/x-www-form-urlencoded になるのでjsonに変更
- 0.2.0 Id指定でのロボットの取得、プロセス一覧の取得、対象オブジェクトごとにメソッドを整理、Enterprise/Community版 両対応
- 0.1.0 初版作成