## サンプルを実行してみる

```console
$ npx ts-node ./src/samples/folder/folderSample.ts
```

下記のような フォルダ情報の JSON文字列が出力されると思います。

```console
┌─────────┬─────────────┬────────────────────┬─────────────┬───────────────┬─────────────────────┬──────────┬────┐
│ (index) │ DisplayName │ FullyQualifiedName │ Description │ ProvisionType │   PermissionModel   │ ParentId │ Id │
├─────────┼─────────────┼────────────────────┼─────────────┼───────────────┼─────────────────────┼──────────┼────┤
│    0    │  'Default'  │     'Default'      │    null     │   'Manual'    │ 'InheritFromTenant' │   null   │ 1  │
│    1    │   'Test'    │       'Test'       │    null     │   'Manual'    │ 'InheritFromTenant' │   null   │ 7  │
└─────────┴─────────────┴────────────────────┴─────────────┴───────────────┴─────────────────────┴──────────┴────┘
```

```json
{
  "DisplayName": "Default",
  "FullyQualifiedName": "Default",
  "Description": null,
  "ProvisionType": "Manual",
  "PermissionModel": "InheritFromTenant",
  "ParentId": null,
  "Id": 1
}
```

以下は、フォルダにユーザをアサインしたのち「**その"フォルダ"を参照できるユーザ情報**」をJSON出力した結果です。

```json
{
  "Id": 2,
  "UserEntity": { "UserName": "admin", "IsInherited": false, "Id": 2 },
  "Roles": [
    { "Name": "Administrator", "Origin": "Assigned", "Id": 2, "InheritedFromFolder": null },
    { "Name": "TestRole", "Origin": "Assigned", "Id": 8, "InheritedFromFolder": null }
  ]
}
```

```json
{
  "Id": 1149,
  "UserEntity": { "UserName": "user_0306", "IsInherited": false, "Id": 1149 },
  "Roles": [{ "Name": "Robot", "Origin": "Assigned", "Id": 3, "InheritedFromFolder": null }]
}
```

この情報は画面の以下の箇所に該当します。

![f001.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/73777/0bb9265a-f1ea-0209-0143-ab06d0a50549.png)



以下の例は、ユーザをフォルダ3つにアサインしたのち「**その"ユーザ"が参照できるフォルダ情報**」をJSON出力した結果です。(いっこまえのサンプルは "あるフォルダ"についてのユーザ情報でした )

```JSON
{
  "@odata.context": "https://xxx/odata/#UserFolderRoles/",
  "Count": 3,  "Id": 0,
  "TenantRoles": [
    {
      "Name": "Robot", "Id": 3,
      "Users": [
        { "UserName": "user_0948", "IsInherited": false, "Id": 1150}
      ]
    }
  ],
  "PageItems": [
    {
      "Folder": {"DisplayName": "0296","FullyQualifiedName": "0296", "Id": 145},
      "Roles": [
        {
          "Name": null, "Id": 0,
          "Users": [
            { "UserName": "user_0948","IsInherited": false,"Id": 1150}
          ]
        }
      ]
    },
    {
      "Folder": {"DisplayName": "0582","FullyQualifiedName": "0582","Id": 146},
      "Roles": [
        {
          "Name": null,"Id": 0,
          "Users": [
            { "UserName": "user_0948","IsInherited": false,"Id": 1150}
          ]
        }
      ]
    },
    {
      "Folder": {"DisplayName": "0807","FullyQualifiedName": "0807","Id": 144},
      "Roles": [
        {
          "Name": null,"Id": 0,
          "Users": [
            { "UserName": "user_0948","IsInherited": false,"Id": 1150}
          ]
        }
      ]
    }
  ]
}
```

この情報は画面の以下の箇所に該当します。

![f002.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/73777/d21d6f75-9416-fa7b-fe01-5021d8ef9d98.png)


## サンプルコード

