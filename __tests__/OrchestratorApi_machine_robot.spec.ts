import OrchestratorApi from '../src/index'
import { randomName, createRobotData } from '../src/samples/sampleUtils'
import config from 'config'
import logger from '../src/logger'

describe('OrchestratorApi_machine_robot', () => {
  const api = new OrchestratorApi(config)

  let testRobotId: number
  let testMachineId: number

  beforeEach(async () => {
    await api.authenticate()
    testRobotId = NaN
    testMachineId = NaN
  })

  it('マシンの登録・ロボットの登録・検索・削除、のテスト。マシンの削除も。', async () => {
    jest.setTimeout(10000)
    try {
      // サンプル０．マシン登録
      const random = randomName()
      const machineName = `Machine_${random}`
      const testMachine = await api.machine.create({ Name: machineName }) // 登録する

      // サンプル１．ロボットの登録
      const expectedRobot = createRobotData(testMachine) // 投入データ作成
      const resultRobot = await api.robot.create(expectedRobot)

      testRobotId = resultRobot.Id
      testMachineId = testMachine.Id

      // 検証
      assertEqualsRobot0(expectedRobot, resultRobot)

      // サンプル２．ロボットを条件指定で検索・取得する
      const machinename = expectedRobot.MachineName
      const userName = expectedRobot.Username

      let instances = []
      instances = await api.robot.findAll({
        $filter: `MachineName eq '${machinename}' and Username eq '${userName}'`,
      })
      assertEqualsRobotForSearch(expectedRobot, instances[0])

      // サンプル３． ロボットを全件取得する
      instances = await api.robot.findAll()
      for (const instance of instances) {
        // サンプル２. ロボットをPK指定で取得する
        const robotId: number = instance.Id
        const robot = await api.robot.find(robotId)
        assertEqualsRobotWithOutkey(robot, instance)
      }
    } catch (error) {
      logger.error(error)
      fail(error)
    } finally {
    }
  })

  it('Machine/Robot update test', async () => {
    try {
      // Machineの更新テスト
      // まずはマシンの作成
      const random = randomName()
      const machineName = `Machine_${random}`
      const testMachine = await api.machine.create({ Name: machineName }) // 登録する

      // ロボットの作成
      const expectedRobot = createRobotData(testMachine)
      const testRobot = await api.robot.create(expectedRobot)
      // afterで削除するためキー値を保持
      testRobotId = testRobot.Id
      testMachineId = testMachine.Id

      testMachine.Description = 'TestTestTest'
      await api.machine.update(testMachine)

      // 更新したので、再度検索
      const resultMachine = await api.machine.find(testMachine.Id)
      assertEqualsMachine(testMachine, resultMachine)
      // Machineの更新テスト以上

      // Robotも変更してみる
      testRobot.Name = 'hogeRobot'
      await api.robot.update(testRobot)
      const resultRobot = await api.robot.find(testRobot.Id)

      assertEqualsRobotWithOutkey(testRobot, resultRobot)
    } catch (error) {
      logger.error(error)
      fail(error)
    } finally {
    }
  })

  afterEach(async () => {
    logger.info(`Id: ${testRobotId} のロボットを削除`)
    await api.robot.delete(testRobotId)
    logger.info(`Id: ${testMachineId} のマシンを削除`)
    await api.machine.delete(testMachineId)
  })
})

const assertEqualsMachine = (expectedMachine: any, actualMachine: any) => {
  delete expectedMachine.RobotVersions
  delete actualMachine.RobotVersions
  expect(actualMachine).toEqual(expectedMachine)
}

const assertEqualsRobot0 = (expectedRobot: any, resultRobot: any) => {
  const resultRobotForTest = {
    LicenseKey: resultRobot.LicenseKey,
    MachineName: resultRobot.MachineName,
    Name: resultRobot.Name,
    Type: resultRobot.Type,
    Username: resultRobot.Username,
  }
  expect(resultRobotForTest).toEqual(expectedRobot)
}

const assertEqualsRobotForSearch = (expected: any, actual: any) => {
  const resultRobotForTest = {
    LicenseKey: actual.LicenseKey,
    MachineName: actual.MachineName,
    Name: actual.Name,
    Type: actual.Type,
    Username: actual.Username,
  }
  expect(resultRobotForTest).toEqual({
    LicenseKey: null, // 条件検索した場合は、LicensKeyがnullになっちゃう。
    MachineName: expected.MachineName,
    Name: expected.Name,
    Type: expected.Type,
    Username: expected.Username,
  })
}

const assertEqualsRobotWithOutkey = (expected: any, actual: any) => {
  delete expected.LicenseKey
  delete actual.LicenseKey

  delete expected.Password
  delete actual.Password

  delete expected['@odata.context']
  delete actual['@odata.context']

  delete expected.CredentialStoreId
  delete actual.CredentialStoreId

  delete expected.CredentialType
  delete actual.CredentialType

  expect(actual).toEqual(expected)
}
