import config from 'config'
import OrchestratorApi from '../../index'
import { randomName } from '../sampleUtils'

async function sample() {
  const api = new OrchestratorApi(config)

  // まずは認証
  await api.authenticate()
  try {
    // サンプル０．マシン登録
    const random = randomName()
    const machineName = `Machine_${random}`
    const testMachine = await api.machine.create({ Name: machineName }) // 登録する
    console.log(testMachine)

    // サンプル１．ロボットの登録
    const expectedRobot = createRobotData(testMachine) // 登録データを作成
    console.log(expectedRobot)
    const resultRobot = await api.robot.create(expectedRobot) // 登録
    console.log(resultRobot)

    const theMachine = await api.machine.findByMachineName(machineName)
    console.log(theMachine)

    // todo いずれサービス化予定
    // 無効にしてみた。
    await api.postData(`/odata/LicensesRuntime('${theMachine.Name}')/UiPath.Server.Configuration.OData.ToggleEnabled`, {
      key: theMachine.Name,
      robotType: 'Unattended',
      enabled: false,
    })

    const robotTypes = ['NonProduction', 'Attended', 'Unattended', 'Development', 'StudioX']
    for (const robotType of robotTypes) {
      console.log(`--- Runtime (${robotType}) ---`)
      const results1 = await api.getArray(
        `/odata/LicensesRuntime/UiPath.Server.Configuration.OData.GetLicensesRuntime(robotType='${robotType}')`,
      )
      console.table(results1)

      console.log(`--- NamedUser (${robotType}) ---`)
      const results2 = await api.getArray(
        `/odata/LicensesNamedUser/UiPath.Server.Configuration.OData.GetLicensesNamedUser(robotType='${robotType}')`,
      )
      console.table(results2)
    }
  } catch (error) {
    console.error(error)
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
    Type: 'Unattended', //未指定だとNonProduction
  }
}

if (!module.parent) {
  (async () => {
    await sample()
  })()
}
