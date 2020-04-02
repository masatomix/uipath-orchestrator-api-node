import config from 'config'
import OrchestratorApi from '../../index'


/**
 * OC画面上の「特定のロボット」でのジョブ登録サンプル。
 * ロボット名 と プロセスの名前を使って、ジョブを登録・スタートさせます
 */
async function sample() {
  const api = new OrchestratorApi(config)
  await api.authenticate()

  const robotNames: string[] = await createRobotNames(api)
  const processKey: string = await createProcessKey(api)

  // パラメタはプロセス名と、ロボット名
  const result: any = await api.job.startJobs(processKey, robotNames)
  console.log(result.value)
}

async function createRobotNames(api_: OrchestratorApi): Promise<string[]> {
  const robots = await api_.robot.findAll()
  if (!robots || robots.length === 0) {
    throw new Error('Robotが存在しないため、終了')
  }
  const robotNames: string[] = robots.map(robot => robot.Name)
  return robotNames
}

async function createProcessKey(api_: OrchestratorApi): Promise<string> {
  const releases = await api_.release.findAll()
  if (!releases || releases.length === 0) {
    throw new Error('実行対象のプロセスが存在しないため、終了')
  }
  return releases[0].ProcessKey
}

if (!module.parent) {
  (async () => {
    await sample()
  })()
}
