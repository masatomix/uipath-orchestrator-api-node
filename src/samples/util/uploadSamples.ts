import config from 'config'
import OrchestratorApi from '../../index'

async function main() {
  const api = new OrchestratorApi(config)

  try {
    // まずは認証
    await api.authenticate()
    let instances: any[] = []

    await api.machine.upload('machines.xlsx')
    instances = await api.machine.findAll()
    console.table(instances)

    await api.robot.upload('robots.xlsx')
    instances = await api.robot.findAll()
    console.table(instances)

    await api.asset.uploadPerRobot('assets.xlsx', 'perRobot_assets.xlsx')
    instances = await api.asset.findAllEx()
    console.table(instances)

    await api.user.upload('users.xlsx')
    instances = await api.user.findAll()
    console.table(instances)

    const settings = await api.setting.readSettingsFromFile('settings.xlsx')
    const updateList = api.setting.findByKeyFromArray(settings)(
      'Alerts.Email.Enabled',
      'Abp.Net.Mail.DefaultFromAddress',
      'Abp.Net.Mail.DefaultFromDisplayName',
    )
    await api.setting.update(updateList)

    instances = await api.setting.findByKey()(
      'Alerts.Email.Enabled',
      'Abp.Net.Mail.DefaultFromAddress',
      'Abp.Net.Mail.DefaultFromDisplayName',
    )
    console.table(instances)
  } catch (error) {
    console.log(error)
  }
}

if (!module.parent) {
  (async () => {
    await main()
  })()
}
