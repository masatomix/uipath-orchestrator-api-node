Settings機能は UiPath Orchestrator サーバの設定(メール設定、Timezone、パスワード強度 など)を操作する機能です。
サーバの設定情報を取得したり更新したり、Excelへダウンロードしたりすることができます。


## サンプルを実行してみる

```console
$ npx ts-node ./src/samples/setting/settingSample.ts 
```

コードと、実行した結果です。

```typescript
import config from 'config'
import OrchestratorApi from '../../index'

async function main() {
  const api = new OrchestratorApi(config)

  try {
    // まずは認証
    await api.authenticate()

    let instances: any[] = []

    // まずは全件検索
    instances = await api.setting.findAll()
    console.log('全件')
    console.table(instances)

    // キーで検索することもできます。引数は可変長引数になっています。
    instances = await api.setting.findByKey()('Alerts.Email.Enabled', 'Abp.Timing.TimeZone', 'Abp.Net.Mail.Smtp.Host')
    console.log('キー検索')
    console.table(instances)

    // ちなみに、前方一致です。
    instances = await api.setting.findByKey()('Abp.Net.Mail')
    console.log('前方一致検索結果')
    console.table(instances)

    // 結果をExcelに保存します。
    await api.setting.save2Excel(instances, 'settings.xlsx')

    // そのExcelから、設定情報を読み込んでみます(ファイルから読み込むだけでOCへ設定を反映したりはしません)。
    instances = await api.setting.readSettingsFromFile('settings.xlsx')
    console.log('Excel読み込み結果')
    console.table(instances)

    // 一行選択して、実際にサーバの設定「Abp.Net.Mail.Smtp.Domain」を変更してみます。()
    instances = await api.setting.findByKey()('Abp.Net.Mail.Smtp.Domain')
    console.log('更新前の値')
    console.table(instances)

    // 更新処理
    instances[0].Value = 'example.com'
    await api.setting.update(instances)

    instances = await api.setting.findByKey()('Abp.Net.Mail.Smtp.Domain')
    console.log('更新後の値')
    console.table(instances)

    // // 参考: 可変長引数へ配列を渡すやりかた。
    // const keys = ['Alerts.Email.Enabled', 'Abp.Timing.TimeZone', 'Abp.Net.Mail.Smtp.Host']
    // instances = await api.setting.findByKey()(...keys)
    // console.table(instances)
  } catch (error) {
    console.log(error)
  }
}

if (!module.parent) {
  ;(async () => {
    await main()
  })()
}
```


さて実行結果です。

