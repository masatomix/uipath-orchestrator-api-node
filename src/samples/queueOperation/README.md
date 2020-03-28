[Queue](https://github.com/masatomix/uipath-orchestrator-api-node/blob/develop/src/samples/queue/) のつづきです。

キューのデータを処理するためには通常 **「トランザクション」** 機構を用います。トランザクションを開始すると QueueItem(データ)が取得できるのですが、**そのデータはほかのロボ(≒PC)からは参照・操作ができない**ようになっています。つまり別のロボが新たにトランザクションを開始すると、そちらのトランザクションでは別の QueueItem を取得・処理することになります。

トランザクションの画面
![01.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/73777/47feeb9b-1a2a-167b-09bb-b62519e97c10.png)

トランザクション開始後、ロボは自分のワークフロー内でその QueueItem(データ)を処理したのち、ステータスを **「成功/失敗(アプリ例外)/失敗(ビジネス)例外」** にすることでトランザクションを終了させます。

それぞれのステータスの意味は以下のとおり。処理結果に応じて適切なステータスを設定してください。

- **成功**: 正常に終了
- **失敗(アプリ例外)**: ときどき発生するエラーなどいわゆるシステム例外で、再ラン(再実行)したらふつうに正常終了するかも？という失敗
- **失敗(ビジネス例外)**: 入力チェックでエラーなどいわゆる業務例外で、再ランしてもダメな失敗

失敗(アプリ例外)としたデータはキュー上は「リトライ」という状態になり、**新たに同じデータがキューに投入され**ます。なので、別のトランザクションが再度そのデータを処理するわけですね。
そのリトライは成功するまで、キュー定義で**規定したリトライ回数だけ**繰り返されます。

この機構により

- いろんなロボが並列で稼働しても、同じデータを重複して処理するのを防げる
- 復旧可能な失敗については自動で(規定回数)再ランされる

などを実現しています。**ワークフローは QueueItem をあるだけ取り出して一つ一つ処理**する、って書いておけば OK。**「特定のエラー時だけ繰り返し(リトライ)を行う」などのロジックは不要**で、ワークフローがとてもシンプルになります。

## サンプルを実行してみる(QueueOperation)

さてサンプルを動かしてみましょう。

```console
$ npx ts-node src/samples/queueOperation/queueOperationSample.ts
```

サンプルが行っている処理は以下の通り。

- Queue の定義(QueueDefinition)を作成(リトライは 3 回にしました)
- 定義した Queue に、サンプルデータ(QueueItem)を 5 コ投入
- getQueueAndStartTransaction で QueueItem を一つ取得 → ステータスを「成功」に。
- getQueueAndStartTransaction で QueueItem を一つ取得 → ステータスを「成功」に。
- getQueueAndStartTransaction で QueueItem を一つ取得 → ステータスを「失敗(アプリ例外)」に。(あとでリトライされる)
- getQueueAndStartTransaction で QueueItem を一つ取得 → ステータスを「失敗(ビジネス例外)」に。(これは即失敗に)
- getQueueAndStartTransaction で QueueItem を一つ取得 → ステータスを「成功」に。
- リトライ 1 回目。getQueueAndStartTransaction で QueueItem を一つ取得 → ステータスをまた「失敗(アプリ例外)」に。
- リトライ 2 回目。getQueueAndStartTransaction で QueueItem を一つ取得 → ステータスをまた「失敗(アプリ例外)」に。

キュー定義でリトライは 3 回なので、リトライ 3 回目待ちの QueueItem をひとつ残した状態で終了する、というサンプルになっています。

さて実行後、実行ログと画面をあわせてみてみます。

実行ログ:

```console
$ npx ts-node ./src/samples/queueOperation/queueOperationSample.ts

QueueDef Name: testQueue0575
Id:1927, Ref:4509 のデータは正常終了しました。
Id:1928, Ref:3546 のデータは正常終了しました。
Id:1929, Ref:7197 のデータはApplication例外で終了。この例外は再ランします(データが再投入される)。
Id:1930, Ref:4636 のデータはBusiness例外で終了。この例外は再ランしません
Id:1931, Ref:1675 のデータは正常終了しました。
Id:1932, Ref:7197 のデータはApplication例外で終了。この例外は再ランします(データが再投入される)。
Id:1933, Ref:7197 のデータはApplication例外で終了。この例外は再ランします(データが再投入される)。
```

Ref: 4636 は業務例外なので、再ランせずに即失敗しています。
Ref: 7197 はアプリ例外により、二回再ランしていることがわかります。

つづいて画面:

ビジネス例外が 1 回、アプリ例外が 3 回、QueueItem 成功が 3 つ、残りが 1 つ。想定通りです。
![00.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/73777/86d7cdb9-a025-0081-3d4d-e770defb6d22.png)

トランザクション画面は以下。Ref:7197 は、リトライ状態が 3 つ、リトライ 3 回目を待つ新規状態が 1 つ。ビジネス例外は即失敗しています。想定通り。
![01.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/73777/47feeb9b-1a2a-167b-09bb-b62519e97c10.png)

リトライしてるトランザクションのうちどれか 1 つを詳細表示。リトライしている履歴を確認できます。
![02.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/73777/d4c37a61-83e4-7842-cf09-a2f623c95f18.png)

さて、getQueueAndStartTransaction の戻り値を表示してみます。

```json
{
  "@odata.context": "https://orch.example1.xyz/odata/$metadata#Queues/$entity",
  "QueueDefinitionId": 615,
  "OutputData": null,
  "AnalyticsData": null,
  "Status": "InProgress",
  "ReviewStatus": "None",
  "ReviewerUserId": null,
  "Key": "72f64c0a-fec1-42f2-a29f-069a054562c2",
  "Reference": "8158",
  "ProcessingExceptionType": null,
  "DueDate": null,
  "RiskSlaDate": null,
  "Priority": "Normal",
  "DeferDate": null,
  "StartProcessing": "2020-02-29T05:05:07.13Z",
  "EndProcessing": null,
  "SecondsInPreviousAttempts": 0,
  "AncestorId": null,
  "RetryNumber": 0,
  "SpecificData": "{\"DynamicProperties\":{\"MessageId\":\"<7A6877E2452943F59DEE8AD81FB403A9@12345>\",\"MailDateStr\":\"Sat, 7 Dec 2019 02:00:05 +0900\",\"Subject\":\"テストメール\",\"MailDate\":\"2019-12-06T17:00:05.000Z\",\"Body\":\"テストメール。添付の通りです。\\r\\n\",\"attachmentFileName\":\"report_20191206.html\"}}",
  "CreationTime": "2020-02-29T05:05:06.74Z",
  "Progress": null,
  "RowVersion": "AAAAAAAAKZc=",
  "Id": 1911,
  "ProcessingException": null,
  "SpecificContent": {
    "MessageId": "<7A6877E2452943F59DEE8AD81FB403A9@12345>",
    "MailDateStr": "Sat, 7 Dec 2019 02:00:05 +0900",
    "Subject": "テストメール",
    "MailDate": "2019-12-06T17:00:05Z",
    "Body": "テストメール。添付の通りです。\r\n",
    "attachmentFileName": "report_20191206.html"
  },
  "Output": null,
  "Analytics": null
}
```

うん、いわゆる [Queue](https://github.com/masatomix/uipath-orchestrator-api-node/blob/develop/src/samples/queue/) でもでてきた QueueItem のデータですね。

### サンプルコード

```typescript
import config from 'config'
import OrchestratorApi from '../../index'
import { createQueueDef, createQueueItem } from '../queue/createQueueSample'

async function sample() {
  const userConfig = config.get('OrchestratorApi_queue.userApi') // QueueDefinition などはロボットモードでは動かせない
  const robotConfig = config.get('OrchestratorApi_queue.robotApi') // トランザクション操作は、ロボットモードで呼び出したい

  const api = new OrchestratorApi(userConfig)
  const robotApi = new OrchestratorApi(robotConfig)

  try {
    // まずは認証
    await api.authenticate()
    await robotApi.authenticate()

    // QueueDefinitionを作成し、QueueItemを5コ投入
    const queueDefName = await createQueueDefAndQueueItems(api)

    await executeSuccess(robotApi, queueDefName) // 成功
    await executeSuccess(robotApi, queueDefName) // 成功
    await executeApplicationException(robotApi, queueDefName) // 失敗(アプリ例外)
    await executeBusinessException(robotApi, queueDefName) // 失敗(ビジネス例外)
    await executeSuccess(robotApi, queueDefName) // 成功
    await executeApplicationException(robotApi, queueDefName) // 失敗(アプリ例外)
    await executeApplicationException(robotApi, queueDefName) // 失敗(アプリ例外)
  } catch (error) {
    console.log(error)
  }
}

async function executeSuccess(robotApi: OrchestratorApi, queueDefName: string) {
  const queueItem = await robotApi.queueOperation.getQueueAndStartTransaction(queueDefName)
  // console.log(queueItem)
  const status = {
    transactionResult: {
      IsSuccessful: true,
      Output: {},
    },
  }
  await robotApi.queueOperation.setTransactionResult(queueItem.Id, status)
  console.log(`Id:${queueItem.Id}, Ref:${queueItem.Reference} のデータは正常終了しました。`)
}

// 失敗(アプリ例外)にするコード
async function executeApplicationException(robotApi: OrchestratorApi, queueDefName: string) {
  const queueItem = await robotApi.queueOperation.getQueueAndStartTransaction(queueDefName)
  const status = {
    transactionResult: {
      IsSuccessful: false,
      ProcessingException: {
        Reason: 'アプリケーション例外(システム例外)です。',
        Type: 'ApplicationException',
      },
      Output: {},
    },
  }
  await robotApi.queueOperation.setTransactionResult(queueItem.Id, status)
  console.log(
    `Id:${queueItem.Id}, Ref:${queueItem.Reference} のデータはApplication例外で終了。この例外は再ランします(データが再投入される)。`,
  )
}

// 失敗(ビジネス例外)にするコード
async function executeBusinessException(robotApi: OrchestratorApi, queueDefName: string) {
  const queueItem = await robotApi.queueOperation.getQueueAndStartTransaction(queueDefName)
  const status = {
    transactionResult: {
      IsSuccessful: false,
      ProcessingException: {
        Reason: 'ビジネス例外(業務例外)です。',
        Type: 'BusinessException',
      },
      Output: {},
    },
  }
  await robotApi.queueOperation.setTransactionResult(queueItem.Id, status)
  console.log(`Id:${queueItem.Id}, Ref:${queueItem.Reference} のデータはBusiness例外で終了。この例外は再ランしません`)
}

async function createQueueDefAndQueueItems(api: OrchestratorApi): Promise<string> {
  // キュー定義を作成
  const queueDef = await createQueueDef(api)
  console.log(`QueueDef Name: ${queueDef.Name}`)
  const arrs = Array(5).fill(0) // 空の配列を作成してFor文
  await Promise.all(arrs.map(arr => api.queueItem.create(createQueueItem(queueDef.Name))))
  return queueDef.Name
}

if (!module.parent) {
  (async () => {
    await sample()
  })()
}
```

### コード補足

今回は

```typescript
const userConfig = config.get('OrchestratorApi_queue.userApi') // QueueDefinition などはロボットモードでは動かせない
const robotConfig = config.get('OrchestratorApi_queue.robotApi') // トランザクション操作は、ロボットモードで呼び出したい

const api = new OrchestratorApi(userConfig)
const robotApi = new OrchestratorApi(robotConfig)
```

とAPIを二つ生成しています。``local.json``に設定した設定情報はだいたいこんな感じ。

```json
{
  "OrchestratorApi_queue": {
    "robotApi": {
      "robotInfo": {
        "machineKey": "4eccxxxx",
        "machineName": "PBPxxx",
        "userName": "xx\\xxx"
      },
      "serverinfo": {
        "servername": "https://www.example.com/"
      }
    },
    "userApi": {
      "userinfo": {
        "tenancyName": "default",
        "usernameOrEmailAddress": "admin",
        "password": "890xxx"
      },
      "serverinfo": {
        "servername": "https://www.example.com/"
      }
    }
  }
}
```

ワークフロー内で「Orchestrator への HTTP 要求」アクティビティでAPIをコールした振る舞いとなる ``robotApi`` と、通常通り(?)の``api`` を定義しています。これはQueue定義などを作成するのは普通のAPI呼び出しにして、トランザクションを使った処理は**ロボットとして**動いて欲しいからですね。``robotApi`` はPC上からロボットとして動いて、トランザクションを使ってQueueItemのデータを処理しています。

## Orchestrator API との対応表

queueOperation

- getQueueAndStartTransaction(queueName: string)
  - POST `/odata/Queues/UiPathODataSvc.StartTransaction`
- setTransactionResult(queueItemId: number, statusObj: any)
  - POST `/odata/Queues(${queueItemId})/UiPathODataSvc.SetTransactionResult`
