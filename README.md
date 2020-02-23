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

<p><img alt="Node.js CI" src="https://github.com/masatomix/uipath-orchestrator-api-node/workflows/Node.js%20CI/badge.svg?branch=master" /></p>

# uipath-orchestrator-api-node

[UiPath Orchestrator のAPI](https://docs.uipath.com/orchestrator/lang-ja/reference#about-odata-and-references) を、Node.jsから呼び出すライブラリです。


## Table of Contents

- [Installation](#installation)
- [Quick Examples](#quick-examples)
    - [Robot一覧を取得する](#get-a-list-of-robots)
    - [条件を指定してみる](#search-for-robots)
- [API対応状況](#development-status)
- [使用するための前準備](#preferences)
- [使い方](#usage)
    - [利用方法(TypeScriptから)](#how-to-use-in-typescript)
    - [利用方法(JavaScriptから)](#how-to-use-in-javascript)
    - [設定ファイル書き方いろいろ](#how-to-customize-with-configuration-file)
- [ソースコードなどリポジトリ](#source-and-npm-repository)
- [改訂履歴](#revision-history)


## Installation

```console
$ npm install uipath-orchestrator-api-node
```

## Quick Examples

### Get a list of Robots

**ロボット一覧を取得**してみます。

```typescript
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

```typescript
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

このように、Orchestrator上の情報をAPI経由で取得することができます。


### Search for Robots

**検索条件を指定**することで、条件に合致するリソースを検索することもできます。

```typescript
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

```typescript
[
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
]
```

``「`MachineName eq '${machinename}' and Username eq '${userName}'`」``などとRobotの
プロパティ名とその値を指定することで、条件に一致するRobotを検索することができました。
条件指定は ``$filter`` 以外にも ``$top`` や ``$select`` などいくつかありますが、その仕様は [API リクエストの構築](https://docs.uipath.com/orchestrator/lang-ja/reference#building-api-requests) のサイトに詳しく書いてあります。


## Development status

**対応状況**(2020/02/22時点)

各APIへの対応状況です。専用のメソッドを用意しているモノに「〇」をつけています。用意していない場合も汎用のメソッドを呼び出す事で、基本的にどのAPIも呼び出すことが可能だと思います。
専用メソッドの実装は気まぐれでやってるので、割と歯抜けでスイマセン。。



| No. | リソース        | 検索(findAll) | 検索(find) | 作成(create) | 更新(update) | 削除(delete) | その他                                                                                                                   | 備考           |
|:---:|-----------------|:-------------:|:----------:|:------------:|:------------:|:------------:|--------------------------------------------------------------------------------------------------------------------------|----------------|
|  1  | license         |       〇      |            |              |              |              |                                                                                                                          |                |
|  2  | [robot](https://github.com/masatomix/uipath-orchestrator-api-node/blob/develop/src/samples/machine_robot/)           |       〇      |     〇     |      〇      |      〇      |      〇      |                                                                                                                          |                |
|  3  | [user](https://github.com/masatomix/uipath-orchestrator-api-node/tree/develop/src/samples/user)            |       〇      |     〇     |      〇      |      〇      |      〇      | 名前で検索(findByUserName)                                                                                               |                |
|  4  | [machine](https://github.com/masatomix/uipath-orchestrator-api-node/blob/develop/src/samples/machine_robot/)         |       〇      |     〇     |      〇      |      〇      |      〇      |                                                                                                                          |                |
|  5  | process         |       〇      |            |              |              |              |                                                                                                                          |                |
|  6  | schedule        |       〇      |            |              |              |              |                                                                                                                          |                |
|  7  | queueDefinition |       〇      |     〇     |      〇      |      〇      |      〇      | 名前で検索(findByName)                                                                                                   |                |
|  8  | queueItem       |       〇      |     〇     |      〇      |              |      〇      |                                                                                                                          | 削除は論理削除 |
|  9  | queueOperation  |               |            |              |              |              | TransactionのスタートでqueueItemを取得(getQueueAndStartTransaction)<br>Transactionのステータス変更(setTransactionResult) |                |
|  10 | 汎用            |       〇      |     〇     |      〇      |      〇      |      〇      | getArray<br>getData<br>postData<br>putData<br>deleteData                                                                 |                |




## Preferences

さて本ライブラリを使用するには、接続するUiPath Orchestratorの情報など**環境設定**が必要です。

UiPath Orchestrator がEnterprise版の場合:

```json
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

```json
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

## Usage

### How to use in TypeScript

**TypeScriptから利用する方法**です。
最終的に、ディレクトリ構成はこんな感じになります。

```console
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

それぞれのファイルはたとえば以下のようにします。

```typescript
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
```

```json
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


```json
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
```

実行してみます。

```console
$ npm i
$ npx tsc
$ node dist/index.js
```


### How to use in JavaScript

**JavaScriptから利用する方法**です。
最終的に、ディレクトリ構成はこんな感じになります。

```console
$ tree
.
├── config
│   └── local.json
├── index.js
└── package.json

$
```

それぞれのファイルは以下のようにします。


```typescript
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
}
```


```json
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

```console
$ npm i
$ node index.js
```

### How to customize with configuration file

ちなみに設定ファイルは Own Coding で、

```typescript
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



## source and npm repository

**ソースコードやnpmのリポジトリ**です。

- https://github.com/masatomix/uipath-orchestrator-api-node
- https://www.npmjs.com/package/uipath-orchestrator-api-node


## Revision history

改訂履歴

- 0.3.4 ODataを[そのまま返すオプション](https://github.com/masatomix/uipath-orchestrator-api-node/blob/develop/src/index.ts#L33)を追加。[UserのCRUD](https://github.com/masatomix/uipath-orchestrator-api-node/tree/develop/src/samples/user)追加。
- 0.3.3 [Robot/Machine のCRUD](https://github.com/masatomix/uipath-orchestrator-api-node/tree/develop/src/samples/machine_robot)作成完了。テストコードも追加。Loggerの設定を見なおし。設定ファイルに外だし。
- 0.3.2 認証ナシプロキシを設定できるように。電文を見たいときなどデバッグ時にご活用ください
- 0.3.1 Queue/Transactionを操作するAPIに対応。
- 0.3.0 QueueItemのCRUDを追加(もともとqueueって名前だったけどqueueItemに変更しました)。QueueDefinitionのCRUDを追加
- 0.2.5 findAllもOptionalな引数を追加(GETのパラメタとして)。ActionsでUTするように整理
- 0.2.3 user はCRUD作成完了、UnitTest追加( jest )、API に、汎用的なメソッドを追加。requestライブラリはformでなげると application/x-www-form-urlencoded になるのでjsonに変更
- 0.2.0 Id指定でのロボットの取得、プロセス一覧の取得、対象オブジェクトごとにメソッドを整理、Enterprise/Community版 両対応
- 0.1.0 初版作成



## Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/masatomix/uipath-orchestrator-api-node/issues).

## Show your support

Give a ⭐️ if this project helped you!

## License

Copyright © 2020 [Masatomi KINO](https://github.com/masatomix).<br />
This project is [Apache--2.0](https://github.com/masatomix/uipath-orchestrator-api-node/blob/master/LICENSE) licensed.

***
_This README was generated by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_