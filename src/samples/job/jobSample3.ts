import config from 'config'
import OrchestratorApi from '../../index'
import logger from '../../logger'

async function sample() {
  const api = new OrchestratorApi(config)
  await api.authenticate()

  const processKey: string = await createProcessKey(api)

  const result: any = await api.job.startJobs(processKey, [], 3)
  logger.info(result.value)

  await Promise.all(
    result.value.map((element: any) => {
      return api.job.stopJob(element.Id)
      // const force: boolean = true
      // return api.job.stopJob(element.Id, force)
    })
  )
}

async function createProcessKey(api_: OrchestratorApi): Promise<string> {
  const releases = await api_.release.findAll()
  if (!releases || releases.length === 0) {
    throw new Error('実行対象のプロセスが存在しないため、終了')
  }
  return releases[0].ProcessKey
}

if (!module.parent) {
  ;(async () => {
    await sample()
  })()
}