```typescript
import config from 'config'
import OrchestratorApi, { IOrchestratorApi } from '../../index'
import { randomName } from '../sampleUtils'

async function sample() {
  const api = new OrchestratorApi(config)
  await api.authenticate()

  // サンプル1: Folderの検索
  await searchSample(api)

  // サンプル2: ユーザ、Folderを作成して、アサインして、フォルダを削除
  await createAndAssignAndDeleteSample(api)

  // サンプル3: ユーザを作成、Folderをふたつ作成、それらにアサインして、
  // ユーザがみられるフォルダを表示、さいごにフォルダを削除
  await assignAndPrint(api)
}

const searchSample = async (api: IOrchestratorApi) => {
  try {
    const folders: any[] = await api.folder.findAll()
    console.table(folders)

    const folder: any = await api.folder.findByDisplayName('Default') // 画面の名前で検索できる
    console.log(folder)
  } catch (error) {
    console.error(error)
  }
}

const createAndAssignAndDeleteSample = async (api: IOrchestratorApi) => {
  let folderId
  try {
    const user = await createTestUser(api)
    const folder = await createTestFolder(api)
    // finallyで削除するので、folderId/userId を保持しておく
    folderId = folder.Id

    // folderにユーザをアサイン
    await api.folder.assignUsers(folder.Id, [user.Id])

    // Assignしたユーザを検索
    const results = await api.folder.getUsers(folder.Id)
    for (const result of results) {
      console.log(result)
    }
  } catch (error) {
    console.error(error)
  } finally {
    const userDelete = true
    cleanAll(api, [folderId], userDelete) // フォルダを削除する便利メソッド。
  }
}

const assignAndPrint = async (api: IOrchestratorApi) => {
  const folderIds = []
  try {
    const user = await createTestUser(api)
    for (let index = 0; index < 3; index++) {
      const folder = await createTestFolder(api)
      // finallyで削除するので、folderId を保持しておく
      folderIds.push(folder.Id)
      await api.folder.assignUsers(folder.Id, [user.Id])
    }
    const folders = await api.folder.getFolders(user.UserName)
    console.log(JSON.stringify(folders))
  } catch (error) {
    console.error(error)
  } finally {
    const userDelete = true
    cleanAll(api, folderIds, userDelete)
  }
}

const cleanAll = async (api: IOrchestratorApi, folderIds: Array<number>, userDelete: boolean = false) => {
  // さっきassignしたユーザ、フォルダの削除
  for (const folderId of folderIds) {
    // このフォルダを閲覧出来るユーザを検索
    const users = await api.folder.getUsers(folderId) // adminも含まれる

    for (const user of users) {
      await api.folder.removeUser(folderId, user.Id)
      if (userDelete && user.UserEntity.UserName !== 'admin') {
        await api.user.delete(user.Id) //さっきつくったユーザも削除
      }
    }
    await api.folder.delete(folderId) // folderも削除
  }
}

const createTestFolder = (api: IOrchestratorApi): Promise<any> => {
  const newFolder = api.folder.create({
    DisplayName: randomName(),
    Description: 'テスト',
    PermissionModel: 'InheritFromTenant', // よくわからない
    ProvisionType: 'Manual', // よくわからない
  })
  return newFolder
}

const createTestUser = (api: IOrchestratorApi): Promise<any> => {
  const random = randomName('user_')
  const user = {
    Name: 'user001',
    Surname: 'LastName001',
    UserName: `${random}`,
    // FullName: 'User LastName', ココはName+Surnameで勝手に更新される
    EmailAddress: `${random}@example.com`,
    IsActive: true,
    Password: 'afjlaf#adA0!', // (初期状態は)割と強固なパスでないとはじかれる
    RolesList: ['Robot'],
  }
  return api.user.create(user)
}

if (!module.parent) {
  (async () => {
    await sample()
  })()
}
```

## Orchestrator API との対応表

- findAll (queries?: any)
    - GET ``/odata/Folders``
- find (id: number)
    - GET ``/odata/Folders(${id})``
- findByDisplayName (name: string)
    - GET ``/odata/Folders`` に `` $filter: `DisplayName eq '${name}'` ``
- create (folder: any)
    - POST ``/odata/Folders``
- update (folder: any)
    - PUT ``/odata/Folders(${folder.Id})``
- delete (id: number)
    - DELETE ``/odata/Folders(${id})``
- assignUsers(folderId: number, userIds: Array<number>)
    - POST ``/odata/Folders/UiPath.Server.Configuration.OData.AssignUsers``
- removeUser(folderId: number, userId: number)
    - POST ``/odata/Folders(${folderId})/UiPath.Server.Configuration.OData.RemoveUserFromFolder``
- getUsers(folderId: number, queries?: any)
    - GET ``/odata/Folders/UiPath.Server.Configuration.OData.GetUsersForFolder(key=${folderId},includeInherited=true)``
- getFolders(userName: string)
    - GET ``/odata/Folders/UiPath.Server.Configuration.OData.GetAllRolesForUser(username='${userName}',skip=0,take=30)``