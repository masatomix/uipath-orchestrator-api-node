# uipath-orchestrator-api-node

[UiPath Orchestrator のAPI](https://docs.uipath.com/orchestrator/lang-ja/reference#about-odata-and-references) を、Node.jsから呼び出すライブラリです。


## Installation

```
$ npm install uipath-orchestrator-api-node
```

## Quick Examples

### Robot一覧を取得する

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

こんな感じでOrchestrator上の情報をAPI経由で取得することができます。


### 条件を指定してみる

検索条件を指定することで、条件に合致するリソースを検索することもできます。


```
const api = new OrchestratorApi(config)
await api.authenticate()

// ロボットを取得する
const machinename = 'PBPC0124'
const userName = 'xx\\kino'
const robots: any[] = await api.robot.findAll({
  $filter: `MachineName eq '${machinename}' and Username eq '${userName}'`,
})
console.log(robots)
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
  ExecutionSettings: null
}
```

プロパティ名と値を指定することで、条件に一致するRobotを検索することができました。
条件指定は ``$filter`` 以外にもいくつかありますが、その仕様は [API リクエストの構築](https://docs.uipath.com/orchestrator/lang-ja/reference#building-api-requests) ココに詳しく書いてあります。


## 使用するための前準備

さて、本来ブラリを使用するには、接続するUiPath Orchestratorの接続上などの環境設定が必要です。


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

実行してみます。

```
$ npm i
$ node index.js
```

## 設定ファイル書き方いろいろ

ちなみに設定ファイルは Own Coding で、

```
const api2 = new OrchestratorApi({
  userinfo: {
    tenancyName: 'default',
    usernameOrEmailAddress: 'aaa',
    password: 'bbb',
  },
  serverinfo: {
    servername: 'https://platform.uipath.com/',
  },
})
```

などとしてもOKですし、

``NODE_CONFIG='{"userinfo":{"tenancyName":...}' node dist/index.js ``

などと実行時の環境変数として渡してあげてもOKです。



## ソースコードなどリポジトリ

- https://github.com/masatomix/uipath-orchestrator-api-node
- https://www.npmjs.com/package/uipath-orchestrator-api-node


## 改訂履歴

- 0.2.5 findAllもOptionalな引数を追加(GETのパラメタとして)。ActionsでUTするように整理
- 0.2.3 user はCRUD作成完了、UnitTest追加( jest )、API に、汎用的なメソッドを追加。requestライブラリはformでなげると application/x-www-form-urlencoded になるのでjsonに変更
- 0.2.0 Id指定でのロボットの取得、プロセス一覧の取得、対象オブジェクトごとにメソッドを整理、Enterprise/Community版 両対応
- 0.1.0 初版作成