
Libraries 関連は主に、ライブラリnupkgの アップロードやダウンロード、nupkg ごとのバージョン情報の取得、nupkgの削除、などを行うことができます。


## サンプルを実行してみる

### ライブラリのnupkg をアップロードするサンプル

```console
$ npx ts-node src/samples/library/nupkgUploadAndFindSample.ts
```

下記のような JSON データが出力されると思います。

uploadPackage:

```json
[{
    "Key": "Attended_FrameWork.1.0.7115.18328.nupkg",
    "Status": "OK",
    "Body": "{\"Id\":\"Attended_FrameWork\",\"Version\":\"1.0.7115.18328\"}"
}]
```

findPackage:

```console
 ┌─────────┬───────┬──────────────────┬─────────────────────────────────────┬──────────────────────────────┬────────────────────────────┬─────────────────┬────────────┬──────────────┬──────────┬──────────────────────┐
 │ (index) │ Title │     Version      │                 Key                 │         Description          │         Published          │ IsLatestVersion │ OldVersion │ ReleaseNotes │ Authors  │          Id          │
 ├─────────┼───────┼──────────────────┼─────────────────────────────────────┼──────────────────────────────┼────────────────────────────┼─────────────────┼────────────┼──────────────┼──────────┼──────────────────────┤
 │    0    │ null  │ '1.0.7120.2411'  │ 'Attended_FrameWork:1.0.7120.2411'  │ 'Attended Robot REFramework' │ '2020-04-05T01:59:18.527Z' │      true       │    null    │     null     │ 'm-kino' │ 'Attended_FrameWork' │
 │    1    │ null  │ '1.0.7115.18328' │ 'Attended_FrameWork:1.0.7115.18328' │ 'Attended Robot REFramework' │ '2020-04-05T01:59:18.417Z' │      false      │    null    │     null     │ 'pbkino' │ 'Attended_FrameWork' │
 └─────────┴───────┴──────────────────┴─────────────────────────────────────┴──────────────────────────────┴────────────────────────────┴─────────────────┴────────────┴──────────────┴──────────┴──────────────────────┘
```

(表形式で表示してます)


### サンプルコード

```typescript
import config from 'config'
import OrchestratorApi, { IOrchestratorApi } from '../../index'
import { downloadFile } from '../sampleUtils'

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

    // nupkgをアップロードする
    uploads = await api.library.uploadPackage(fileNames[1])

    // 'Attended_FrameWork' を取り出す
    processId = JSON.parse(uploads[0].Body).Id

    let results: any[]
    results = await api.library.findPackage(processId) // パッケージ画面上の「名前」で検索
    console.table(results)
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

```

``finally`` 節でアップロードしたnupkgを削除するコードを記載しています(コメントアウトしてますが)。


### nupkg をダウンロードするサンプル

```console
$ npx ts-node src/samples/library/nupkgDownloadSample.ts
```

画面だと見づらいので、下記のような Excelデータを出力してみました。


![libraries.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/73777/6ca523cf-7cbe-77e1-ea3a-79d298695250.png)


### サンプルコード

```typescript
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
```

## Orchestrator API との対応表

- findAll (queries?: any)
    - GET ``/odata/Libraries``
- findPackage (processId: string)
    - GET ``/odata/Libraries/UiPath.Server.Configuration.OData.GetProcessVersions(processId='${processId}')``
- deletePackage (processId: string, version?: string)
    - DELETE ``/odata/Libraries('${processId}:${version}')``
- uploadPackage (fullPath: string)
    - POST ``/odata/Libraries/UiPath.Server.Configuration.OData.UploadPackage()``
- downloadPackage (id: string, version: string)
    - GET ``/odata/Libraries/UiPath.Server.Configuration.OData.DownloadPackage(key='${id}:${version}')``
 