import OrchestratorApi from '../src/index'

import config from 'config'

describe('OrchestratorApi_queue_transaction', () => {
  jest.setTimeout(10000)
  const userConfig = (config as any).OrchestratorApi_queue.userApi
  const robotConfig = (config as any).OrchestratorApi_queue.robotApi

  const api = new OrchestratorApi(userConfig)
  const robotApi = new OrchestratorApi(robotConfig)

  beforeEach(async () => {
    await api.authenticate()
    await robotApi.authenticate()
  })

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
        // Reference: SpecificContent.MessageId,
        Reference: Math.floor(Math.random() * 10000).toString(),
      },
    }
    return newQueue
  }

  describe('Transactionのテスト', () => {
    const testQueueDef = {
      Name: 'testQueue' + Math.floor(Math.random() * 1000),
      Description: 'Queue for UnitTest',
      AcceptAutomaticallyRetry: true, // 自動リトライ
      MaxNumberOfRetries: 3, // 最大リトライ数
      EnforceUniqueReference: true, // 一意の参照(一意のRefをつけるかどうか)
    }

    beforeEach(async () => {
      const result = await api.queueDefinition.create(testQueueDef)
    })

    it('Transactionの成功と失敗のテスト。', async () => {
      const newQueue1 = createQueueItem(testQueueDef.Name)
      const newQueue2 = createQueueItem(testQueueDef.Name)
      try {
        const result1 = await api.queueItem.create(newQueue1)
        const result2 = await api.queueItem.create(newQueue2)
        {
          // 1個目成功
          const queueItem = await robotApi.queueOperation.getQueueAndStartTransaction(testQueueDef.Name)
          const queueItemId: number = queueItem.Id

          expect(queueItem.Reference).toBe(result1.Reference)
          const status = {
            transactionResult: {
              IsSuccessful: true,
              Output: {},
            },
          }
          await robotApi.queueOperation.setTransactionResult(queueItemId, status)
        }

        let systemFailRef: string = ''
        {
          // 2個目失敗、システム例外なので、再ラン
          const queueItem = await robotApi.queueOperation.getQueueAndStartTransaction(testQueueDef.Name)
          const queueItemId: number = queueItem.Id
          systemFailRef = queueItem.Reference

          expect(queueItem.Reference).toBe(result2.Reference)
          const status = {
            transactionResult: {
              IsSuccessful: false,
              ProcessingException: {
                Reason: 'testError',
                Type: 'ApplicationException',
              },
              Output: {},
            },
          }
          await robotApi.queueOperation.setTransactionResult(queueItemId, status)
        }
        {
          // システム例外後の再度のStartTransactionなので、先ほどと同じやつのリトライが取れるはず
          const queueItem = await robotApi.queueOperation.getQueueAndStartTransaction(testQueueDef.Name)
          const queueItemId: number = queueItem.Id

          expect(queueItem.Reference).toBe(systemFailRef) // 先ほどのRefと同じはず
          const status = {
            transactionResult: {
              IsSuccessful: false,
              ProcessingException: {
                Reason: 'testError',
                Type: 'BusinessException',
              },
              Output: {},
            },
          }
          await robotApi.queueOperation.setTransactionResult(queueItemId, status)
          // ビジネス例外をスローしたので、再ランはやめて失敗となるはず。
        }

        // 検索して、見つかること。
        const def = await api.queueDefinition.findByName(testQueueDef.Name)
        const queueItems = await api.queueItem.findAll({
          $filter: `QueueDefinitionId eq ${def.Id}`,
        })
        expect(queueItems.length).toBe(3)

        const findResult1 = await api.queueItem.find(result1.Id)
        expect(findResult1.Id).toBe(result1.Id)

        const findResult2 = await api.queueItem.find(result2.Id)
        expect(findResult2.Id).toBe(result2.Id)
      } catch (error) {
        fail(error)
      } finally {
      }
    })

    afterEach(async () => {
      const queueDef = await api.queueDefinition.findByName(testQueueDef.Name)
      await api.queueDefinition.delete(queueDef.Id)
    })
  })
})