```console
全件
┌─────────┬─────────────────────────────────────────────────────────┬────────────────────────────────────────┬───────┬─────────────────────────────────────────────────────────┐
│ (index) │                          Name                           │                 Value                  │ Scope │                           Id                            │
├─────────┼─────────────────────────────────────────────────────────┼────────────────────────────────────────┼───────┼─────────────────────────────────────────────────────────┤
│    0    │         'Abp.Localization.DefaultLanguageName'          │                  'ja'                  │ null  │         'Abp.Localization.DefaultLanguageName'          │
│    1    │                'Abp.Net.Mail.Smtp.Host'                 │     'uipath-friends.xxxx'              │ null  │                'Abp.Net.Mail.Smtp.Host'                 │
│    2    │                'Abp.Net.Mail.Smtp.Port'                 │                 '587'                  │ null  │                'Abp.Net.Mail.Smtp.Port'                 │
│    3    │              'Abp.Net.Mail.Smtp.UserName'               │      'xxxxx@uipath-friends.info'       │ null  │              'Abp.Net.Mail.Smtp.UserName'               │
│    4    │              'Abp.Net.Mail.Smtp.Password'               │             '••••••••••••'             │ null  │              'Abp.Net.Mail.Smtp.Password'               │
│    5    │               'Abp.Net.Mail.Smtp.Domain'                │                   ''                   │ null  │               'Abp.Net.Mail.Smtp.Domain'                │
│    6    │              'Abp.Net.Mail.Smtp.EnableSsl'              │                 'true'                 │ null  │              'Abp.Net.Mail.Smtp.EnableSsl'              │
│    7    │        'Abp.Net.Mail.Smtp.UseDefaultCredentials'        │                'false'                 │ null  │        'Abp.Net.Mail.Smtp.UseDefaultCredentials'        │
│    8    │            'Abp.Net.Mail.DefaultFromAddress'            │      'xxxxx@uipath-friends.info'       │ null  │            'Abp.Net.Mail.DefaultFromAddress'            │
│    9    │          'Abp.Net.Mail.DefaultFromDisplayName'          │      'Orchestrator Administrator'      │ null  │          'Abp.Net.Mail.DefaultFromDisplayName'          │
│   10    │                  'Abp.Timing.TimeZone'                  │         'Tokyo Standard Time'          │ null  │                  'Abp.Timing.TimeZone'                  │
│   11    │                  'InternalDeployment'                   │                 'true'                 │ null  │                  'InternalDeployment'                   │
│   12    │                     'DeploymentUrl'                     │                   ''                   │ null  │                     'DeploymentUrl'                     │
│   13    │                 'NuGet.Packages.ApiKey'                 │ '54Bxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' │ null  │                 'NuGet.Packages.ApiKey'                 │
│   14    │        'Deployment.Processes.AuthenticationType'        │                'apikey'                │ null  │        'Deployment.Processes.AuthenticationType'        │
│   15    │                'DeploymentBasicUsername'                │                   ''                   │ null  │                'DeploymentBasicUsername'                │
│   16    │                'DeploymentBasicPassword'                │                   ''                   │ null  │                'DeploymentBasicPassword'                │
│   17    │               'Deployment.Libraries.Url'                │                   ''                   │ null  │               'Deployment.Libraries.Url'                │
│   18    │             'Deployment.Libraries.Internal'             │                 'true'                 │ null  │             'Deployment.Libraries.Internal'             │
│   19    │        'Deployment.Libraries.AuthenticationType'        │                'apikey'                │ null  │        'Deployment.Libraries.AuthenticationType'        │
│   20    │                'NuGet.Activities.ApiKey'                │ '79Bxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' │ null  │                'NuGet.Activities.ApiKey'                │
│   21    │          'Deployment.Libraries.UseSharedFeed'           │                 'true'                 │ null  │          'Deployment.Libraries.UseSharedFeed'           │
│   22    │          'Deployment.Libraries.BasicUsername'           │                   ''                   │ null  │          'Deployment.Libraries.BasicUsername'           │
│   23    │          'Deployment.Libraries.BasicPassword'           │                   ''                   │ null  │          'Deployment.Libraries.BasicPassword'           │
│   24    │                 'PasswordComplexity'                    │               '{xxxxxx}'               │ null  │                 'Alerts.Email.Enabled'                  │
│   24    │                 'Alerts.Email.Enabled'                  │                 'true'                 │ null  │                 'Alerts.Email.Enabled'                  │
│   25    │              'Auth.UserLockOut.IsEnabled'               │                 'true'                 │ null  │              'Auth.UserLockOut.IsEnabled'               │
│   26    │ 'Auth.UserLockOut.MaxFailedAccessAttemptsBeforeLockout' │                  '10'                  │ null  │ 'Auth.UserLockOut.MaxFailedAccessAttemptsBeforeLockout' │
│   27    │     'Auth.UserLockOut.DefaultAccountLockoutSeconds'     │                 '300'                  │ null  │     'Auth.UserLockOut.DefaultAccountLockoutSeconds'     │
│   28    │          'Auth.Password.DefaultExpirationDays'          │                  '0'                   │ null  │          'Auth.Password.DefaultExpirationDays'          │
│   29    │            'Auth.Password.PreviousUseLimit'             │                  '1'                   │ null  │            'Auth.Password.PreviousUseLimit'             │
│   30    │   'Auth.Password.ShouldChangePasswordAfterFirstLogin'   │                 'true'                 │ null  │   'Auth.Password.ShouldChangePasswordAfterFirstLogin'   │
│   31    │                'GlobalExecutionSettings'                │                  '{}'                  │ null  │                'GlobalExecutionSettings'                │
│   32    │          'AttendedRobot.RunDisconnectedHours'           │                  '0'                   │ null  │          'AttendedRobot.RunDisconnectedHours'           │
│   33    │              'Scalability.SignalR.Enabled'              │                 'true'                 │ null  │              'Scalability.SignalR.Enabled'              │
│   34    │             'Scalability.SignalR.Transport'             │                  '7'                   │ null  │             'Scalability.SignalR.Transport'             │
│   35    │            'Features.ModernFolders.Enabled'             │                'false'                 │ null  │            'Features.ModernFolders.Enabled'             │
└─────────┴─────────────────────────────────────────────────────────┴────────────────────────────────────────┴───────┴─────────────────────────────────────────────────────────┘
```

