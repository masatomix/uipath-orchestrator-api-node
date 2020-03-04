Log 機能は、ロボットの稼働ログをダウンロードする機能です。

![log01.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/73777/a78f4146-f179-6d35-3144-967b685f18c7.png)

2020/03/04 時点、条件指定をしながらこれらのデータを JSON データ(の配列)として取得することができます。

## サンプルを実行してみる

```console
$ npx ts-node ./src/samples/log/logSample.ts
```

ログデータ 1 件は以下のようなデータで、検索条件に合致したログたちを配列で取得することができます。

```json
{
  "Level": "Info",
  "WindowsIdentity": "WINDOWS\\xxxkino",
  "ProcessName": "Attended_FrameWork_Main",
  "TimeStamp": "2020-03-02T13:45:20.74Z",
  "Message": "Attended_FrameWork_Main の実行を開始しました",
  "JobKey": "b8ed2be1-7f79-4fe9-a6ca-9ba9ee54d782",
  "RawMessage": "{\r\n  \"message\": \"Attended_FrameWork_Main の実行を開始しました\",\r\n  \"level\": \"Information\",\r\n  \"logType\": \"Default\",\r\n  \"timeStamp\": \"2020-03-02T13:45:20.7401793+00:00\",\r\n  \"fingerprint\": \"xxx-9ce2-4087-b136-xxx\",\r\n  \"windowsIdentity\": \"WINDOWS\\\\xxkino\",\r\n  \"machineName\": \"WINDOWS\",\r\n  \"processName\": \"Attended_FrameWork_Main\",\r\n  \"processVersion\": \"1.0.7120.2411\",\r\n  \"jobId\": \"b8ed2be1-7f79-4fe9-a6ca-9ba9ee54d782\",\r\n  \"robotName\": \"WINDOWS\",\r\n  \"machineId\": 219,\r\n  \"organizationUnitId\": 1,\r\n  \"fileName\": \"Main\"\r\n}",
  "RobotName": "WINDOWS",
  "MachineId": 219,
  "Id": 67530
}
```

