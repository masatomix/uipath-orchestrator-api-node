import config from 'config'
import OrchestratorApi from '../../index'
import logger from '../../logger'

async function sample() {
  const api = new OrchestratorApi(config)

  // まずは認証
  await api.authenticate()
  try {
    const releases: any[] = await api.release.findAll()
    logger.info(releases)

    const release: any = await api.release.findByProcessKey('MyAttendedFramework') // 画面の名前でも検索できる
    logger.info(release)
  } catch (error) {
    logger.error(error)
  }
}

if (!module.parent) {
  (async () => {
    await sample()
  })()
}
