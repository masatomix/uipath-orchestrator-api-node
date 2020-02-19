import OrchestratorApi from '../src/index'

import config from 'config'

describe('OrchestratorApi_queue', () => {

  const api = new OrchestratorApi(config)

  beforeEach(async () => {
    await api.authenticate()
  })

  describe('OrchestratorApi のテスト', () => {

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
      const queueDefs: any[] = await api.queueDefinition.findByName(testQueueDef.Name)
      // console.table(queueDefs)
      for (const queueDef of queueDefs) {
        await api.queueDefinition.delete(queueDef.Id)
      }
    })

  })


  describe('OrchestratorApi のテスト1', () => {
    describe('QueueDefを作成する。期待値と比較するテスト。', () => {

      const expected = {
        Name: 'testQueue' + Math.floor(Math.random() * 1000),
        Description: 'Queue for UnitTest',
        AcceptAutomaticallyRetry: true, // 自動リトライ
        MaxNumberOfRetries: 3, // 最大リトライ数
        EnforceUniqueReference: true, // 一意の参照(一意のRefをつけるかどうか)
      }

      it('Queue登録テスト', async () => {
        let Id: number = 0
        try {
          // Queueへデータ投入
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

          // // date で投げたデータは文字列で返ってくるので、再度オブジェクトにして比較。
          // expect(typeof result.SpecificContent.MailDate).toBe('string')
          // // expect(result.SpecificContent.MailDate).toBeInstanceOf(String) // なんかうまくいかない
          // expect(new Date(result.SpecificContent.MailDate)).toMatchObject(expected.MailDate)

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
})
