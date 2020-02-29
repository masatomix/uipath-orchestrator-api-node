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

  // const arrs = Array(5).fill(0) // 空の配列を作成してFor文
  // await Promise.all(arrs.map(arr => api.queueItem.create(createQueueItem(queueDef.Name))))

  const queueItems: any[] = await api.queueItem.findAll({ $filter: `Status eq 'New'` })
  console.log(queueItems[0])
}

export function createQueueDef(api_: OrchestratorApi) {
  const testQueueDef = {
    Name: randomName('testQueue'),
    Description: 'Queue for UnitTest',
    AcceptAutomaticallyRetry: true, // 自動リトライ
    MaxNumberOfRetries: 3, // 最大リトライ数
    EnforceUniqueReference: true, // 一意の参照(一意のRefをつけるかどうか)
  }
  return api_.queueDefinition.create(testQueueDef)
}

export const createQueueItem = (queueName: string) => {
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
