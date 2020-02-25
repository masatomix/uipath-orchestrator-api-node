
Processes 関連は主に、nupkgの アップロードやダウンロード、nupkg ごとのバージョン情報の取得、nupkgの削除、などを行うことができます。


## サンプルを実行してみる

### nupkg をアップロードするサンプル

```console
$ npx ts-node src/samples/process/nupkgUploadAndFindSample.ts
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
┌─────────┬──────────┬───────┬──────────────────┬─────────────────────────────────────┬──────────────────────────────┬────────────────────────────────┬─────────────────┬────────────┬──────────────┬──────────┬──────────────────────┬───────────────────────────────┐
│ (index) │ IsActive │ Title │     Version      │                 Key                 │         Description          │           Published            │ IsLatestVersion │ OldVersion │ ReleaseNotes │ Authors  │          Id          │           Arguments           │
├─────────┼──────────┼───────┼──────────────────┼─────────────────────────────────────┼──────────────────────────────┼────────────────────────────────┼─────────────────┼────────────┼──────────────┼──────────┼──────────────────────┼───────────────────────────────┤
│    0    │  false   │ null  │ '1.0.7120.2411'  │ 'Attended_FrameWork:1.0.7120.2411'  │ 'Attended Robot REFramework' │ '2020-02-25T10:47:25.8688789Z' │      true       │    null    │     null     │ 'm-kino' │ 'Attended_FrameWork' │ { Input: null, Output: null } │
│    1    │  false   │ null  │ '1.0.7115.18328' │ 'Attended_FrameWork:1.0.7115.18328' │ 'Attended Robot REFramework' │ '2020-02-25T10:47:25.4001001Z' │      false      │    null    │     null     │ 'pbkino' │ 'Attended_FrameWork' │ { Input: null, Output: null } │
└─────────┴──────────┴───────┴──────────────────┴─────────────────────────────────────┴──────────────────────────────┴────────────────────────────────┴─────────────────┴────────────┴──────────────┴──────────┴──────────────────────┴───────────────────────────────┘
```

(表形式で表示してます)


### サンプルコード

```typescript
import config from 'config'
import OrchestratorApi from '../../index'
import logger from '../../logger'
import { downloadFile } from '../sampleUtils'

async function sample() {
  const api = new OrchestratorApi(config)

  // まずは認証
  await api.authenticate()
  let processId: string = ''
  try {
    const url1 = 'https://github.com/masatomix/My_Attended_Framework/releases/download/1.0.7115.18328/Attended_FrameWork.1.0.7115.18328.nupkg'
    const url2 = 'https://github.com/masatomix/My_Attended_Framework/releases/download/1.0.7120.2411/Attended_FrameWork.1.0.7120.2411.nupkg'
    // uploadしたいファイルをローカルにダウンロードして、
    const fileNames: string[] = []
    fileNames.push(await downloadFile(url1))
    fileNames.push(await downloadFile(url2))

    // nupkgをアップロードする
    let uploads: any[]
    uploads = await api.process.uploadPackage(fileNames[0])
    console.log(uploads)

    // nupkgをアップロードする
    uploads = await api.process.uploadPackage(fileNames[1])

    // 'Attended_FrameWork' を取り出す
    processId = JSON.parse(uploads[0].Body).Id

    let results: any[]
    results = await api.process.findPackage(processId) // パッケージ画面上の「名前」で検索
    console.table(results)

  } catch (error) {
    logger.error(error)
  } finally {
    // await api.process.deletePackage(processId) //全部削除
    // await api.process.deletePackage(processId, '1.0.7120.2411') //バージョン指定で削除
  }
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
$ npx ts-node src/samples/process/nupkgDownloadSample.ts
```

下記のような JSON データが出力されると思います。

findAll(findPackageと同じフォーマット):

```console
┌─────────┬──────────┬───────┬─────────────────┬────────────────────────────────────┬──────────────────────────────┬────────────────────────────────┬─────────────────┬────────────┬──────────────┬──────────┬──────────────────────┬───────────────────────────────┐
│ (index) │ IsActive │ Title │     Version     │                Key                 │         Description          │           Published            │ IsLatestVersion │ OldVersion │ ReleaseNotes │ Authors  │          Id          │           Arguments           │
├─────────┼──────────┼───────┼─────────────────┼────────────────────────────────────┼──────────────────────────────┼────────────────────────────────┼─────────────────┼────────────┼──────────────┼──────────┼──────────────────────┼───────────────────────────────┤
│    0    │  false   │ null  │ '1.0.7120.2411' │ 'Attended_FrameWork:1.0.7120.2411' │ 'Attended Robot REFramework' │ '2020-02-25T10:47:25.8688789Z' │      true       │    null    │     null     │ 'm-kino' │ 'Attended_FrameWork' │ { Input: null, Output: null } │
└─────────┴──────────┴───────┴─────────────────┴────────────────────────────────────┴──────────────────────────────┴────────────────────────────────┴─────────────────┴────────────┴──────────────┴──────────┴──────────────────────┴───────────────────────────────┘
```

(表形式で表示してます)

また上記情報の ``Id``,``Version``を用いて nupkgのダウンロードも行っています。

### サンプルコード

```typescript
import config from 'config'
import OrchestratorApi from '../../index'
import logger from '../../logger'

async function sample() {
  const api = new OrchestratorApi(config)

  // まずは認証
  await api.authenticate()
  try {
    const processId = 'Attended_FrameWork'
    const processes: any[] = await api.process.findAll({ $filter: `Id eq '${processId}'` })
    console.table(processes)

    const samplePackages: any[] = await api.process.findPackage(processId)
    console.table(samplePackages)

    await Promise.all(
      samplePackages.map(
        samplePackage => api.process.downloadPackage(samplePackage.Id, samplePackage.Version)
      ))
  } catch (error) {
    logger.error(error)
  }
}

if (!module.parent) {
  (async () => {
    await sample()
  })()
}
```

