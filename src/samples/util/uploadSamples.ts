import config from 'config'
import OrchestratorApi from '../../index'
import { xlsx2json } from '../../utils'

async function main() {
  const api = new OrchestratorApi(config)

  try {
    // まずは認証
    await api.authenticate()
    let instances: any[] = []
    let r: any

    await api.machine.upload('machines.xlsx')
    r = await api.machine.findAll()
    console.table(r)

    // instances = await api.robot.findAll()
    // await api.robot.save2Excel(instances, 'robots1.xlsx')
    await api.robot.upload('robots.xlsx')
    r = await api.robot.findAll()
    console.table(r)

    // instances = await api.release.findAll()
    // await api.release.save2Excel(instances, 'releases.xlsx')
    // r = await xlsx2json('releases.xlsx')
    // console.table(r)

    // instances = await api.process.findAll()
    // await api.process.save2Excel(instances, 'processes.xlsx')
    // r = await xlsx2json('processes.xlsx')
    // console.table(r)

    // instances = await api.job.findAll()
    // await api.job.save2Excel(instances, 'jobs.xlsx')
    // r = await xlsx2json('jobs.xlsx')
    // console.table(r)

    // instances = await api.user.findAll()
    // await api.user.save2Excel(instances, 'users.xlsx') //Fix
    // r = await xlsx2json('users.xlsx')
    // console.table(r)

    // instances = await api.setting.findAll()
    // await api.setting.save2Excel(instances, 'settings.xlsx')
    // r = await xlsx2json('settings.xlsx')
    // console.table(r)

    // // instances = await api.schedule.findAll()

    // instances = await api.queueDefinition.findAll()
    // await api.queueDefinition.save2Excel(instances, 'queueDefinitions.xlsx')
    // r = await xlsx2json('queueDefinitions.xlsx')
    // console.table(r)

    // // // instances = await api.queueItem.findAll()

    // instances = await api.log.findStartEndLogs({
    //   from: new Date('2020/03/02 00:00'),
    //   // to: new Date('2020/03/03 00:00'),
    // })
    // await api.log.save2Excel(instances, 'logs.xlsx')

    // instances = await api.auditLog.findByFilter(
    //   {
    //     from: new Date('2020/03/07 01:00'),
    //     // to: new Date('2020/03/07 01:45'),
    //   },
    //   { $top: 100 },
    // )
    // await api.auditLog.save2Excel(instances, 'auditLog.xlsx')
  } catch (error) {
    console.log(error)
  }
}

if (!module.parent) {
  ;(async () => {
    await main()
  })()
}
