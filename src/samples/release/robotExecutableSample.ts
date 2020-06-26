import config from 'config'
import OrchestratorApi from '../../index'

/**
 * 指定したロボット名と、指定したプロセスキー(OCプロセス画面上の「名前」)を与えると、ロボットがそのプロセスを実行可能か、をbooleanで返す
 * @param processKey OCプロセス画面上の「名前」。タスクトレイ上のロボットのプロセス名(こちらには「_ロボットグループ名」がついてます) ではないので、ご注意
 * @param robotName ロボット名
 * @param organizationUnitId フォルダのId (フォルダ名の方が親切だけど今回は割愛)
 */
async function isExecutable(processKey: string, robotName: string, organizationUnitId: number): Promise<boolean> {
  // API のインスタンスを生成
  const api = new OrchestratorApi(config)
  // Folder(OrganizationUnitId) を設定
  api.organizationUnitId = organizationUnitId

  // 認証する(設定ファイルに基づいて、オンプレやクラウドどちらでも認証可能)
  await api.authenticate()
  // 名前でプロセスを検索
  const release: any = await api.release.findByProcessKey(processKey)
  console.log(`トレイ上のプロセス名: ${release.Name}`)
  console.log(`紐付くロボットグループ: ${release.EnvironmentName}`)
  // ↑デバッグ文

  // 名前でロボットを検索
  const robot = await api.robot.findByRobotName(robotName)
  const robotEnvironments: Array<string> = robot.RobotEnvironments.split(',')
  console.log(`ロボが属するロボットグループ(配列): ${robotEnvironments}`)
  // ↑デバッグ文

  if (robotEnvironments.length > 0) {
    // ロボが属するグループ名を繰り返しチェックして、プロセスのグループ名と一致しているモノが一つでもあったらtrue/なかったらfalse
    return robotEnvironments.filter((robotEnvironment) => robotEnvironment == release.EnvironmentName).length > 0
  }
  return false
}

// 以下サンプル
const organizationUnitId = 3
const processKey = 'Hello2'
const robotName = 'WINDOWS_ROBO'

if (!module.parent) {
  ;(async () => {
    const result: boolean = await isExecutable(processKey, robotName, organizationUnitId)
    console.log(`${robotName} は ${processKey} を実行可能？ ${result}`)
  })()
}

// % npx ts-node ./src/samples/release/robotExecutableSample.ts
// トレイ上のプロセス名: Hello2_test2
// 紐付くロボットグループ: test2
// ロボが属するロボットグループ(配列): test2,test1
// WINDOWS_ROBO は Hello2 を実行可能？ true
// %
