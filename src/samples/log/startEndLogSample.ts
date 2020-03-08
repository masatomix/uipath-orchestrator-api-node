import config from 'config'
import OrchestratorApi from '../../index'
import logger from '../../logger'
// import os from 'os'

async function sample() {
  const api = new OrchestratorApi(config)
  await api.authenticate()
  try {
    // サンプル1、日付指定など
    const from = '2020/03/02 00:00'
    const to = '2020/03/03 00:00'
    const logs: any[] = await api.log.findStartEndLogs({
      from: new Date(from),
      to: new Date(to),
      // robotName: 'Robot01',
      // windowsIdentity: 'WINDOWS\\kino',
      // machineName: 'WINDOWS',
      // processName: 'RoboticEnterpriseFramework_Main',
    })
    printLog(logs)
    api.log.save2Excel(logs, 'download.xlsx')
  } catch (error) {
    logger.error(error)
  }
}

async function printLog(logs: any[]) {
  console.log(logs[0])
  // 表で出力するとき RawMessage ちょっとジャマなので削除
  // また、多いので出力を5件だけにしちゃう
  logs.map(log => delete log.RawMessage)

  console.table(logs)
  console.log(`${logs.length} 件でした`)
}

if (!module.parent) {
  ;(async () => {
    await sample()
  })()
}
