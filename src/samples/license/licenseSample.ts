import config from 'config'
import OrchestratorApi from '../../index'
import logger from '../../logger'

async function sample() {
  const api = new OrchestratorApi(config)

  // まずは認証
  await api.authenticate()
  try {
    // ライセンスを取得する
    const license: any = await api.license.find()
    logger.info(license)
  } catch (error) {
    logger.error(error)
  }
}

if (!module.parent) {
  (async () => {
    await sample()
  })()
}
