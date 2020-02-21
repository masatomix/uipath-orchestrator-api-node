import config from 'config'
import OrchestratorApi from '../index'
import logger from '../logger'
import { randomName, createMachine } from './sampleUtils'


async function sample() {
  const api = new OrchestratorApi(config)

  // まずは認証
  await api.authenticate()
  try {
    // サンプル０．マシン登録
    const random = randomName()
    const machineName = `Machine_${random}`
    const testMachine = await api.machine.create({ Name: machineName }) // 登録する


    // サンプル１．ロボットの登録
    const expectedRobot = createRobotData(testMachine) // 登録データを作成
    logger.debug(expectedRobot)
    const resultRobot = await api.robot.create(expectedRobot) // 登録
    logger.debug(resultRobot)

    // サンプル２．ロボットを条件指定で検索・取得する
    const machinename = expectedRobot.MachineName
    const userName = expectedRobot.Username

    let instances = []
    instances = await api.robot.findAll({
      $filter: `MachineName eq '${machinename}' and Username eq '${userName}'`,
    })
    console.table(instances) // ちなみに、条件検索での戻り値には、なぜかLicenseKeyが入っていない。

    // サンプル３． ロボットを全件取得する
    instances = await api.robot.findAll()
    for (const instance of instances) {
      // サンプル２. ロボットをPK指定で取得する
      const robotId: number = instance.Id
      const robot = await api.robot.find(robotId)
      logger.debug(robot)
    }

  } catch (error) {
    logger.error(error)
  }
}

// マシン名、ロボット名、そのWindowsアカウントとも一意になる任意の名称RobotのObjを作成するメソッド。
export function createRobotData(testMachine: any) {
  const random = randomName()
  return {
    MachineName: testMachine.Name, // 取得したマシン名
    LicenseKey: testMachine.LicenseKey, // 取得したライセンスキー
    Name: `${randomName('test_')}_${random}`, // ランダム値
    Username: `xx\\xxxx_${random}`, // ランダム値
    Type: 'Development', //未指定だとNonProduction
    // RobotEnvironments: ''
  }
}

(async () => {
  if (!module.parent) {
    await sample()
  }
})()
