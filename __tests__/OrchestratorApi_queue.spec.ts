import OrchestratorApi from '../src/index'

import config from 'config'

describe('OrchestratorApi_queue', () => {

  const userConfig = (config as any).OrchestratorApi_queue.userApi
  const robotConfig = (config as any).OrchestratorApi_queue.robotApi

  const api = new OrchestratorApi(userConfig)
  const robotApi = new OrchestratorApi(robotConfig)

  beforeEach(async () => {
    await api.authenticate()
    await robotApi.authenticate()
  })

  describe('Queue作成、Queue投入テスト', () => {

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

    describe('Queueにデータを投入して、期待値と比較するテスト。', () => {
      // 最終的にQueueから取り出されるデータと比較するためのテストデータ。
      const expected = {
        MessageId: '<7A6877E2452943F59DEE8AD81FB403A9@12345>',
        MailDateStr: 'Sat, 7 Dec 2019 02:00:05 +0900',
        Subject: 'テストメール',
        MailDate: new Date('2019-12-07T02:00:05+09:00'),
        Body: 'テストメール。添付の通りです。\r\n',
        attachmentFileName: 'report_20191206.html',
      }

      // Queueから取り出されるデータには、型情報がないので比較できないから、それらプロパティは待避。
      const typeInfo = {
        'MessageId@odata.type': '#String',
        'MailDateStr@odata.type': '#String',
        'Subject@odata.type': '#String',
        'Body@odata.type': '#String',
        'attachmentFileName@odata.type': '#String',
      }
      // それらを合体
      const SpecificContentWithType = Object.assign({}, expected, typeInfo)

      // 実際に投入するデータ型。
      const newQueue = {
        itemData: {
          Priority: 'Normal',
          Name: testQueueDef.Name,
          SpecificContent: SpecificContentWithType,
          Reference: expected.MessageId,
        },
      }

      it('Queue登録テスト', async () => {
        let Id: number = 0
        try {
          // Queueへデータ投入
          const result = await api.queueItem.create(newQueue)
          Id = result.Id

          // console.log(expected)
          // console.log(result)
          // console.log(result.SpecificContent)
          // console.log(result.SpecificContent.MailDate)

          // キー 一致確認
          const actualReference = result.Reference
          expect(actualReference).toBe(newQueue.itemData.Reference)

          expect(result.SpecificContent).toEqual({
            MessageId: expected.MessageId,
            MailDateStr: expected.MailDateStr,
            Subject: expected.Subject,
            MailDate: expect.anything(), // なんでもイイ。下でチェック
            Body: expected.Body,
            attachmentFileName: expected.attachmentFileName,
          })

          // date で投げたデータは文字列で返ってくるので、再度オブジェクトにして比較。
          expect(typeof result.SpecificContent.MailDate).toBe('string')
          // expect(result.SpecificContent.MailDate).toBeInstanceOf(String) // なんかうまくいかない
          expect(new Date(result.SpecificContent.MailDate)).toMatchObject(expected.MailDate)

          // 検索して、見つかること。
          const findResult = await api.queueItem.find(Id)
          expect(findResult.Id).toBe(Id)
        } catch (error) {
          console.log(Id)
          fail(error)
        } finally {
          // 最後に削除。
          await api.queueItem.delete(Id)
        }
      })

      afterEach(async () => { })
    })

    afterEach(async () => {
      const queueDef = await api.queueDefinition.findByName(testQueueDef.Name)
      await api.queueDefinition.delete(queueDef.Id)
    })

  })

  describe('QueueDefinitionのテスト1', () => {
    describe('QueueDefを作成する。期待値と比較するテスト。', () => {

      const expected = {
        Name: 'testQueue' + Math.floor(Math.random() * 1000),
        Description: 'Queue for UnitTest',
        AcceptAutomaticallyRetry: true, // 自動リトライ
        MaxNumberOfRetries: 3, // 最大リトライ数
        EnforceUniqueReference: true, // 一意の参照(一意のRefをつけるかどうか)
      }

      it('QueueDefテスト', async () => {
        let Id: number = 0
        try {
          const result = await api.queueDefinition.create(expected)
          Id = result.Id
          expect(result).toEqual({
            '@odata.context': expect.anything(),
            'AcceptAutomaticallyRetry': expected.AcceptAutomaticallyRetry,
            'AnalyticsDataJsonSchema': null,
            'CreationTime': expect.anything(),
            'Description': expected.Description,
            'EnforceUniqueReference': expected.EnforceUniqueReference,
            'Id': expect.anything(),
            'MaxNumberOfRetries': expected.MaxNumberOfRetries,
            'Name': expected.Name,
            'OutputDataJsonSchema': null,
            'ProcessScheduleId': null,
            'ReleaseId': null,
            'RiskSlaInMinutes': expect.anything(),
            'SlaInMinutes': expect.anything(),
            'SpecificDataJsonSchema': null
          })
          // 検索して、見つかること。
          const findResult = await api.queueDefinition.find(Id)
          expect(findResult.Id).toBe(Id)
        } catch (error) {
          console.log(Id)
          fail(error)
        } finally {
          // 最後に削除。
          await api.queueDefinition.delete(Id)
        }
      })

      afterEach(async () => { })
    })

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
        Reference: (Math.floor(Math.random() * 10000)).toString(),
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

    describe('Transactionの成功と失敗のテスト。', () => {
      it('tranTest', async () => {
        const newQueue1 = createQueueItem(testQueueDef.Name)
        const newQueue2 = createQueueItem(testQueueDef.Name)
        try {
          const result1 = await api.queueItem.create(newQueue1)
          const result2 = await api.queueItem.create(newQueue2)
          {// 1個目成功
            const queueItem = await robotApi.queueOperation.getQueueAndStartTransaction(testQueueDef.Name)
            const queueItemId: number = queueItem.Id

            expect(queueItem.Reference).toBe(result1.Reference)
            const status = {
              'transactionResult': {
                'IsSuccessful': true,
                'Output': {}
              }
            }
            await robotApi.queueOperation.setTransactionResult(queueItemId, status)
          }

          let systemFailRef: string = ''
          { // 2個目失敗、システム例外なので、再ラン
            const queueItem = await robotApi.queueOperation.getQueueAndStartTransaction(testQueueDef.Name)
            const queueItemId: number = queueItem.Id
            systemFailRef = queueItem.Reference

            expect(queueItem.Reference).toBe(result2.Reference)
            const status = {
              'transactionResult': {
                'IsSuccessful': false,
                'ProcessingException': {
                  'Reason': 'testError',
                  'Type': 'ApplicationException'
                },
                'Output': {}
              }
            }
            await robotApi.queueOperation.setTransactionResult(queueItemId, status)
          }
          { // システム例外後の再度のStartTransactionなので、先ほどと同じやつのリトライが取れるはず
            const queueItem = await robotApi.queueOperation.getQueueAndStartTransaction(testQueueDef.Name)
            const queueItemId: number = queueItem.Id

            expect(queueItem.Reference).toBe(systemFailRef) // 先ほどのRefと同じはず
            const status = {
              'transactionResult': {
                'IsSuccessful': false,
                'ProcessingException': {
                  'Reason': 'testError',
                  'Type': 'BusinessException'
                },
                'Output': {}
              }
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
    })

    afterEach(async () => {
      const queueDef = await api.queueDefinition.findByName(testQueueDef.Name)
      await api.queueDefinition.delete(queueDef.Id)
    })
  })
})