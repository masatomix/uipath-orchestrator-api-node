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
