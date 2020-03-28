import OrchestratorApi from '../src/index'
import { getLogger } from '../src/logger'
import config from 'config'

const logger = getLogger('main')

describe('OrchestratorApi_job', () => {
  jest.setTimeout(10000)
  const api = new OrchestratorApi(config)

  beforeEach(async () => {
    await api.authenticate()
  })

  // あとでリファクタリングする
  // ロボットとプロセスがある前提のテストになってるが。。
  it('Jobの 開始/停止 のテスト', async () => {
    // ロボットを検索、リリースを検索、それぞれのキー項目で、JobをStartさせる
    const releases = await api.release.findAll()
    if (releases && releases.length > 0) {
      const processKey = releases[0].ProcessKey

      const robots = await api.robot.findAll()
      const robotNames: string[] = robots.map(robot => robot.Name)

      if (robotNames && robotNames.length > 0) {
        let result
        result = await api.job.startJobs(processKey, robotNames)
        logger.debug(result.value.length)

        await Promise.all(
          result.value.map((element: any) => {
            return api.job.stopJob(element.Id)
          }),
        )

        result = await api.job.startJobs(processKey, [], 5)
        logger.debug(result.value.length)

        await Promise.all(
          result.value.map((element: any) => {
            return api.job.stopJob(element.Id)
          }),
        )
      } else {
        console.log('Robotが存在しないため、テストできず。')
      }
    } else {
      console.log('実行対象のプロセスが存在しないため、テストできず。')
    }
  })
})
