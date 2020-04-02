import config from 'config'
import OrchestratorApi from '../../index'

async function sample() {
  const api = new OrchestratorApi(config)

  // まずは認証
  await api.authenticate()
  try {
    const releases: any[] = await api.release.findAll()
    console.log(releases)

    const release: any = await api.release.findByProcessKey('Attended_FrameWork') // 画面の名前でも検索できる
    console.log(release)
  } catch (error) {
    console.error(error)
  }
}

if (!module.parent) {
  (async () => {
    await sample()
  })()
}
