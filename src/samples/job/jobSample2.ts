import config from 'config'
import OrchestratorApi from '../../index'
import { getLogger } from '../../logger'

const logger = getLogger('main')

/**
 * こちらはOC画面上の「動的に割り当てる」でのジョブ登録サンプル。
 * プロセスの名前と実行回数を使って、ジョブを登録・スタートさせます
 */
async function sample() {
  const api = new OrchestratorApi(config)
  await api.authenticate()

  // const robotNames:string[] = await createRobotNames(api) // ロボット名は使わない
  const processKey: string = await createProcessKey(api)

  // パラメタはプロセス名と、3回実行する、という回数
  const result: any = await api.job.startJobs(processKey, [], 3)
  logger.info(result.value)
}

// async function createRobotNames(api_: OrchestratorApi): Promise<string[]> {
//   const robots = await api_.robot.findAll()
//   if (!robots || robots.length === 0) {
//     throw new Error('Robotが存在しないため、終了')
//   }
//   const robotNames: string[] = robots.map(robot => robot.Name)
//   return robotNames
// }

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
