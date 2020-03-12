import config from 'config'
import OrchestratorApi from '../../index'
import logger from '../../logger'

async function sample() {
  const api = new OrchestratorApi(config)
  await api.authenticate()
  try {
    let logs: any[] = []

    const from = '2020/03/07 01:00'
    const to = '2020/03/07 01:45'

    logs = await api.auditLog.findByFilter(
      {
        // action: 'Delete',
        // userName: 'masatomix',
        component: 'Robots',
        // methodName: 'Delete',
        from: new Date(from),
        to: new Date(to),
      },
      { $top: 100 },
    )
    printLog(logs)
  } catch (error) {
    logger.error(error)
  }
}

async function printLog(logs: any[]) {
  console.log(logs[0])
  console.table(logs)
  console.log(`${logs.length} 件でした`)
}

if (!module.parent) {
  (async () => {
    await sample()
  })()
}