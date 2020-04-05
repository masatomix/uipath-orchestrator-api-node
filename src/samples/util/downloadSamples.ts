import config from 'config'
import OrchestratorApi from '../../index'
import path from 'path'

async function main() {
  const api = new OrchestratorApi(config)
  const hostApi = new OrchestratorApi((config as any).hostLicense)

  try {
    // まずは認証
    await api.authenticate()
    await hostApi.authenticate()
    const promise = api.util.excelDownload('./')
    const promiseForHost = hostApi.util.excelDownloadForHost('./')

    promise.then((fullPaths) => {
      // console.log(fullPaths)
      api.util.excel2Console(...fullPaths)
    })

    promiseForHost.then((fullPaths) => {
      // console.log(fullPaths)
      api.util.excel2Console(...fullPaths)
    })
  } catch (error) {
    console.log(error)
  }
}

if (!module.parent) {
  (async () => {
    await main()
  })()
}
