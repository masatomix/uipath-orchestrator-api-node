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

## サンプルを実行してみる

```console
$ npx ts-node src/samples/machine_robot/robotSample.ts
```

下記のような JSON データが出力されると思います。

マシン:

```json
{
  "@odata.context": "https://xxx/odata/$metadata#Machines/$entity",
  "LicenseKey": "4exxx",
  "Name": "Machine_0140",
  "Description": null,
  "Type": "Standard",
  "NonProductionSlots": 0,
  "UnattendedSlots": 0,
  "Id": 154,
  "RobotVersions": []
}
```

ロボット:

```json
{
  "@odata.context": "https://xxx/odata/$metadata#Robots/$entity",
  "LicenseKey": "4exxx",
  "MachineName": "Machine_0140",
  "MachineId": 154,
  "Name": "test_0645_0399",
  "Username": "xx\\xxxx_0399",
  "ExternalName": null,
  "Description": null,
  "Version": null,
  "Type": "Development",
  "HostingType": "Standard",
  "ProvisionType": "Manual",
  "Password": "••••••••••••••••••••",
  "CredentialStoreId": 1,
  "UserId": 404,
  "CredentialType": "Default",
  "RobotEnvironments": "",
  "IsExternalLicensed": false,
  "Id": 147,
  "ExecutionSettings": null
}
```

だいたいこんな結果が得られます。

## コード抜粋

```typescript
const api = new OrchestratorApi(config)

// まずは認証
await api.authenticate()
try {
  // サンプル０．マシン登録
  const random = randomName()
  const machineName = `Machine_${random}`
  const testMachine = await api.machine.create({ Name: machineName }) // 登録する
  logger.info(testMachine)

  // サンプル１．ロボットの登録
  const expectedRobot = createRobotData(testMachine) // 登録データを作成
  logger.info(expectedRobot)
  const resultRobot = await api.robot.create(expectedRobot) // 登録
  logger.info(resultRobot)

  // サンプル２．ロボットを条件指定で検索・取得する
  const machinename = expectedRobot.MachineName
  const userName = expectedRobot.Username

  let instances = []
  instances = await api.robot.findAll({
    $filter: `MachineName eq '${machinename}' and Username eq '${userName}'`,
  })
  console.table(instances) // ちなみに、条件検索での戻り値には、なぜかLicenseKeyが入っていない。

  // サンプル３． ロボットを全件取得する
  instances = await api.robot.findAll()
  for (const instance of instances) {
    // サンプル２. ロボットをPK指定で取得する
    const robotId: number = instance.Id
    const robot = await api.robot.find(robotId)
    logger.info(robot)
  }
} catch (error) {
  logger.error(error)
}
```
