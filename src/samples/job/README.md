## 「特定のロボット」でジョブを実行

「特定のロボット」をつかってプロセスを開始するサンプルです。

```console
$ npx ts-node src/samples/job/jobSample1.ts
```

下記の通り、ジョブが実行されたとおもいます。

![job01.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/73777/c5eed3ef-c329-2e39-fd78-efd15035fa27.png)


### ソースコード

```typescript
import config from 'config'
import OrchestratorApi from '../../index'
import logger from '../../logger'

/**
 * OC画面上の「特定のロボット」でのジョブ登録サンプル。
 * ロボット名 と プロセスの名前を使って、ジョブを登録・スタートさせます
 */
async function sample() {
  const api = new OrchestratorApi(config)
  await api.authenticate()

  const robotNames: string[] = await createRobotNames(api)
  const processKey: string = await createProcessKey(api)

  // パラメタはプロセス名と、ロボット名
  const result: any = await api.job.startJobs(processKey, robotNames)
  logger.info(result.value)
}

async function createRobotNames(api_: OrchestratorApi): Promise<string[]> {
  const robots = await api_.robot.findAll()
  if (!robots || robots.length === 0) {
    throw new Error('Robotが存在しないため、終了')
  }
  const robotNames: string[] = robots.map(robot => robot.Name)
  return robotNames
}

async function createProcessKey(api_: OrchestratorApi): Promise<string> {
  const releases = await api_.release.findAll()
  if (!releases || releases.length === 0) {
    throw new Error('実行対象のプロセスが存在しないため、終了')
  }
  return releases[0].ProcessKey
}

if (!module.parent) {
  ;(async () => {
    await sample()
  })()
}
```

## 「動的に割り当てる」でジョブを実行

つづいて「動的に割り当てる」をつかってプロセスを開始するサンプルです。

```console
$ npx ts-node src/samples/job/jobSample2.ts
```

下記の通り、ジョブが実行されたとおもいます。

![job02.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/73777/fe6bc1ff-176e-c7ae-b6a6-e6de1e4ed213.png)


### ソースコード

```typescript
import config from 'config'
import OrchestratorApi from '../../index'
import logger from '../../logger'

/**
 * こちらはOC画面上の「動的に割り当てる」でのジョブ登録サンプル。
 * プロセスの名前と実行回数を使って、ジョブを登録・スタートさせます
 */
async function sample() {
  const api = new OrchestratorApi(config)
  await api.authenticate()

  // const robotNames:string[] = await createRobotNames(api) // ロボット名は使わない
  const processKey: string = await createProcessKey(api)

  // パラメタはプロセス名と、3回実行する、という回数
  const result: any = await api.job.startJobs(processKey, [], 3)
  logger.info(result.value)
}

// async function createRobotNames(api_: OrchestratorApi): Promise<string[]> {
//   const robots = await api_.robot.findAll()
//   if (!robots || robots.length === 0) {
//     throw new Error('Robotが存在しないため、終了')
//   }
//   const robotNames: string[] = robots.map(robot => robot.Name)
//   return robotNames
// }

async function createProcessKey(api_: OrchestratorApi): Promise<string> {
  const releases = await api_.release.findAll()
  if (!releases || releases.length === 0) {
    throw new Error('実行対象のプロセスが存在しないため、終了')
  }
  return releases[0].ProcessKey
}

if (!module.parent) {
  ;(async () => {
    await sample()
  })()
}
```

## 開始したジョブをキャンセルする

開始したジョブを停止するサンプルです。StartJobを用いてジョブを実行すると

```json
[
  {
    "Key": "8652d3bb-xxx1",
    "StartTime": null,
    "EndTime": null,
    "State": "Pending",
    "Source": "Manual",
    "SourceType": "Manual",
    "BatchExecutionKey": "7d382470-abc",
    "Info": null,
    "CreationTime": "2020-02-24T04:33:13.097Z",
    "StartingScheduleId": null,
    "ReleaseName": "MyAttendedFramework_Main",
    "Type": "Unattended",
    "InputArguments": null,
    "OutputArguments": null,
    "HostMachineName": null,
    "HasMediaRecorded": false,
    "PersistenceId": null,
    "ResumeVersion": null,
    "StopStrategy": null,
    "ReleaseVersionId": null,
    "Id": 12287
  },
  {
    "Key": "8652d3bb-xxx2",
    "StartTime": null,
    "EndTime": null,
    "State": "Pending",
    "Source": "Manual",
    "SourceType": "Manual",
    "BatchExecutionKey": "7d382470-abc",
    "Info": null,
    "CreationTime": "2020-02-24T04:33:13.097Z",
    "StartingScheduleId": null,
    "ReleaseName": "MyAttendedFramework_Main",
    "Type": "Unattended",
    "InputArguments": null,
    "OutputArguments": null,
    "HostMachineName": null,
    "HasMediaRecorded": false,
    "PersistenceId": null,
    "ResumeVersion": null,
    "StopStrategy": null,
    "ReleaseVersionId": null,
    "Id": 12288
  },
  {
    "Key": "8652d3bb-xxx3",
    "StartTime": null,
    "EndTime": null,
    "State": "Pending",
    "Source": "Manual",
    "SourceType": "Manual",
    "BatchExecutionKey": "7d382470-abc",
    "Info": null,
    "CreationTime": "2020-02-24T04:33:13.097Z",
    "StartingScheduleId": null,
    "ReleaseName": "MyAttendedFramework_Main",
    "Type": "Unattended",
    "InputArguments": null,
    "OutputArguments": null,
    "HostMachineName": null,
    "HasMediaRecorded": false,
    "PersistenceId": null,
    "ResumeVersion": null,
    "StopStrategy": null,
    "ReleaseVersionId": null,
    "Id": 12289
  }
]
```

といった開始されたジョブの情報が取得できるので、これらのId (上記だと 12287,12288,12289) を用いて、ジョブを停止することができます。


```console
$ npx ts-node src/samples/job/jobSample3.ts
```

![job03.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/73777/4c008997-4a53-3aef-e62f-07dd5ced6cb8.png)

止まったようです。

### ソースコード

```typescript
import config from 'config'
import OrchestratorApi from '../../index'
import logger from '../../logger'

async function sample() {
  const api = new OrchestratorApi(config)
  await api.authenticate()

  const processKey: string = await createProcessKey(api)

  const jobs: any = await api.job.startJobs(processKey, [], 3)
  logger.info(jobs.value)

  await Promise.all(
    jobs.value.map((job: any) => {
      return api.job.stopJob(job.Id) // 各ジョブをIdを渡して停止している
      // ちなみに引数にtrueを渡すと、強制終了を行います。
      // return api.job.stopJob(element.Id, true)
    }),
  )
}

async function createProcessKey(api_: OrchestratorApi): Promise<string> {
  const releases = await api_.release.findAll()
  if (!releases || releases.length === 0) {
    throw new Error('実行対象のプロセスが存在しないため、終了')
  }
  return releases[0].ProcessKey
}

if (!module.parent) {
  ;(async () => {
    await sample()
  })()
}
```
