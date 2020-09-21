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

    await Promise.all([promiseForHost, promise]).then((fullPathsArray: Array<string[]>) => {
      for (const fullPaths of fullPathsArray) {
        api.util.excel2Console(...fullPaths)
      }
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
