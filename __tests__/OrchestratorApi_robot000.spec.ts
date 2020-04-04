import OrchestratorApi from '../src/index'
import { getLogger } from '../src/logger'
import { xlsx2json } from '../src/utils'
import config from 'config'
import path from 'path'

const logger = getLogger('main')

describe('OrchestratorApi_robot000', () => {
  const api = new OrchestratorApi(config)

  let expecteds: Array<any> = []

  beforeEach(async () => {
    await api.authenticate()

    await api.machine.upload(path.join(__dirname, 'testData', 'machines001.xlsx'))
    const dataPath = path.join(__dirname, 'testData', 'robots000.xlsx')
    expecteds = await xlsx2json(dataPath)
  })

  it('Normal Case.', async () => {
    try {
      // Step0. 登録
      const state1 = await api.robot.findAll()

      const createPromises = expecteds.map(async expected => {
        // Machineがなかったら、つくるって処理も入れるべきだが一旦ナシで。
        // tmpを一度検索しているのは、Machine名検索だけだと、LicenseKey が空になるので、Idで再検索する。
        const tmp = await api.machine.findByMachineName(expected.MachineName)
        const machine = await api.machine.find(tmp.Id)
        return api.robot.create({
          MachineName: expected.MachineName,
          LicenseKey: machine.LicenseKey,
          Name: expected.Name,
          Username: expected.Username,
          Type: expected.Type,
          RobotEnvironments: expected.RobotEnvironments,
        })
      })
      const robots = await Promise.all(createPromises)

      // Step1. 期待値と比較
      for (const [index, expected] of expecteds.entries()) {
        assertEqualsRobot(expected, robots[index])
      }

      const state2 = await api.robot.findAll()
      expect(state2.length).toEqual(state1.length + expecteds.length)

      // Step2. 削除
      const deletePromises = robots.map(robot => {
        return api.robot.delete(robot.Id)
      })
      await Promise.all(deletePromises)

      // Step3. 元に戻ったことの確認
      const state3 = await api.robot.findAll()
      expect(state3.length).toEqual(state1.length)
    } catch (error) {
      logger.error({ objects: error })
      fail(error)
    }
  })

  it('Normal Case(upload).', async () => {
    jest.setTimeout(10000)
    try {
      // Step0. 登録
      const state1 = await api.robot.findAll()
      const robots = await api.robot.upload(path.join(__dirname, 'testData', 'robots000.xlsx'))

      // Step1. 期待値と比較
      for (const [index, expected] of expecteds.entries()) {
        assertEqualsRobot(expected, robots[index])
      }

      const state2 = await api.robot.findAll()
      expect(state2.length).toEqual(state1.length + expecteds.length)

      // Step2. 削除
      const deletePromises = robots.map(robot => {
        return api.robot.delete(robot.Id)
      })
      await Promise.all(deletePromises)

      // Step3. 元に戻ったことの確認
      const state3 = await api.robot.findAll()
      expect(state3.length).toEqual(state1.length)
    } catch (error) {
      logger.error({ objects: error })
      fail(error)
    }
  })

  afterEach(async () => {
    {
      const deletePromises = expecteds
        .map(expected => api.robot.findByRobotName(expected.Name)) // 検索してPromise取得
        .map(findPromise =>
          findPromise.then(robot => {
            // とれたらMachineを取り出し削除
            if (robot) {
              console.log(`Id: ${robot.Name} のロボットを削除`)
              return api.robot.delete(robot.Id)
            }
          }),
        )
      await Promise.all(deletePromises) // そのPromiseをawaitでまつ
    }
    {
      const dataPath = path.join(__dirname, 'testData', 'machines001.xlsx')
      const machines = await xlsx2json(dataPath)

      const deletePromises = machines
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
    }
  })
})

const assertEqualsRobot = (expectedInstance: any, actualInstance: any) => {
  // console.log(expectedMachine)
  // console.log(actualMachine)

  delete actualInstance['@odata.context']

  // テストデータにはちゃんとした値が入っていない(か入れられない)ため、なにか値が入っていればOKとした(null/undefinedはダメ)
  expectedInstance.Id = expect.anything()
  expectedInstance.LicenseKey = expect.anything()
  expectedInstance.MachineId = expect.anything()
  expectedInstance.RobotEnvironments = expect.anything()
  expectedInstance.UserId = expect.anything()
  // expectedInstance.RobotVersions = expect.anything()
  // // 登録には使わないので、値が入っていればなんでもイイ

  // 空セルの置き換え
  // undifined -> null へ置き換える
  Object.assign(expectedInstance, {
    Description: expectedInstance.Description ? expectedInstance.Description : null, // undefined -> nullへ。
    ExternalName: expectedInstance.ExternalName ? expectedInstance.ExternalName : null, // undefined -> nullへ。
    Version: expectedInstance.Version ? expectedInstance.Version : null, // undefined -> nullへ。
    ExecutionSettings: expectedInstance.ExecutionSettings ? expectedInstance.ExecutionSettings : null, // undefined -> nullへ。
  })

  // デフォルト値への置き換え
  Object.assign(expectedInstance, {
    Password: '', // パスワード列は常にカラが取得できるはず
    Type: expectedInstance.Type ? expectedInstance.Type : 'Standard', // undefined -> 'Standard' へ
  })

  expect(actualInstance).toEqual(expectedInstance)
}
