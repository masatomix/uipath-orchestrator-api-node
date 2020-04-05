import config from 'config'
import OrchestratorApi from '../../index'
import { downloadFile } from '../sampleUtils'
import { IOrchestratorApi } from '../../IOrchestratorApi'

async function sample() {
  const api = new OrchestratorApi(config)

  // まずは認証
  await api.authenticate()

  await changeUploadDestination(api) // ライブラリのアップロード先をホストからテナントへ変更

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
    uploads = await api.library.uploadPackage(fileNames[0])
    console.log(uploads)
    // [{
    //   "Key": "Attended_FrameWork.1.0.7115.18328.nupkg",
    //   "Status": "OK",
    //   "Body": "{\"Id\":\"Attended_FrameWork\",\"Version\":\"1.0.7115.18328\"}"
    // }]

    // nupkgをアップロードする
    uploads = await api.library.uploadPackage(fileNames[1])

    // 'Attended_FrameWork' を取り出す
    processId = JSON.parse(uploads[0].Body).Id

    let results: any[]
    results = await api.library.findPackage(processId) // パッケージ画面上の「名前」で検索
    console.table(results)
    // ┌─────────┬───────┬──────────────────┬─────────────────────────────────────┬──────────────────────────────┬────────────────────────────┬─────────────────┬────────────┬──────────────┬──────────┬──────────────────────┐
    // │ (index) │ Title │     Version      │                 Key                 │         Description          │         Published          │ IsLatestVersion │ OldVersion │ ReleaseNotes │ Authors  │          Id          │
    // ├─────────┼───────┼──────────────────┼─────────────────────────────────────┼──────────────────────────────┼────────────────────────────┼─────────────────┼────────────┼──────────────┼──────────┼──────────────────────┤
    // │    0    │ null  │ '1.0.7120.2411'  │ 'Attended_FrameWork:1.0.7120.2411'  │ 'Attended Robot REFramework' │ '2020-04-05T01:59:18.527Z' │      true       │    null    │     null     │ 'm-kino' │ 'Attended_FrameWork' │
    // │    1    │ null  │ '1.0.7115.18328' │ 'Attended_FrameWork:1.0.7115.18328' │ 'Attended Robot REFramework' │ '2020-04-05T01:59:18.417Z' │      false      │    null    │     null     │ 'pbkino' │ 'Attended_FrameWork' │
    // └─────────┴───────┴──────────────────┴─────────────────────────────────────┴──────────────────────────────┴────────────────────────────┴─────────────────┴────────────┴──────────────┴──────────┴──────────────────────┘
  } catch (error) {
    console.error(error)
  } finally {
    await api.library.deletePackage(processId) // (保存先がホストのままだと、削除は失敗する。さっき変更したのでエラーは出ないはず)
    // await api.library.deletePackage(processId, '1.0.7120.2411')
    await changeBackDestination(api) // アップロード先をホストへ戻す
  }
}

async function changeUploadDestination(api: IOrchestratorApi) {
  const instances = await api.setting.findByKey()('Deployment.Libraries.UseSharedFeed')
  console.log('更新前の値')
  console.table(instances)

  instances[0].Value = 'false' // true(Shared)なのでfalseにする。。そのあと、trueにもどせばOK
  await api.setting.update(instances)
}

async function changeBackDestination(api: IOrchestratorApi) {
  const instances = await api.setting.findByKey()('Deployment.Libraries.UseSharedFeed')
  console.log('更新前の値')
  console.table(instances)

  instances[0].Value = 'true' // true(Shared)なのでfalseにする。。そのあと、trueにもどせばOK
  await api.setting.update(instances)
}

if (!module.parent) {
  (async () => {
    await sample()
  })()
}
