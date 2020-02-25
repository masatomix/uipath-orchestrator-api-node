import config from 'config'
import OrchestratorApi from '../../index'
import logger from '../../logger'

async function sample() {
  const api = new OrchestratorApi(config)

  // まずは認証
  await api.authenticate()
  try {
    const processId = 'Attended_FrameWork'
    const processes: any[] = await api.process.findAll({ $filter: `Id eq '${processId}'` })
    console.table(processes)
    // ┌─────────┬──────────┬───────┬─────────────────┬────────────────────────────────────┬──────────────────────────────┬────────────────────────────────┬─────────────────┬────────────┬──────────────┬──────────┬──────────────────────┬───────────────────────────────┐
    // │ (index) │ IsActive │ Title │     Version     │                Key                 │         Description          │           Published            │ IsLatestVersion │ OldVersion │ ReleaseNotes │ Authors  │          Id          │           Arguments           │
    // ├─────────┼──────────┼───────┼─────────────────┼────────────────────────────────────┼──────────────────────────────┼────────────────────────────────┼─────────────────┼────────────┼──────────────┼──────────┼──────────────────────┼───────────────────────────────┤
    // │    0    │  false   │ null  │ '1.0.7120.2411' │ 'Attended_FrameWork:1.0.7120.2411' │ 'Attended Robot REFramework' │ '2020-02-25T10:47:25.8688789Z' │      true       │    null    │     null     │ 'm-kino' │ 'Attended_FrameWork' │ { Input: null, Output: null } │
    // └─────────┴──────────┴───────┴─────────────────┴────────────────────────────────────┴──────────────────────────────┴────────────────────────────────┴─────────────────┴────────────┴──────────────┴──────────┴──────────────────────┴───────────────────────────────┘

    const samplePackages: any[] = await api.process.findPackage(processId)
    console.table(samplePackages)
    // ┌─────────┬──────────┬───────┬──────────────────┬─────────────────────────────────────┬──────────────────────────────┬────────────────────────────────┬─────────────────┬────────────┬──────────────┬──────────┬──────────────────────┬───────────────────────────────┐
    // │ (index) │ IsActive │ Title │     Version      │                 Key                 │         Description          │           Published            │ IsLatestVersion │ OldVersion │ ReleaseNotes │ Authors  │          Id          │           Arguments           │
    // ├─────────┼──────────┼───────┼──────────────────┼─────────────────────────────────────┼──────────────────────────────┼────────────────────────────────┼─────────────────┼────────────┼──────────────┼──────────┼──────────────────────┼───────────────────────────────┤
    // │    0    │  false   │ null  │ '1.0.7120.2411'  │ 'Attended_FrameWork:1.0.7120.2411'  │ 'Attended Robot REFramework' │ '2020-02-25T10:47:25.8688789Z' │      true       │    null    │     null     │ 'm-kino' │ 'Attended_FrameWork' │ { Input: null, Output: null } │
    // │    1    │  false   │ null  │ '1.0.7115.18328' │ 'Attended_FrameWork:1.0.7115.18328' │ 'Attended Robot REFramework' │ '2020-02-25T10:47:25.4001001Z' │      false      │    null    │     null     │ 'pbkino' │ 'Attended_FrameWork' │ { Input: null, Output: null } │
    // └─────────┴──────────┴───────┴──────────────────┴─────────────────────────────────────┴──────────────────────────────┴────────────────────────────────┴─────────────────┴────────────┴──────────────┴──────────┴──────────────────────┴───────────────────────────────┘

    await Promise.all(
      samplePackages.map(
        samplePackage => api.process.downloadPackage(samplePackage.Id, samplePackage.Version)
      ))
  } catch (error) {
    logger.error(error)
  }
}

if (!module.parent) {
  (async () => {
    await sample()
  })()
}
