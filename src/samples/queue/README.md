キュー(Queue)とは **「無制限に項目を保持できる収納機能です。」** とのこと([公式より](https://docs.uipath.com/orchestrator/lang-ja/docs/about-queues-and-transactions))。
処理したいデータを QueueItem という形式にしてQueueに投入することで、ワークフロー間でデータをやりとりする機構ですね。まんなかにキューを置くことで、データの投入だけを行うワークフローと、データの処理だけを行うワークフローを分割したり、処理の並列化などを行うことができます。


本APIでは

- queue: QueueItemつまり投入するデータを操作する機能
- queueDefinition: Queue(QueueItemを投入する収納先)の定義などを操作する機能

としています。

## サンプルを実行してみる(QueueDefinition/Queueの操作)

まずは動かしてみましょう。

```console
$ npx ts-node src/samples/queue/createQueueSample.ts
```

サンプルが行っている処理は以下の通り。

- Queueの定義(QueueDefinition)を作成
- 定義したQueueに、サンプルデータ(QueueItem)を5コ、for文で投入
- 投入したQueueItemを検索 (ステータスが``New``のものを検索)
- そのうち1件をコンソールに表示

投入したQueueItemのうち、一つをJSONデータとして下記に表示してみます。

QueueItem:

```json
{
  "QueueDefinitionId": 558,
  "OutputData": null,
  "AnalyticsData": null,
  "Status": "New",
  "ReviewStatus": "None",
  "ReviewerUserId": null,
  "Key": "a1c881f9-51ef-4676-b316-c43e1d9e71cb",
  "Reference": "8979",
  "ProcessingExceptionType": null,
  "DueDate": null,
  "RiskSlaDate": null,
  "Priority": "Normal",
  "DeferDate": null,
  "StartProcessing": null,
  "EndProcessing": null,
  "SecondsInPreviousAttempts": 0,
  "AncestorId": null,
  "RetryNumber": 0,
  "SpecificData": "{\"DynamicProperties\":{\"MessageId\":\"<7A6877E2452943F59DEE8AD81FB403A9@12345>\",\"MailDateStr\":\"Sat, 7 Dec 2019 02:00:05 +0900\",\"Subject\":\"テストメール\",\"MailDate\":\"2019-12-06T17:00:05.000Z\",\"Body\":\"テストメール。添付の通りです。\\r\\n\",\"attachmentFileName\":\"report_20191206.html\"}}",
  "CreationTime": "2020-02-27T11:07:07.23Z",
  "Progress": null,
  "RowVersion": "AAAAAAAAJ8s=",
  "Id": 1721,
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

投入したQueueItemのステータスが ``New`` であったり、実際に投入したデータが ``SpecificData`` や ``SpecificContent`` に格納されていたり、投入先のキューのIdが ``QueueDefinitionId`` に入っていたり、データを特定するためのキー値が ``Reference`` に入っていたり(これは画面にも「参照」として表示されている)、などがわかります。

対応するデータを画面で表示してみます。
5件のデータが入っている図です。

![01.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/73777/8ec616c7-1624-5073-c03e-e04ba480e568.png)

1件データの詳細を表示してみました。

![02.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/73777/7249c95a-d740-d50e-e120-78e69fddb525.png)


### サンプルコード

```typescript
import config from 'config'
import OrchestratorApi from '../../index'
import { randomName } from '../sampleUtils'

async function sample() {
  const api = new OrchestratorApi(config)

  // まずは認証
  await api.authenticate()
  // キュー定義を作成
  const queueDef = await createQueueDef(api)

  // 作成したキュー定義に、5コのQueueItem(データ)を投入する
  for (let i = 0; i < 5; i++) {
    await api.queueItem.create(createQueueItem(queueDef.Name))
  }

  const queueItems: any[] = await api.queueItem.findAll({ $filter: `Status eq 'New'` })
  console.log(queueItems[0])
}

function createQueueDef(api_: OrchestratorApi) {
  const testQueueDef = {
    Name: randomName('testQueue'),
    Description: 'Queue for UnitTest',
    AcceptAutomaticallyRetry: true, // 自動リトライ
    MaxNumberOfRetries: 3, // 最大リトライ数
    EnforceUniqueReference: true, // 一意の参照(一意のRefをつけるかどうか)
  }
  return api_.queueDefinition.create(testQueueDef)
}

// サンプルの適当なデータ。。
const createQueueItem = (queueName: string) => {
  const SpecificContent = {
    MessageId: '<7A6877E2452943F59DEE8AD81FB403A9@12345>',
    MailDateStr: 'Sat, 7 Dec 2019 02:00:05 +0900',
    Subject: 'テストメール',
    MailDate: new Date('2019-12-07T02:00:05+09:00'),
    Body: 'テストメール。添付の通りです。\r\n',
    attachmentFileName: 'report_20191206.html',
    'MessageId@odata.type': '#String',
    'MailDateStr@odata.type': '#String',
    'Subject@odata.type': '#String',
    'Body@odata.type': '#String',
    'attachmentFileName@odata.type': '#String',
  }

  const newQueue = {
    itemData: {
      Priority: 'Normal',
      Name: queueName,
      SpecificContent: SpecificContent,
      Reference: Math.floor(Math.random() * 10000).toString(),
    },
  }
  return newQueue
}

if (!module.parent) {
  (async () => {
    await sample()
  })()
}
```

ちなみに、はじめに作成したキュー定義の情報を出力してみると、、、

```json
{
  "Name": "testQueue0296",
  "Description": "Queue for UnitTest",
  "MaxNumberOfRetries": 3,
  "AcceptAutomaticallyRetry": true,
  "EnforceUniqueReference": true,
  "SpecificDataJsonSchema": null,
  "OutputDataJsonSchema": null,
  "AnalyticsDataJsonSchema": null,
  "CreationTime": "2020-02-27T11:07:06.73Z",
  "ProcessScheduleId": null,
  "SlaInMinutes": 0,
  "RiskSlaInMinutes": 0,
  "ReleaseId": null,
  "Id": 558
}
```

こんな感じになっています。対応する画面はこんな感じです。

![03.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/73777/7af84224-7c8b-a679-903b-5ff1eba09a03.png)

詳細画面

![04.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/73777/44d5b7d8-b86c-337c-aaf0-bddd28fb9b71.png)


## Orchestrator API との対応表

queueDefinition

- findAll (queries?: any)
  - GET `/odata/QueueDefinitions`
- find (id: number)
  - GET `/odata/QueueDefinitions(${id})`
- findByName (name: string)
  - GET `/odata/QueueDefinitions` に `` $filter: `Name eq '${name}'` ``
- create (queueDefinition: any)
  - POST `/odata/QueueDefinitions`
- update (queueDefinition: any)
  - PUT `/odata/QueueDefinitions(${queueDefinition.Id})`
- delete (id: number)
  - DELETE `/odata/QueueDefinitions(${id})`

queueItem

- findAll (queries?: any)
  - GET `/odata/QueueItems`
- find (queueItemId: number)
  - GET `/odata/QueueItems(${queueItemId})`
- create (queue: any)
  - POST `/odata/Queues/UiPathODataSvc.AddQueueItem`
- delete (queueItemId: number)
  - DELETE `/odata/QueueItems(${queueItemId})`
