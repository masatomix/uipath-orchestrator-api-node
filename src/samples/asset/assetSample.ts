import config from 'config'
import OrchestratorApi from '../../index'
import { getLogger } from '../../logger'

const logger = getLogger('main')

async function sample() {
  const api = new OrchestratorApi(config)

  // まずは認証
  await api.authenticate()
  try {
    let assets: any[] = await api.asset.findAllEx()
    console.table(assets)

    for (const asset of assets) {
      if (asset.ValueScope === 'PerRobot') {
        const robotValues: Array<any> = asset.RobotValues
        console.log(`${asset.Name} のRobot毎の値:`)
        console.table(robotValues)
      }
    }

    assets = await api.asset.findAllEx()
    assets = assets.filter(asset => asset.ValueScope === 'PerRobot')
    console.log(assets[0])
  } catch (error) {
    logger.error(error)
  }
}

if (!module.parent) {
  (async () => {
    await sample()
  })()
}
