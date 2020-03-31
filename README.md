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
- [ドキュメント](#documents)
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

## Documents

[こちら](https://github.com/masatomix/uipath-orchestrator-api-node/tree/develop/src/samples) に、サンプルとともにドキュメントを整理しています。


## Development status

**対応状況**(2020/03/29時点)

各APIへの対応状況です。専用のメソッドを用意しているモノに「〇」をつけています。用意していない場合も汎用のメソッドを呼び出す事で、基本的にどのAPIも呼び出すことが可能だと思います。
専用メソッドの実装は気まぐれでやってるので、割と歯抜けでスイマセン。。


| No. | リソース | 検索<br>(findAll) | 検索<br>(find) | 作成<br>(create) | 更新<br>(update) | 削除<br>(delete) | 一括更新<br>(upload) | その他 | 備考 |
|:---:|-----------------|:-----------------:|:--------------:|:----------------:|:----------------:|:----------------:|:----------------------------:|----------------------------------------------------------------------------------------------------------------------------------------------|----------------|
| 1 | [license](https://github.com/masatomix/uipath-orchestrator-api-node/blob/develop/src/samples/license/) | 〇 |  |  |  |  |  |  |  |
| 2 | [machine](https://github.com/masatomix/uipath-orchestrator-api-node/blob/develop/src/samples/machine_robot/) | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 |  |  |
| 3 | [robot](https://github.com/masatomix/uipath-orchestrator-api-node/blob/develop/src/samples/machine_robot/) | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 |  |  |
| 4 | [user](https://github.com/masatomix/uipath-orchestrator-api-node/tree/develop/src/samples/user/) | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 | 名前で検索(findByUserName) |  |
| 5 | [release](https://github.com/masatomix/uipath-orchestrator-api-node/blob/develop/src/samples/release/) | 〇 |  |  |  |  |  | プロセス画面上の「名前」で検索(findByProcessKey) |  |
| 6 | [process](https://github.com/masatomix/uipath-orchestrator-api-node/blob/develop/src/samples/process/) | 〇 |  |  |  |  |  | Packageの検索(findPackage)<br>Packageの削除(deletePackage)<br>Packageのアップロード(uploadPackage)<br>Packageのダウンロード(downloadPackage) |  |
| 7 | [job](https://github.com/masatomix/uipath-orchestrator-api-node/blob/develop/src/samples/job/) | 〇 | 〇 |  |  |  |  | ジョブの開始/終了(StartJobs/StopJob) |  |
| 8 | [schedule](https://github.com/masatomix/uipath-orchestrator-api-node/blob/develop/src/samples/schedule/) | 〇 |  |  |  |  |  |  |  |
| 9 | [log](https://github.com/masatomix/uipath-orchestrator-api-node/blob/develop/src/samples/log/) | 〇 |  |  |  |  |  | 条件で検索(findByFilter) |  |
| 10 | [auditlog](https://github.com/masatomix/uipath-orchestrator-api-node/blob/develop/src/samples/auditlog/) | 〇 |  |  |  |  |  | 条件で検索(findByFilter) |  |
| 11 | [queueDefinition](https://github.com/masatomix/uipath-orchestrator-api-node/blob/develop/src/samples/queue/) | 〇 | 〇 | 〇 | 〇 | 〇 |  | 名前で検索(findByName) |  |
| 12 | [queueItem](https://github.com/masatomix/uipath-orchestrator-api-node/blob/develop/src/samples/queue/) | 〇 | 〇 | 〇 |  | 〇 |  |  | 削除は論理削除 |
| 13 | [queueOperation](https://github.com/masatomix/uipath-orchestrator-api-node/blob/develop/src/samples/queueOperation/) |  |  |  |  |  |  | TransactionのスタートでqueueItemを取得(getQueueAndStartTransaction)<br>Transactionのステータス変更(setTransactionResult) |  |
| 14 | [setting](https://github.com/masatomix/uipath-orchestrator-api-node/blob/develop/src/samples/setting/) | 〇 | 〇 |  | 〇 |  | 〇(update) | キーで検索(findByKey) <br>ファイルからデータ作成(readSettingsFromFile)<br>データをExcel出力(save2Excel) |  |
| 15 | [asset](https://github.com/masatomix/uipath-orchestrator-api-node/blob/develop/src/samples/asset/) | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 | Robot毎Asset更新(uploadPerRobot)<br>Robot毎Asset検索(findAllEx) |  |
| 16 | 汎用 | 〇 | 〇 | 〇 | 〇 | 〇 |  | getArray<br>getData<br>postData<br>putData<br>deleteData |  |


また、

- [OrchestratorデータをExcelファイルへダウンロードするサンプル](https://github.com/masatomix/uipath-orchestrator-api-node/blob/develop/src/samples/util/downloadSamples.ts)。[(個別に落としたい場合はこちら)](https://github.com/masatomix/uipath-orchestrator-api-node/blob/develop/src/samples/util/saveSamples.ts)
- [ExcelからOrchestratorへデータをアップロードするサンプル](https://github.com/masatomix/uipath-orchestrator-api-node/blob/develop/src/samples/util/uploadSamples.ts)

を追加しました。

## Preferences

さて本ライブラリを使用するには、接続するUiPath Orchestratorの情報など、**環境設定**が必要です。

UiPath Orchestrator がEnterprise版の場合は、テナント名、OCへログインするユーザ名とパスワードなどを下記のように:

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


UiPath Orchestrator がCommunity版の場合は、Community版OC画面から取得できる情報を下記のように:

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

参考: [UiPath Orchestrator Community Edition のAPIを呼び出す件と、カスタムアクティビティをつくってみた](https://qiita.com/masatomix/items/1b03d61d7f5319ceb65f)


もしくは、Enterprise/Community にかかわらず、APIをワークフローから呼び出すつまり「Orchestrator への HTTP 要求」アクティビティと同等にしたい場合は、下記の設定画面から取得できる情報を用いて


![001.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/73777/84ac8134-dbb0-fe9d-0b8d-131a165c305c.png)

以下のように設定します。

```json
{
  "robotInfo": {
    "machineKey": "4eccxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx[マシンキー]",
    "machineName": "[マシン名]",
    "userName": "xx\\xxxx[Windowsアカウント]"
  },
  "serverinfo": {
    "servername": "https://www.example.com/"
  }
}
```

上記のような設定ファイルを環境に応じて作成してください。

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
const { OrchestratorApi } = require('uipath-orchestrator-api-node')

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

#### ライブラリのログ出力

本ライブラリは [Bunyan](https://github.com/trentm/node-bunyan) を用いてコンソールにログを出力しています。
出力レベルはERRORレベル以上のため、詳細にログを見たい場合は``local.json``に

```json
  "serverinfo": {
    "servername": "https://www.example.com/"
  },
  // ココより下を追記 (下記は、debug以上を出力する設定)
  "logging": [
    { "name": "main", "level": "debug" },
    { "name": "httpLogger", "level": "debug" }
  ]
  // main/httpLogger は内部で使用しているLoggerの名前
```

など設定して、適宜表示を制御してください。


## source and npm repository

**ソースコードやnpmのリポジトリ**です。

- https://github.com/masatomix/uipath-orchestrator-api-node
- https://www.npmjs.com/package/uipath-orchestrator-api-node


## Revision history

改訂履歴

- 0.6.4 ITenantCrudService,IHostLicenseCrudService,IEnvironmentCrudService,を追加。
- 0.6.3 Jobサービスに、Relese/Robot列を加えた findAllEx メソッドを追加。OrchestratorApi をexportしないとjsから利用できなかった( require('xxx').default ってやらないとダメ) ので、exportを追加
- 0.6.2 ダウンロードメソッド ``api.util.excelDownload('./')`` を追加。Machine/Robot/User/Asset のテンプレートにREADMEシートを追加
- 0.6.1 Assetの微調整。またDocument追加
- 0.6.0 Logライブラリ(log4js)が、Webと相性がわるいぽく、ライブラリを Bunyan へ変更。Assetの操作を追加。
- 0.5.0 Roleテスト実装(かなりテストレベル)。Excelテンプレを修正(Excel書き出しを自前実装にしたのでエラーになるカラムがなくなったため)。ファイルがindex.tsのみだったのをサービス毎に分割。Upload機能暫定追加(Robot/User/Machine)
- 0.4.5 各種APIにsave2ExcelというメソッドでExcelダウンロードできる機能を追加。まだダンプレベルで項目の精査中、レベル。対象は、machine,robot,release,process,job,user,queueDefinitions,setting,log,auditlog
- 0.4.4 Orchestratorの[環境設定操作のAPI](https://github.com/masatomix/uipath-orchestrator-api-node/tree/develop/src/samples/setting) 追加。設定情報をExcelファイルでダウンロードする機能も。
- 0.4.3 Organization Unit に対応。configのuserinfoに、「"organizationUnit": 1」 などと記述出来るようにした。
- 0.4.2 Excel形式のログダウンロード機能追加(xlsx-populate-wrapper 追加)、AuditLog機能追加。ダウンロードサンプルを追加。構成をリファクタリング、Networkがエラーを返すときはステータスコードなども返す。(割とテストレベルかも、、)。
- 0.3.9 実行ログのダウンロード機能を追加。またその[log機能](https://github.com/masatomix/uipath-orchestrator-api-node/tree/develop/src/samples/log)についてドキュメントを整備。
- 0.3.8 [queueDefinition/queue](https://github.com/masatomix/uipath-orchestrator-api-node/tree/develop/src/samples/queue),[queueOperation](https://github.com/masatomix/uipath-orchestrator-api-node/tree/develop/src/samples/queueOperation) についてドキュメントを整備。あとコードのフォーマット(lint)。ロジックは変更なしです。
- 0.3.7 [nupkg関連のアップロード・ダウンロード機能](https://github.com/masatomix/uipath-orchestrator-api-node/tree/develop/src/samples/process)を追加。各種機能の[ドキュメント](https://github.com/masatomix/uipath-orchestrator-api-node/tree/develop/src/samples)を追加
- 0.3.6 ドキュメントの整理のみ。
- 0.3.5 release追加、jobの開始・停止を追加。Statのサンプルを追加
- 0.3.4 ODataを[そのまま返すオプション](https://github.com/masatomix/uipath-orchestrator-api-node/blob/develop/src/index.ts)を追加。[UserのCRUD](https://github.com/masatomix/uipath-orchestrator-api-node/tree/develop/src/samples/user)追加。
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