さて条件指定の仕方ですが、基本的に [API リクエストの構築](https://docs.uipath.com/orchestrator/lang-ja/reference#building-api-requests) この機能を用いてます。

例: Id = 2015 で検索

スペースが ``%20``, = が ``eq`` となり

```console
https://platform.uipath.com/odata/Environments?$filter=Id%20eq%2015
```

パラメタ指定がそこそこわかりにくいですね。なので、例えば下記のように、

```typescript
const logs: any[] = await api.log.findByFilter({
  level: 'INFO',
  robotName: 'WINDOWS',
  windowsIdentity: 'WINDOWS\\xxkino',
  machineName: 'WINDOWS',
  processName: 'Attended_FrameWork_Main',
})
```

パラメタ指定をシンプルにできるようにしてみました。
( ``contains`` などの部分一致指定は、今んとこ非対応)

## サンプルコード

```typescript
import config from 'config'
import OrchestratorApi from '../../index'
import logger from '../../logger'

async function sample() {
  const api = new OrchestratorApi(config)
  await api.authenticate()
  try {
    let logs: any[] = []

    // サンプル1、日付指定
    const from = '2020/03/02 00:00'
    const to = '2020-03-03 00:00' // ハイフンもOK

    logs = await api.log.findByFilter({
      level: 'INFO',
      from: new Date(from),
      to: new Date(to),
    })
    printLog(logs)

    // サンプル2、$filter以外の指定方法.TOP3件にしぼりかつ、項目も絞ってる
    logs = await api.log.findByFilter(
      {
        level: 'INFO',
        from: new Date(from),
        to: new Date(to),
      },
      { $top: 3, $select: 'JobKey,ProcessName,TimeStamp' },
    )
    printLog(logs)
  } catch (error) {
    logger.error(error)
  }
}

async function printLog(logs: any[]) {
  console.log(logs[0])
  // 表で出力するとき RawMessage ちょっとジャマなので削除
  // また、多いので出力を5件だけにしちゃう
  logs.map(log => delete log.RawMessage)
  const filteredLogs = logs.filter((_, index) => index < 5)

  console.table(filteredLogs)
  console.log(`${logs.length} 件でした`)
}

if (!module.parent) {
  ;(async () => {
    await sample()
  })()
}
```

前半の結果は以下の通り。

```json
{
  "Level": "Info",
  "WindowsIdentity": "WINDOWS\\xxxkino",
  "ProcessName": "Attended_FrameWork_Main",
  "TimeStamp": "2020-03-02T13:45:20.74Z",
  "Message": "Attended_FrameWork_Main の実行を開始しました",
  "JobKey": "b8ed2be1-7f79-4fe9-a6ca-9ba9ee54d782",
  "RawMessage": "{\r\n  \"message\": \"Attended_FrameWork_Main の実行を開始しました\",\r\n  \"level\": \"Information\",\r\n  \"logType\": \"Default\",\r\n  \"timeStamp\": \"2020-03-02T13:45:20.7401793+00:00\",\r\n  \"fingerprint\": \"xxx-9ce2-4087-b136-xxx\",\r\n  \"windowsIdentity\": \"WINDOWS\\\\xxxkino\",\r\n  \"machineName\": \"WINDOWS\",\r\n  \"processName\": \"Attended_FrameWork_Main\",\r\n  \"processVersion\": \"1.0.7120.2411\",\r\n  \"jobId\": \"b8ed2be1-7f79-4fe9-a6ca-9ba9ee54d782\",\r\n  \"robotName\": \"WINDOWS\",\r\n  \"machineId\": 219,\r\n  \"organizationUnitId\": 1,\r\n  \"fileName\": \"Main\"\r\n}",
  "RobotName": "WINDOWS",
  "MachineId": 219,
  "Id": 67530
}
```

```console
┌─────────┬────────┬───────────────────┬───────────────────────────┬────────────────────────────┬────────────────────────────────────────────────────────────────┬────────────────────────────────────────┬───────────┬───────────┬───────┐
│ (index) │ Level  │  WindowsIdentity  │        ProcessName        │         TimeStamp          │                            Message                             │                 JobKey                 │ RobotName │ MachineId │  Id   │
├─────────┼────────┼───────────────────┼───────────────────────────┼────────────────────────────┼────────────────────────────────────────────────────────────────┼────────────────────────────────────────┼───────────┼───────────┼───────┤
│    0    │ 'Info' │ 'WINDOWS\\xxxkino' │ 'Attended_FrameWork_Main' │ '2020-03-02T13:45:20.74Z'  │              'Attended_FrameWork_Main の実行を開始しました'              │ 'b8ed2be1-7f79-4fe9-a6ca-9ba9ee54d782' │ 'WINDOWS' │    219    │ 67530 │
│    1    │ 'Info' │ 'WINDOWS\\xxxkino' │ 'Attended_FrameWork_Main' │ '2020-03-02T13:45:23.337Z' │ 'Key:logF_BusinessProcessName, value:Mail Checker Application' │ 'b8ed2be1-7f79-4fe9-a6ca-9ba9ee54d782' │ 'WINDOWS' │    219    │ 67531 │
│    2    │ 'Info' │ 'WINDOWS\\xxxkino' │ 'Attended_FrameWork_Main' │ '2020-03-02T13:45:23.337Z' │          'Key:OrchestratorQueueName, value:mailQueue'          │ 'b8ed2be1-7f79-4fe9-a6ca-9ba9ee54d782' │ 'WINDOWS' │    219    │ 67532 │
│    3    │ 'Info' │ 'WINDOWS\\xxxkino' │ 'Attended_FrameWork_Main' │ '2020-03-02T13:45:23.337Z' │              'Key:Enable_Screenshot, value:True'               │ 'b8ed2be1-7f79-4fe9-a6ca-9ba9ee54d782' │ 'WINDOWS' │    219    │ 67533 │
│    4    │ 'Info' │ 'WINDOWS\\xxxkino' │ 'Attended_FrameWork_Main' │ '2020-03-02T13:45:23.337Z' │            'Key:imap_server, value:imap.gmail.com'             │ 'b8ed2be1-7f79-4fe9-a6ca-9ba9ee54d782' │ 'WINDOWS' │    219    │ 67534 │
└─────────┴────────┴───────────────────┴───────────────────────────┴────────────────────────────┴────────────────────────────────────────────────────────────────┴────────────────────────────────────────┴───────────┴───────────┴───────┘
612 件でした
```

後半は、条件指定とともに取得する項目も指定していますので、結果は以下の感じに。

```json
{
  "JobKey": "b8ed2be1-7f79-4fe9-a6ca-9ba9ee54d782",
  "ProcessName": "Attended_FrameWork_Main",
  "TimeStamp": "2020-03-02T13:45:20.74Z"
}
```

```console
┌─────────┬────────────────────────────────────────┬───────────────────────────┬────────────────────────────┐
│ (index) │                 JobKey                 │        ProcessName        │         TimeStamp          │
├─────────┼────────────────────────────────────────┼───────────────────────────┼────────────────────────────┤
│    0    │ 'b8ed2be1-7f79-4fe9-a6ca-9ba9ee54d782' │ 'Attended_FrameWork_Main' │ '2020-03-02T13:45:20.74Z'  │
│    1    │ 'b8ed2be1-7f79-4fe9-a6ca-9ba9ee54d782' │ 'Attended_FrameWork_Main' │ '2020-03-02T13:45:23.337Z' │
│    2    │ 'b8ed2be1-7f79-4fe9-a6ca-9ba9ee54d782' │ 'Attended_FrameWork_Main' │ '2020-03-02T13:45:23.337Z' │
└─────────┴────────────────────────────────────────┴───────────────────────────┴────────────────────────────┘
3 件でした
```

おつかれさまでした。


## Orchestrator API との対応表

- findByFilter(
  filters: {
  from?: Date
  to?: Date
  robotName?: string
  processName?: string
  windowsIdentity?: string
  level?: 'TRACE' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL'
  machineName?: string
  },
  obj?: any
  )
  - GET `/odata/RobotLogs` + パラメタ。filters:$filter、obj:それ以外の条件 ($top,$expand,$select,$orderby, $skip) など。

- findAll (queries?: any)
  - GET `/odata/RobotLogs` 原則、findByFilterで十分だけど、``contains``を使うとか自分でいろいろやりたいヒト向け
