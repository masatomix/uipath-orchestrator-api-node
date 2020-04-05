import config from 'config'
import OrchestratorApi from '../../index'

async function sample() {
  const api = new OrchestratorApi(config)

  // まずは認証
  await api.authenticate()
  try {
    const instances = await api.library.findAll()
    api.library.save2Excel(instances, './libraries.xlsx')
  } catch (error) {
    console.error(error)
  }
}

if (!module.parent) {
  (async () => {
    await sample()
  })()
}
