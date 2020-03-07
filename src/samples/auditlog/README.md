AuditLog 機能は、OC 画面の操作の監査ログを取得する機能です。

![audit000.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/73777/555ede81-df2b-02d4-08b2-3d27d48703de.png)

## サンプルを実行してみる

```console
$ npx ts-node ./src/samples/auditlog/logSample.ts
```

ログデータ 1 件は以下のようなデータです。
コレを 1 データとして、検索条件に合致した監査ログたちを、配列で取得することができます。

```json
{
  "ServiceName": "UiPath.Orchestrator.Web.Api.OData.Controllers.RobotsController",
  "MethodName": "Delete",
  "Parameters": "{\"key\":454}",
  "ExecutionTime": "2020-03-06T16:43:59.033Z",
  "Action": "Delete",
  "Component": "Robots",
  "DisplayName": "test_0361_0909",
  "EntityId": 454,
  "OperationText": "ユーザー masatomix がロボット test_0361_0909 を削除しました",
  "UserName": "masatomix",
  "UserType": "User",
  "UserId": 11,
  "UserIsDeleted": false,
  "Id": 6568,
  "Entities": [
    {
      "AuditLogId": 6568,
      "CustomData": "{\"TenantId\":1,\"OrganizationUnitId\":1,\"Name\":\"test_0361_0909\",\"UserName\":\"xx\\\\xxxx_0909\",\"Type\":3,\"HostingType\":0,\"ProvisionType\":0,\"MachineId\":461,\"UserId\":935,\"IsExternalLicensed\":false,\"Id\":454}",
      "EntityId": 454,
      "EntityName": "UiRobot",
      "Action": "Delete",
      "Id": 12747
    },
    {
      "AuditLogId": 6568,
      "CustomData": "{\"OrganizationUnitId\":1,\"TenantId\":1,\"State\":2,\"IsUnresponsive\":false,\"RobotId\":454,\"HostMachineName\":\"Machine_0675\",\"MachineId\":461,\"ReportingTime\":\"2020-03-06T16:43:53.05Z\",\"Id\":454}",
      "EntityId": 454,
      "EntityName": "UiSession",
      "Action": "Delete",
      "Id": 12748
    },
    {
      "AuditLogId": 6568,
      "CustomData": "{\"Id\":907,\"TenantId\":1,\"UserId\":935,\"RoleId\":4}",
      "EntityId": 907,
      "EntityName": "UserRole",
      "Action": "Delete",
      "Id": 12749
    },
    {
      "AuditLogId": 6568,
      "CustomData": "{\"Id\":935,\"Type\":1,\"ProvisionType\":0,\"IsExternalLicensed\":false,\"Name\":\"\",\"Surname\":\"\",\"EmailAddress\":\"\",\"NormalizedEmailAddress\":\"\",\"Key\":\"4b013161-245f-4d1e-bef5-25b4946cc604\",\"IsFirstLogin\":false,\"AllowedSessions\":2,\"BypassBasicAuthRestriction\":false,\"NormalizedUserName\":\"TEST_0361_0909.ROBOTACCOUNT\",\"UserName\":\"test_0361_0909.robotAccount\",\"TenantId\":1,\"AccessFailedCount\":0,\"IsLockoutEnabled\":true,\"IsPhoneNumberConfirmed\":false,\"IsTwoFactorEnabled\":false,\"IsEmailConfirmed\":true,\"IsActive\":true}",
      "EntityId": 935,
      "EntityName": "UiUser",
      "Action": "Delete",
      "Id": 12750
    }
  ]
}
```

このデータに対応した監査ログを画面で表示してみます。

![audit001.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/73777/2b1df0f2-398a-d0e1-53b9-1de95900ede0.png)

ありましたね。

