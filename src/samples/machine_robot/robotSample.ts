import config from 'config'
import OrchestratorApi from '../../index'
import logger from '../../logger'
import { randomName, createRobotData } from '../sampleUtils'


async function sample() {
  const api = new OrchestratorApi(config)

  // まずは認証
  await api.authenticate()
  try {
    // サンプル０．マシン登録
    const random = randomName()
    const machineName = `Machine_${random}`
    const testMachine = await api.machine.create({ Name: machineName }) // 登録する
    logger.info(testMachine)

    // サンプル１．ロボットの登録
    const expectedRobot = createRobotData(testMachine) // 登録データを作成
    logger.info(expectedRobot)
    const resultRobot = await api.robot.create(expectedRobot) // 登録
    logger.info(resultRobot)

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
      logger.info(robot)
    }

  } catch (error) {
    logger.error(error)
  }
}

if (!module.parent) {
  (async () => {
    await sample()
  })()
}