<p>
  <a href="https://www.npmjs.com/package/uipath-orchestrator-api-node" target="_blank">
    <img alt="Version" src="https://img.shields.io/npm/v/uipath-orchestrator-api-node.svg">
  </a>
  <a href="https://github.com/masatomix/uipath-orchestrator-api-node#readme" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://github.com/masatomix/uipath-orchestrator-api-node/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  </a>
  <a href="https://github.com/masatomix/uipath-orchestrator-api-node/blob/master/LICENSE" target="_blank">
    <img alt="License: Apache--2.0" src="https://img.shields.io/github/license/masatomix/uipath-orchestrator-api-node" />
  </a>
</p>

## 「特定のロボット」でジョブを実行

「特定のロボット」をつかってプロセスを開始するサンプルです。

```console
$ npx ts-node src/samples/job/jobSample1.ts
```

下記の通り、ジョブが実行されました。

![job01.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/73777/c5eed3ef-c329-2e39-fd78-efd15035fa27.png)


### ソースコード

```typescript

```

## 「動的に割り当てる」でジョブを実行

つづいて「動的に割り当てる」をつかってプロセスを開始するサンプルです。

```console
$ npx ts-node src/samples/job/jobSample2.ts
```

下記の通り、ジョブが実行されました。

![job02.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/73777/fe6bc1ff-176e-c7ae-b6a6-e6de1e4ed213.png)


### ソースコード

```typescript

```

## 開始したジョブをキャンセルする

開始したジョブを停止するサンプルです。ジョブを実行すると


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

このような、開始されたジョブの情報が取得できるので、Id情報(上記だと 12287,12288,12289) を用いてジョブを停止することができます。


```console
$ npx ts-node src/samples/job/jobSample3.ts
```

![job03.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/73777/4c008997-4a53-3aef-e62f-07dd5ced6cb8.png)


止まったようですね。


### ソースコード

```typescript

```

