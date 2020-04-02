import config from 'config'
import OrchestratorApi from '../../index'

async function sample() {
  const api = new OrchestratorApi(config)
  await api.authenticate()

  const processKey: string = await createProcessKey(api)

  const jobs: any = await api.job.startJobs(processKey, [], 3)
  console.log(jobs.value)

  await Promise.all(
    jobs.value.map((job: any) => {
      return api.job.stopJob(job.Id)
      // ちなみに引数にtrueを渡すと、強制終了を行います。
      // return api.job.stopJob(element.Id, true)
    }),
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
  (async () => {
    await sample()
  })()
}
