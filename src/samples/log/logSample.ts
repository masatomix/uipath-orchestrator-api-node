import config from 'config'
import OrchestratorApi from '../../index'
import logger from '../../logger'

async function sample() {
  const api = new OrchestratorApi(config)
  await api.authenticate()
  try {
    let logs: any[] = []
    // const JobKey = 'B8ED2BE1-7F79-4FE9-A6CA-9BA9EE54D782' // コレはNG。JobKeyだとフィルタできないぽい
    // logs = await api.log.findAll({ $filter: `JobKey eq '${JobKey}'` })

    // サンプル1、日付指定など
    const from = '2020/03/02 00:00'
    const to = '2020-03-03 00:00'

    logs = await api.log.findByFilter({
      level: 'INFO',
      from: new Date(from),
      to: new Date(to),
      // robotName: 'Robot01',
      // windowsIdentity: 'WINDOWS\\kino',
      // machineName: 'WINDOWS',
      // processName: 'RoboticEnterpriseFramework_Main',
    })
    printLog(logs)

    // サンプル2、$filter以外の指定方法.TOP3件にしぼりかつ、項目も絞ってる
    logs = await api.log.findByFilter(
      {
        level: 'INFO',
        from: new Date(from),
        to: new Date(to),
      },
      { $top: 3, $select: 'JobKey,ProcessName,TimeStamp' },
    )
    printLog(logs)
  } catch (error) {
    logger.error(error)
  }
}

async function printLog(logs: any[]) {
  console.log(logs[0])
  // 表で出力するとき RawMessage ちょっとジャマなので削除
  // また、多いので出力を5件だけにしちゃう
  logs.map(log => delete log.RawMessage)
  const filteredLogs = logs.filter((_, index) => index < 5)

  console.table(filteredLogs)
  console.log(`${logs.length} 件でした`)
}

if (!module.parent) {
  ;(async () => {
    await sample()
  })()
}