Id/Name はなんとなく「画面のあの項目かな」ってわかるようなキーになってます。OCの設定情報が取得できているようですね。実際の値はValueに入ってますがこれらはすべて文字列で返ってくるようです。


次はキー(Id/Nameのこと。同じ値が入ってるみたい)で検索した結果。

```console
キー検索
┌─────────┬──────────────────────────┬───────────────────────────────┬───────┬──────────────────────────┐
│ (index) │           Name           │             Value             │ Scope │            Id            │
├─────────┼──────────────────────────┼───────────────────────────────┼───────┼──────────────────────────┤
│    0    │ 'Abp.Net.Mail.Smtp.Host' │   'uipath-friends.xxxx'       │ null  │ 'Abp.Net.Mail.Smtp.Host' │
│    1    │  'Abp.Timing.TimeZone'   │     'Tokyo Standard Time'     │ null  │  'Abp.Timing.TimeZone'   │
│    2    │  'Alerts.Email.Enabled'  │            'true'             │ null  │  'Alerts.Email.Enabled'  │
└─────────┴──────────────────────────┴───────────────────────────────┴───────┴──────────────────────────┘
```


キーは前方一致するようにしてありますので引数に「``Abp.Net.Mail``」をわたすと、その文字から始まる下記の項目を取得することができます。

```console
前方一致検索結果
┌─────────┬───────────────────────────────────────────┬────────────────────────────────────┬───────┬───────────────────────────────────────────┐
│ (index) │                   Name                    │               Value                │ Scope │                    Id                     │
├─────────┼───────────────────────────────────────────┼────────────────────────────────────┼───────┼───────────────────────────────────────────┤
│    0    │         'Abp.Net.Mail.Smtp.Host'          │      'uipath-friends.xxxx'         │ null  │         'Abp.Net.Mail.Smtp.Host'          │
│    1    │         'Abp.Net.Mail.Smtp.Port'          │               '587'                │ null  │         'Abp.Net.Mail.Smtp.Port'          │
│    2    │       'Abp.Net.Mail.Smtp.UserName'        │    'xxxxx@uipath-friends.info'     │ null  │       'Abp.Net.Mail.Smtp.UserName'        │
│    3    │       'Abp.Net.Mail.Smtp.Password'        │           '••••••••••••'           │ null  │       'Abp.Net.Mail.Smtp.Password'        │
│    4    │        'Abp.Net.Mail.Smtp.Domain'         │                 ''                 │ null  │        'Abp.Net.Mail.Smtp.Domain'         │
│    5    │       'Abp.Net.Mail.Smtp.EnableSsl'       │               'true'               │ null  │       'Abp.Net.Mail.Smtp.EnableSsl'       │
│    6    │ 'Abp.Net.Mail.Smtp.UseDefaultCredentials' │              'false'               │ null  │ 'Abp.Net.Mail.Smtp.UseDefaultCredentials' │
│    7    │     'Abp.Net.Mail.DefaultFromAddress'     │     'xxxxx@uipath-friends.info'    │ null  │     'Abp.Net.Mail.DefaultFromAddress'     │
│    8    │   'Abp.Net.Mail.DefaultFromDisplayName'   │    'Orchestrator Administrator'    │ null  │   'Abp.Net.Mail.DefaultFromDisplayName'   │
└─────────┴───────────────────────────────────────────┴────────────────────────────────────┴───────┴───────────────────────────────────────────┘
```

取得した設定情報の配列データは ``api.setting.save2Excel(instances, 'settings.xlsx')`` でファイルに出力することができます。

![excel01.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/73777/a567461e-d8dd-b0a7-7763-9dd1b2677f77.png)


さらに``instances = await api.setting.readSettingsFromFile('settings.xlsx')`` でファイルからデータを読み込めます。
ExcelデータからOCへデータを一括反映するときなどに使用できますね。