条件指定は [ロボットのログ](https://github.com/masatomix/uipath-orchestrator-api-node/tree/develop/src/samples/log)と同様で、 [API リクエストの構築](https://docs.uipath.com/orchestrator/lang-ja/reference#building-api-requests) この機能を用いてます。
たとえば、下記の通りです。

```typescript
const logs: any[] = await api.auditLog.findByFilter({
  action: 'Delete',
  component: 'Robots',
  methodName: 'Delete',
  from: new Date(from),
  to: new Date(to),
})
```

## サンプルコード

```typescript
import config from 'config'
import OrchestratorApi from '../../index'
import logger from '../../logger'

async function sample() {
  const api = new OrchestratorApi(config)
  await api.authenticate()
  try {
    let logs: any[] = []

    const from = '2020/03/07 01:00'
    const to = '2020/03/07 01:45'

    logs = await api.auditLog.findByFilter(
      {
        // action: 'Delete',
        // userName: 'masatomix',
        component: 'Robots',
        // methodName: 'Delete',
        from: new Date(from),
        to: new Date(to),
      },
      { $top: 100 },
    )
    printLog(logs)
  } catch (error) {
    logger.error(error)
  }
}

async function printLog(logs: any[]) {
  console.log(logs[0])
  console.table(logs)
  console.log(`${logs.length} 件でした`)
}

if (!module.parent) {
  ;(async () => {
    await sample()
  })()
}
```

の結果は以下の通り。

```json
{
  "ServiceName": "UiPath.Orchestrator.Web.Api.OData.Controllers.RobotsController",
  "MethodName": "Post",
  "Parameters": "{\"robotDto\":{\"MachineName\":\"Machine_0675\",\"MachineId\":null,\"Name\":\"test_0361_0909\",\"Username\":\"xx\\\\xxxx_0909\",\"ExternalName\":null,\"Description\":null,\"Version\":null,\"Type\":\"Development\",\"HostingType\":\"Standard\",\"ProvisionType\":\"Manual\",\"CredentialStoreId\":null,\"UserId\":null,\"CredentialType\":null,\"RobotEnvironments\":\"\",\"ExecutionSettings\":null,\"IsExternalLicensed\":false,\"Id\":0}}",
  "ExecutionTime": "2020-03-06T16:43:51.94Z",
  "Action": "Create",
  "Component": "Robots",
  "DisplayName": "test_0361_0909",
  "EntityId": 454,
  "OperationText": "ユーザー masatomix がロボット test_0361_0909 を作成しました",
  "UserName": "masatomix",
  "UserType": "User",
  "UserId": 11,
  "UserIsDeleted": false,
  "Id": 6567,
  "Entities": [
    {
      "AuditLogId": 6567,
      "CustomData": "{\"Id\":935,\"Type\":1,\"ProvisionType\":0,\"IsExternalLicensed\":false,\"Name\":\"\",\"Surname\":\"\",\"EmailAddress\":\"\",\"NormalizedEmailAddress\":\"\",\"Key\":\"4b013161-245f-4d1e-bef5-25b4946cc604\",\"IsFirstLogin\":false,\"AllowedSessions\":2,\"BypassBasicAuthRestriction\":false,\"NormalizedUserName\":\"TEST_0361_0909.ROBOTACCOUNT\",\"UserName\":\"test_0361_0909.robotAccount\",\"TenantId\":1,\"AccessFailedCount\":0,\"IsLockoutEnabled\":true,\"IsPhoneNumberConfirmed\":false,\"IsTwoFactorEnabled\":false,\"IsEmailConfirmed\":true,\"IsActive\":true}",
      "EntityId": 935,
      "EntityName": "UiUser",
      "Action": "Create",
      "Id": 12741
    },
    {
      "AuditLogId": 6567,
      "CustomData": "{\"Id\":461,\"TenantId\":1,\"Name\":\"Machine_0675\",\"NonProductionSlots\":0,\"UnattendedSlots\":0,\"Type\":0}",
      "EntityId": 461,
      "EntityName": "UiMachine",
      "Action": "Update",
      "Id": 12742
    },
    {
      "AuditLogId": 6567,
      "CustomData": "{\"Id\":907,\"TenantId\":1,\"UserId\":935,\"RoleId\":4}",
      "EntityId": 907,
      "EntityName": "UserRole",
      "Action": "Create",
      "Id": 12743
    },
    {
      "AuditLogId": 6567,
      "CustomData": "{\"Id\":460,\"TenantId\":1,\"UserId\":935,\"OrganizationUnitId\":1}",
      "EntityId": 460,
      "EntityName": "UiUserOrganizationUnitRole",
      "Action": "Create",
      "Id": 12744
    },
    {
      "AuditLogId": 6567,
      "CustomData": "{\"Id\":454,\"TenantId\":1,\"OrganizationUnitId\":1,\"Name\":\"test_0361_0909\",\"UserName\":\"xx\\\\xxxx_0909\",\"Type\":3,\"HostingType\":0,\"ProvisionType\":0,\"MachineId\":461,\"UserId\":935,\"IsExternalLicensed\":false}",
      "EntityId": 454,
      "EntityName": "UiRobot",
      "Action": "Create",
      "Id": 12745
    },
    {
      "AuditLogId": 6567,
      "CustomData": "{\"Id\":454,\"OrganizationUnitId\":1,\"TenantId\":1,\"State\":2,\"IsUnresponsive\":false,\"RobotId\":454,\"HostMachineName\":\"Machine_0675\",\"MachineId\":461,\"ReportingTime\":\"2020-03-06T16:43:53.0485631Z\"}",
      "EntityId": 454,
      "EntityName": "UiSession",
      "Action": "Create",
      "Id": 12746
    }
  ]
}
```

```console

┌─────────┬──────────────────────────────────────────────────────────────────┬────────────┬────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬────────────────────────────┬──────────┬───────────┬──────────────────┬──────────┬───────────────────────────────────────────────┬─────────────┬──────────┬────────┬───────────────┬──────┬────────────────────────────────────────────────────┐
│ (index) │                           ServiceName                            │ MethodName │                                                                                                                                                                                               Parameters                                                                                                                                                                                               │       ExecutionTime        │  Action  │ Component │   DisplayName    │ EntityId │                 OperationText                 │  UserName   │ UserType │ UserId │ UserIsDeleted │  Id  │                      Entities                      │
├─────────┼──────────────────────────────────────────────────────────────────┼────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼────────────────────────────┼──────────┼───────────┼──────────────────┼──────────┼───────────────────────────────────────────────┼─────────────┼──────────┼────────┼───────────────┼──────┼────────────────────────────────────────────────────┤
│    0    │ 'UiPath.Orchestrator.Web.Api.OData.Controllers.RobotsController' │   'Post'   │    '{"robotDto":{"MachineName":"Machine_0675","MachineId":null,"Name":"test_0361_0909","Username":"xx\\\\xxxx_0909","ExternalName":null,"Description":null,"Version":null,"Type":"Development","HostingType":"Standard","ProvisionType":"Manual","CredentialStoreId":null,"UserId":null,"CredentialType":null,"RobotEnvironments":"","ExecutionSettings":null,"IsExternalLicensed":false,"Id":0}}'     │ '2020-03-06T16:43:51.94Z'  │ 'Create' │ 'Robots'  │ 'test_0361_0909' │   454    │ 'ユーザー masatomix がロボット test_0361_0909 を作成しました' │ 'masatomix' │  'User'  │   11   │     false     │ 6567 │ [ [Object], [Object], [Object], ... 3 more items ] │
│    1    │ 'UiPath.Orchestrator.Web.Api.OData.Controllers.RobotsController' │  'Delete'  │                                                                                                                                                                                             '{"key":454}'                                                                                                                                                                                              │ '2020-03-06T16:43:59.033Z' │ 'Delete' │ 'Robots'  │ 'test_0361_0909' │   454    │ 'ユーザー masatomix がロボット test_0361_0909 を削除しました' │ 'masatomix' │  'User'  │   11   │     false     │ 6568 │ [ [Object], [Object], [Object], ... 1 more item ]  │
│    2    │ 'UiPath.Orchestrator.Web.Api.OData.Controllers.RobotsController' │   'Post'   │    '{"robotDto":{"MachineName":"Machine_0677","MachineId":null,"Name":"test_0635_0846","Username":"xx\\\\xxxx_0846","ExternalName":null,"Description":null,"Version":null,"Type":"Development","HostingType":"Standard","ProvisionType":"Manual","CredentialStoreId":null,"UserId":null,"CredentialType":null,"RobotEnvironments":"","ExecutionSettings":null,"IsExternalLicensed":false,"Id":0}}'     │ '2020-03-06T16:44:04.003Z' │ 'Create' │ 'Robots'  │ 'test_0635_0846' │   455    │ 'ユーザー masatomix がロボット test_0635_0846 を作成しました' │ 'masatomix' │  'User'  │   11   │     false     │ 6571 │ [ [Object], [Object], [Object], ... 3 more items ] │
│    3    │ 'UiPath.Orchestrator.Web.Api.OData.Controllers.RobotsController' │   'Put'    │ '{"key":455,"robotDto":{"MachineName":"Machine_0677","MachineId":462,"Name":"hogeRobot","Username":"xx\\\\xxxx_0846","ExternalName":null,"Description":null,"Version":null,"Type":"Development","HostingType":"Standard","ProvisionType":"Manual","CredentialStoreId":1,"UserId":936,"CredentialType":"Default","RobotEnvironments":"","ExecutionSettings":null,"IsExternalLicensed":false,"Id":455}}' │ '2020-03-06T16:44:05.893Z' │ 'Update' │ 'Robots'  │   'hogeRobot'    │   455    │   'ユーザー masatomix がロボット hogeRobot を更新しました'    │ 'masatomix' │  'User'  │   11   │     false     │ 6573 │               [ [Object], [Object] ]               │
│    4    │ 'UiPath.Orchestrator.Web.Api.OData.Controllers.RobotsController' │  'Delete'  │                                                                                                                                                                                             '{"key":455}'                                                                                                                                                                                              │ '2020-03-06T16:44:07.813Z' │ 'Delete' │ 'Robots'  │   'hogeRobot'    │   455    │   'ユーザー masatomix がロボット hogeRobot を削除しました'    │ 'masatomix' │  'User'  │   11   │     false     │ 6574 │ [ [Object], [Object], [Object], ... 1 more item ]  │
└─────────┴──────────────────────────────────────────────────────────────────┴────────────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴────────────────────────────┴──────────┴───────────┴──────────────────┴──────────┴───────────────────────────────────────────────┴─────────────┴──────────┴────────┴───────────────┴──────┴────────────────────────────────────────────────────┘
5 件でした
```

## Orchestrator API との対応表

- findByFilter(
  filters: {
  action?: string
  userName?: string
  component?: string
  methodName?: string
  from?: Date
  to?: Date
  },
  obj?: any,
  )

  - GET `/odata/AuditLogs` + パラメタ。filters:$filter、obj:それ以外の条件 ($top,$expand,$select,$orderby, $skip) など。

- findAll (queries?: any)
  - GET `/odata/AuditLogs` 原則、findByFilter で十分だけど、`contains`を使うとか自分でいろいろやりたいヒト向け
