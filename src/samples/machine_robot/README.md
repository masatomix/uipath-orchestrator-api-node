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


## サンプルコード

```typescript
import config from 'config'
import OrchestratorApi from '../../index'
import { randomName, createRobotData } from '../sampleUtils'

async function sample() {
  const api = new OrchestratorApi(config)

  // まずは認証
  await api.authenticate()
  try {
    // サンプル０．マシン登録
    const random = randomName()
    const machineName = `Machine_${random}`
    const testMachine = await api.machine.create({ Name: machineName }) // 登録する
    console.log(testMachine)

    // サンプル１．ロボットの登録
    const expectedRobot = createRobotData(testMachine) // 登録データを作成
    console.log(expectedRobot)
    const resultRobot = await api.robot.create(expectedRobot) // 登録
    console.log(resultRobot)

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
      console.log(robot)
    }
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

Machine

- findAll (queries?: any)
    - GET ``/odata/Machines``
- find (id: number)
    - GET ``/odata/Machines(${id})``
- create (machine: any)
    - POST ``/odata/Machines``
- update (machine: any)
    - PUT ``/odata/Machines(${user.Id})``
- delete (id: number)
    - DELETE ``/odata/Machines(${id})``
 

Robot

- findAll (queries?: any)
    - GET ``/odata/Robots``
- find (id: number)
    - GET ``/odata/Robots(${id})``
- findByRobotName (name: string)
    - GET ``/odata/Robots`` に `` $filter: `Name eq '${name}'` ``
- create (robot: any)
    - POST ``/odata/Robots``
- update (robot: any)
    - PUT ``/odata/Robots(${user.Id})``
- delete (id: number)
    - DELETE ``/odata/Robots(${id})``
 