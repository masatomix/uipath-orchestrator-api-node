import config from 'config'
import OrchestratorApi from '../../index'
import path from 'path'

async function main() {
  const api = new OrchestratorApi(config)

  try {
    // まずは認証
    await api.authenticate()
    await api.util.excelDownload('./')

    const files = [
      'assets.xlsx',
      // 'hostLicenses.xlsx',
      'machines.xlsx',
      'processes.xlsx',
      'releases.xlsx',
      'libraries.xlsx',
      'settings.xlsx',
      'users.xlsx',
      'environments.xlsx',
      'jobs.xlsx',
      'perRobot_assets.xlsx',
      'queueDefinitions.xlsx',
      'robots.xlsx',
      // 'tenants.xlsx',
    ].map((file) => path.join('./', file))
    // console.log(files)
    api.util.excel2Console(...files)
  } catch (error) {
    console.log(error)
  }
}

if (!module.parent) {
  (async () => {
    await main()
  })()
}
