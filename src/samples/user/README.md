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
$ npx ts-node src/samples/user/userSample.ts
```

下記のような JSON データが出力されると思います。

ユーザ:

```json
{
    "@odata.context": "https://xxx/odata/$metadata#Users/$entity",
    "Name": "テストさん",
    "Surname": "LastName002",
    "UserName": "てすと",
    "Domain": null,
    "FullName": "テストさん LastName002",
    "EmailAddress": "masatomix@example.com",
    "IsEmailConfirmed": false,
    "LastLoginTime": null,
    "IsActive": true,
    "CreationTime": "2020-02-21T11:06:08.477Z",
    "AuthenticationSource": null,
    "Password": null,
    "IsExternalLicensed": false,
    "RolesList": ["Robot"],
    "LoginProviders": [],
    "TenantId": 1,
    "TenancyName": "Default",
    "TenantDisplayName": "Default",
    "TenantKey": "5B74xxx",
    "Type": "User",
    "ProvisionType": "Manual",
    "LicenseType": null,
    "Key": "41a8xxx",
    "MayHaveUserSession": true,
    "MayHaveRobotSession": true,
    "BypassBasicAuthRestriction": false,
    "Id": 413,
    "RobotProvision": null,
    "NotificationSubscription": {
        "Queues": true,
        "Robots": true,
        "Jobs": true,
        "Schedules": true,
        "Tasks": true,
        "QueueItems": true
    }
}
```

だいたいこんな結果が得られます。

## コード抜粋

```typescript
const api = new OrchestratorApi(config)
// まずは認証
await api.authenticate()

const random = randomName('user_')
const user = {
    Name: 'user001',
    Surname: 'LastName001',
    UserName: `${random}`,
    FullName: 'User LastName',
    EmailAddress: `${random}@example.com`,
    IsActive: true,
    Password: 'afjlaf#adA0!',
    RolesList: ['Robot'],
}
let testUserId: number = NaN
if (api.isEnterprise) {
    try {
        // ユーザ作成
        let testUser = await api.user.create(user)
        testUserId = testUser.Id

        // 検索する
        testUser = await api.user.find(testUserId)
        logger.info(testUser)

        const expectedName: string = '名前(更新成功)'
        testUser.Name = expectedName

        // 更新をしてみる
        testUser = await api.user.update(testUser)
        // ちなみに、updateは戻り値は空
        logger.info('---')
        logger.info(testUser)
        logger.info('---')

        testUser = await api.user.find(testUserId)
        logger.info(testUser)
    } catch (error) {
        logger.error(error)
    } finally {
        await api.user.delete(testUserId)
    }
} else {
    console.log('Community版のため、スキップ')
}
```