```console
Excel読み込み結果
┌─────────┬───────────────────────────────────────────┬───────────────────────────────────────────┬────────────────────────────────────┬───────┐
│ (index) │                    Id                     │                   Name                    │               Value                │ Scope │
├─────────┼───────────────────────────────────────────┼───────────────────────────────────────────┼────────────────────────────────────┼───────┤
│    0    │         'Abp.Net.Mail.Smtp.Host'          │         'Abp.Net.Mail.Smtp.Host'          │      'uipath-friends.xxxx'         │  ''   │
│    1    │         'Abp.Net.Mail.Smtp.Port'          │         'Abp.Net.Mail.Smtp.Port'          │               '587'                │  ''   │
│    2    │       'Abp.Net.Mail.Smtp.UserName'        │       'Abp.Net.Mail.Smtp.UserName'        │   'xxxxx@uipath-friends.info'      │  ''   │
│    3    │       'Abp.Net.Mail.Smtp.Password'        │       'Abp.Net.Mail.Smtp.Password'        │           '••••••••••••'           │  ''   │
│    4    │        'Abp.Net.Mail.Smtp.Domain'         │        'Abp.Net.Mail.Smtp.Domain'         │                 ''                 │  ''   │
│    5    │       'Abp.Net.Mail.Smtp.EnableSsl'       │       'Abp.Net.Mail.Smtp.EnableSsl'       │               'true'               │  ''   │
│    6    │ 'Abp.Net.Mail.Smtp.UseDefaultCredentials' │ 'Abp.Net.Mail.Smtp.UseDefaultCredentials' │              'false'               │  ''   │
│    7    │     'Abp.Net.Mail.DefaultFromAddress'     │     'Abp.Net.Mail.DefaultFromAddress'     │   'xxxxx@uipath-friends.info'      │  ''   │
│    8    │   'Abp.Net.Mail.DefaultFromDisplayName'   │   'Abp.Net.Mail.DefaultFromDisplayName'   │    'Orchestrator Administrator'    │  ''   │
└─────────┴───────────────────────────────────────────┴───────────────────────────────────────────┴────────────────────────────────────┴───────┘
```


さて、OCから取得したデータや上記のようにExcelから読み込んだデータを用いて、OC上の設定情報を更新してみます。

```console
更新前の値
┌─────────┬────────────────────────────┬───────┬───────┬────────────────────────────┐
│ (index) │            Name            │ Value │ Scope │             Id             │
├─────────┼────────────────────────────┼───────┼───────┼────────────────────────────┤
│    0    │ 'Abp.Net.Mail.Smtp.Domain' │  ''   │ null  │ 'Abp.Net.Mail.Smtp.Domain' │
└─────────┴────────────────────────────┴───────┴───────┴────────────────────────────┘
```

このデータの``Value``を書き換えて、``api.setting.update()``メソッドでサーバの情報を更新します。


```typescript
// 更新処理
instances[0].Value = 'example.com'
await api.setting.update(instances)
```

もう一度OCから設定情報を取得してみると、、、

```console
更新後の値
┌─────────┬────────────────────────────┬───────────────┬───────┬────────────────────────────┐
│ (index) │            Name            │     Value     │ Scope │             Id             │
├─────────┼────────────────────────────┼───────────────┼───────┼────────────────────────────┤
│    0    │ 'Abp.Net.Mail.Smtp.Domain' │ 'example.com' │ null  │ 'Abp.Net.Mail.Smtp.Domain' │
└─────────┴────────────────────────────┴───────────────┴───────┴────────────────────────────┘
```

変わっていますね！実際に画面でも見てみると、、

![before.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/73777/9aa87bb6-0166-946a-266d-96977da1f23d.png)


反映されていますねーー。。

![after.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/73777/c8be957b-7dd6-085b-c073-a245410799dd.png)




## Orchestrator API との対応表

- findAll (queries?: any)
    - GET ``/odata/Settings``
- find (id: string)
    - GET ``/odata/Settings('${id}')``
- findByKey (queries?: any): (...keys: string[])
    - GET ``/odata/Settings`` で取得後、 ``keys`` でフィルタリング
- update (settingObjs: any[])
    - POST ``/odata/Settings/UiPath.Server.Configuration.OData.UpdateBulk``
- readSettingsFromFile(fullPath: string, sheetName = 'Sheet1')
    - ``fullPath``のファイルにreadアクセスするだけでOCのAPIは使用していません
- save2Excel( settings: any[], outputFullPath: string)
    - ``outputFullPath``のファイルにwriteアクセスするだけでOCのAPIは使用していません