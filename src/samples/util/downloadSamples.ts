import config from 'config'
import OrchestratorApi from '../../index'

async function main() {
  const api = new OrchestratorApi(config)

  try {
    // まずは認証
    await api.authenticate()
    await api.util.excelDownload('./')
  } catch (error) {
    console.log(error)
  }
}

if (!module.parent) {
  ;(async () => {
    await main()
  })()
}
