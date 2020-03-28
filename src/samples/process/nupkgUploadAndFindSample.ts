import config from 'config'
import OrchestratorApi from '../../index'
import { getLogger } from '../../logger'
import { downloadFile } from '../sampleUtils'

const logger = getLogger('main')

async function sample() {
  const api = new OrchestratorApi(config)

  // まずは認証
  await api.authenticate()
  let processId: string = ''
  try {
    const url1 =
      'https://github.com/masatomix/My_Attended_Framework/releases/download/1.0.7115.18328/Attended_FrameWork.1.0.7115.18328.nupkg'
    const url2 =
      'https://github.com/masatomix/My_Attended_Framework/releases/download/1.0.7120.2411/Attended_FrameWork.1.0.7120.2411.nupkg'
    // uploadしたいファイルをローカルにダウンロードして、
    const fileNames: string[] = []
    fileNames.push(await downloadFile(url1))
    fileNames.push(await downloadFile(url2))

    // nupkgをアップロードする
    let uploads: any[]
    uploads = await api.process.uploadPackage(fileNames[0])
    console.log(uploads)
    // [{
    //   "Key": "Attended_FrameWork.1.0.7115.18328.nupkg",
    //   "Status": "OK",
    //   "Body": "{\"Id\":\"Attended_FrameWork\",\"Version\":\"1.0.7115.18328\"}"
    // }]

    // nupkgをアップロードする
    uploads = await api.process.uploadPackage(fileNames[1])

    // 'Attended_FrameWork' を取り出す
    processId = JSON.parse(uploads[0].Body).Id

    let results: any[]
    results = await api.process.findPackage(processId) // パッケージ画面上の「名前」で検索
    console.table(results)
    // ┌─────────┬──────────┬───────┬──────────────────┬─────────────────────────────────────┬──────────────────────────────┬────────────────────────────────┬─────────────────┬────────────┬──────────────┬──────────┬──────────────────────┬───────────────────────────────┐
    // │ (index) │ IsActive │ Title │     Version      │                 Key                 │         Description          │           Published            │ IsLatestVersion │ OldVersion │ ReleaseNotes │ Authors  │          Id          │           Arguments           │
    // ├─────────┼──────────┼───────┼──────────────────┼─────────────────────────────────────┼──────────────────────────────┼────────────────────────────────┼─────────────────┼────────────┼──────────────┼──────────┼──────────────────────┼───────────────────────────────┤
    // │    0    │  false   │ null  │ '1.0.7120.2411'  │ 'Attended_FrameWork:1.0.7120.2411'  │ 'Attended Robot REFramework' │ '2020-02-25T10:47:25.8688789Z' │      true       │    null    │     null     │ 'm-kino' │ 'Attended_FrameWork' │ { Input: null, Output: null } │
    // │    1    │  false   │ null  │ '1.0.7115.18328' │ 'Attended_FrameWork:1.0.7115.18328' │ 'Attended Robot REFramework' │ '2020-02-25T10:47:25.4001001Z' │      false      │    null    │     null     │ 'pbkino' │ 'Attended_FrameWork' │ { Input: null, Output: null } │
    // └─────────┴──────────┴───────┴──────────────────┴─────────────────────────────────────┴──────────────────────────────┴────────────────────────────────┴─────────────────┴────────────┴──────────────┴──────────┴──────────────────────┴───────────────────────────────┘
  } catch (error) {
    logger.error(error)
  } finally {
    await api.process.deletePackage(processId)
    // await api.process.deletePackage(processId, '1.0.6')
  }
}

if (!module.parent) {
  (async () => {
    await sample()
  })()
}
