import OrchestratorApi from '../src/index'
import { getLogger } from '../src/logger'
import { excel2json } from 'excel-csv-read-write'
import config from 'config'
import path from 'path'

const logger = getLogger('main')

describe('OrchestratorApi_machine000', () => {
  const api = new OrchestratorApi(config)

  let expecteds: Array<any> = []

  beforeEach(async () => {
    await api.authenticate()
    const dataPath = path.join(__dirname, 'testData', 'machines000.xlsx')
    expecteds = await excel2json(dataPath)
  })

  it('Normal Case.', async () => {
    try {
      // Step0. 登録
      const state1 = await api.machine.findAll()
      const createPromises = expecteds.map(expected =>
        api.machine.create({
          Name: expected.Name,
          Description: expected.Description,
          Type: expected.Type,
        }),
      )
      const machines = await Promise.all(createPromises)

      // Step1. 期待値と比較
      for (const [index, expected] of expecteds.entries()) {
        assertEqualsMachine(expected, machines[index])
      }

      const state2 = await api.machine.findAll()
      expect(state2.length).toEqual(state1.length + expecteds.length)

      // Step2. 削除
      const deletePromises = machines.map(machine => {
        return api.machine.delete(machine.Id)
      })
      await Promise.all(deletePromises)

      // Step3. 元に戻ったことの確認
      const state3 = await api.machine.findAll()
      expect(state3.length).toEqual(state1.length)
    } catch (error) {
      logger.error({ objects: error })
      fail(error)
    }
  })

  it('Normal Case(upload).', async () => {
    try {
      // Step0. 登録
      const state1 = await api.machine.findAll()
      const machines = await api.machine.upload(path.join(__dirname, 'testData', 'machines000.xlsx'))

      // Step1. 期待値と比較
      for (const [index, expected] of expecteds.entries()) {
        assertEqualsMachine(expected, machines[index])
      }

      const state2 = await api.machine.findAll()
      expect(state2.length).toEqual(state1.length + expecteds.length)

      // Step2. 削除
      const deletePromises = machines.map(machine => {
        return api.machine.delete(machine.Id)
      })
      await Promise.all(deletePromises)

      // Step3. 元に戻ったことの確認
      const state3 = await api.machine.findAll()
      expect(state3.length).toEqual(state1.length)
    } catch (error) {
      logger.error({ objects: error })
      fail(error)
    }
  })

  afterEach(async () => {
    const deletePromises = expecteds
      .map(expected => api.machine.findByMachineName(expected.Name)) // 検索してPromise取得
      .map(findPromise =>
        findPromise.then(machine => {
          // とれたらMachineを取り出し削除
          if (machine) {
            console.log(`Id: ${machine.Name} のロボットを削除`)
            return api.machine.delete(machine.Id)
          }
        }),
      )
    await Promise.all(deletePromises) // そのPromiseをawaitでまつ
  })
})

const assertEqualsMachine = (expectedInstance: any, actualInstance: any) => {
  // console.log(expectedMachine)
  // console.log(actualMachine)
  delete actualInstance['@odata.context']

  // テストデータにはちゃんとした値が入っていない(か入れられない)ため、なにか値が入っていればOKとした(null/undefinedはダメ)
  expectedInstance.Id = expect.anything()
  expectedInstance.LicenseKey = expect.anything()
  expectedInstance.RobotVersions = expect.anything()
  // 登録には使わないので、値が入っていればなんでもイイ

  // 空セルの置き換え
  // undifined -> null へ置き換える
  Object.assign(expectedInstance, {
    Description: expectedInstance.Description ? expectedInstance.Description : null, // undefined -> nullへ。
  })

  // デフォルト値への置き換え
  Object.assign(expectedInstance, {
    Type: expectedInstance.Type ? expectedInstance.Type : 'Standard', // undefined -> 'Standard' へ
  })

  expect(actualInstance).toEqual(expectedInstance)
}
