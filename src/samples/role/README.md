## サンプルを実行してみる

$ npx ts-node ./src/samples/role/roleSample.ts 

```console
┌─────────┬─────────────────┬─────────────────┬────────┬──────────┬────────────┬────┐
│ (index) │      Name       │   DisplayName   │ Groups │ IsStatic │ IsEditable │ Id │
├─────────┼─────────────────┼─────────────────┼────────┼──────────┼────────────┼────┤
│    0    │ 'Administrator' │ 'Administrator' │  null  │   true   │   false    │ 3  │
│    1    │     'Robot'     │     'Robot'     │  null  │   true   │    true    │ 4  │
└─────────┴─────────────────┴─────────────────┴────────┴──────────┴────────────┴────┘
```



```console
┌─────────┬──────┬─────────┬──────────┬────────┬──────────┬───────────────────────────┬──────────────────┬────────────────────────────┬──────────┬───────────────────────────┬──────────────────────┬──────────┬────────────────────┬───────────┬────────────────┬──────────┬─────────────┬───────────────────┬───────────┬────────┬───────────────┬─────────────┬────────────────────────────────────────┬────────────────────┬─────────────────────┬────────────────────────────┬────┬────────────────┬──────────────────────────┐
│ (index) │ Name │ Surname │ UserName │ Domain │ FullName │       EmailAddress        │ IsEmailConfirmed │       LastLoginTime        │ IsActive │       CreationTime        │ AuthenticationSource │ Password │ IsExternalLicensed │ RolesList │ LoginProviders │ TenantId │ TenancyName │ TenantDisplayName │ TenantKey │  Type  │ ProvisionType │ LicenseType │                  Key                   │ MayHaveUserSession │ MayHaveRobotSession │ BypassBasicAuthRestriction │ Id │ RobotProvision │ NotificationSubscription │
├─────────┼──────┼─────────┼──────────┼────────┼──────────┼───────────────────────────┼──────────────────┼────────────────────────────┼──────────┼───────────────────────────┼──────────────────────┼──────────┼────────────────────┼───────────┼────────────────┼──────────┼─────────────┼───────────────────┼───────────┼────────┼───────────────┼─────────────┼────────────────────────────────────────┼────────────────────┼─────────────────────┼────────────────────────────┼────┼────────────────┼──────────────────────────┤
│    0    │  ''  │   ''    │ 'admin'  │  null  │    ''    │ 'admin@defaulttenant.com' │      false       │ '2020-03-18T09:14:15.697Z' │   true   │ '2020-03-13T07:52:58.03Z' │         null         │   null   │       false        │    []     │       []       │    1     │    null     │       null        │   null    │ 'User' │   'Manual'    │    null     │ 'd9c2d84c-c4bf-42ae-bbbe-f2452101cef5' │        true        │        true         │           false            │ 2  │      null      │           null           │
└─────────┴──────┴─────────┴──────────┴────────┴──────────┴───────────────────────────┴──────────────────┴────────────────────────────┴──────────┴───────────────────────────┴──────────────────────┴──────────┴────────────────────┴───────────┴────────────────┴──────────┴─────────────┴───────────────────┴───────────┴────────┴───────────────┴─────────────┴────────────────────────────────────────┴────────────────────┴─────────────────────┴────────────────────────────┴────┴────────────────┴──────────────────────────┘
┌─────────┬──────┬─────────┬──────────┬────────┬──────────┬───────────────────────────┬──────────────────┬────────────────────────────┬──────────┬───────────────────────────┬──────────────────────┬──────────┬────────────────────┬───────────┬────────────────┬──────────┬─────────────┬───────────────────┬───────────┬────────┬───────────────┬─────────────┬────────────────────────────────────────┬────────────────────┬─────────────────────┬────────────────────────────┬────┬────────────────┬──────────────────────────┐
│ (index) │ Name │ Surname │ UserName │ Domain │ FullName │       EmailAddress        │ IsEmailConfirmed │       LastLoginTime        │ IsActive │       CreationTime        │ AuthenticationSource │ Password │ IsExternalLicensed │ RolesList │ LoginProviders │ TenantId │ TenancyName │ TenantDisplayName │ TenantKey │  Type  │ ProvisionType │ LicenseType │                  Key                   │ MayHaveUserSession │ MayHaveRobotSession │ BypassBasicAuthRestriction │ Id │ RobotProvision │ NotificationSubscription │
├─────────┼──────┼─────────┼──────────┼────────┼──────────┼───────────────────────────┼──────────────────┼────────────────────────────┼──────────┼───────────────────────────┼──────────────────────┼──────────┼────────────────────┼───────────┼────────────────┼──────────┼─────────────┼───────────────────┼───────────┼────────┼───────────────┼─────────────┼────────────────────────────────────────┼────────────────────┼─────────────────────┼────────────────────────────┼────┼────────────────┼──────────────────────────┤
│    0    │  ''  │   ''    │ 'admin'  │  null  │    ''    │ 'admin@defaulttenant.com' │      false       │ '2020-03-18T09:14:15.697Z' │   true   │ '2020-03-13T07:52:58.03Z' │         null         │   null   │       false        │    []     │       []       │    1     │    null     │       null        │   null    │ 'User' │   'Manual'    │    null     │ 'd9c2d84c-c4bf-42ae-bbbe-f2452101cef5' │        true        │        true         │           false            │ 2  │      null      │           null           │
└─────────┴──────┴─────────┴──────────┴────────┴──────────┴───────────────────────────┴──────────────────┴────────────────────────────┴──────────┴───────────────────────────┴──────────────────────┴──────────┴────────────────────┴───────────┴────────────────┴──────────┴─────────────┴───────────────────┴───────────┴────────┴───────────────┴─────────────┴────────────────────────────────────────┴────────────────────┴─────────────────────┴────────────────────────────┴────┴────────────────┴──────────────────────────┘
┌─────────┬──────┬─────────┬──────────┬────────┬──────────┬───────────────────────────┬──────────────────┬────────────────────────────┬──────────┬───────────────────────────┬──────────────────────┬──────────┬────────────────────┬───────────┬────────────────┬──────────┬─────────────┬───────────────────┬───────────┬────────┬───────────────┬─────────────┬────────────────────────────────────────┬────────────────────┬─────────────────────┬────────────────────────────┬────┬────────────────┬──────────────────────────┐
│ (index) │ Name │ Surname │ UserName │ Domain │ FullName │       EmailAddress        │ IsEmailConfirmed │       LastLoginTime        │ IsActive │       CreationTime        │ AuthenticationSource │ Password │ IsExternalLicensed │ RolesList │ LoginProviders │ TenantId │ TenancyName │ TenantDisplayName │ TenantKey │  Type  │ ProvisionType │ LicenseType │                  Key                   │ MayHaveUserSession │ MayHaveRobotSession │ BypassBasicAuthRestriction │ Id │ RobotProvision │ NotificationSubscription │
├─────────┼──────┼─────────┼──────────┼────────┼──────────┼───────────────────────────┼──────────────────┼────────────────────────────┼──────────┼───────────────────────────┼──────────────────────┼──────────┼────────────────────┼───────────┼────────────────┼──────────┼─────────────┼───────────────────┼───────────┼────────┼───────────────┼─────────────┼────────────────────────────────────────┼────────────────────┼─────────────────────┼────────────────────────────┼────┼────────────────┼──────────────────────────┤
│    0    │  ''  │   ''    │ 'admin'  │  null  │    ''    │ 'admin@defaulttenant.com' │      false       │ '2020-03-18T09:14:15.697Z' │   true   │ '2020-03-13T07:52:58.03Z' │         null         │   null   │       false        │    []     │       []       │    1     │    null     │       null        │   null    │ 'User' │   'Manual'    │    null     │ 'd9c2d84c-c4bf-42ae-bbbe-f2452101cef5' │        true        │        true         │           false            │ 2  │      null      │           null           │
└─────────┴──────┴─────────┴──────────┴────────┴──────────┴───────────────────────────┴──────────────────┴────────────────────────────┴──────────┴───────────────────────────┴──────────────────────┴──────────┴────────────────────┴───────────┴────────────────┴──────────┴─────────────┴───────────────────┴───────────┴────────┴───────────────┴─────────────┴────────────────────────────────────────┴────────────────────┴─────────────────────┴────────────────────────────┴────┴────────────────┴──────────────────────────┘
```

```console
┌─────────┬────────┐
│ (index) │ Values │
├─────────┼────────┤
│    0    │   2    │
│    1    │   11   │
└─────────┴────────┘
┌─────────┬────────┐
│ (index) │ Values │
├─────────┼────────┤
│    0    │  127   │
│    1    │  1033  │
│    2    │  556   │
│    3    │  1121  │
└─────────┴────────┘
```



```console
┌─────────┬─────────────────────────┬───────────┬────────┬──────────┬────┐
│ (index) │          Name           │ IsGranted │ RoleId │  Scope   │ Id │
├─────────┼─────────────────────────┼───────────┼────────┼──────────┼────┤
│    0    │       'Libraries'       │   true    │   1    │ 'Global' │ 0  │
│    1    │       'Machines'        │   true    │   1    │ 'Global' │ 0  │
│    2    │        'License'        │   true    │   1    │ 'Global' │ 0  │
│    3    │       'Settings'        │   true    │   1    │ 'Global' │ 0  │
│    4    │        'Robots'         │   true    │   1    │ 'Folder' │ 0  │
│    5    │       'Processes'       │   true    │   1    │ 'Folder' │ 0  │
│    6    │       'Packages'        │   true    │   1    │ 'Global' │ 0  │
│    7    │        'Assets'         │   true    │   1    │ 'Folder' │ 0  │
│    8    │     'Environments'      │   true    │   1    │ 'Folder' │ 0  │
│    9    │        'Queues'         │   true    │   1    │ 'Folder' │ 0  │
│   10    │     'Transactions'      │   true    │   1    │ 'Folder' │ 0  │
│   11    │         'Jobs'          │   true    │   1    │ 'Folder' │ 0  │
│   12    │       'Schedules'       │   true    │   1    │ 'Folder' │ 0  │
│   13    │         'Logs'          │   true    │   1    │ 'Folder' │ 0  │
│   14    │         'Roles'         │   true    │   1    │ 'Global' │ 0  │
│   15    │         'Users'         │   true    │   1    │ 'Global' │ 0  │
│   16    │         'Audit'         │   true    │   1    │ 'Global' │ 0  │
│   17    │        'Alerts'         │   true    │   1    │ 'Global' │ 0  │
│   18    │         'Units'         │   true    │   1    │ 'Global' │ 0  │
│   19    │       'Webhooks'        │   true    │   1    │ 'Global' │ 0  │
│   20    │      'Monitoring'       │   true    │   1    │ 'Folder' │ 0  │
│   21    │    'ExecutionMedia'     │   true    │   1    │ 'Folder' │ 0  │
│   22    │        'MLLogs'         │   false   │   0    │ 'Global' │ 0  │
│   23    │      'SubFolders'       │   true    │   1    │ 'Folder' │ 0  │
│   24    │    'Libraries.View'     │   true    │   1    │ 'Global' │ 0  │
│   25    │    'Libraries.Edit'     │   true    │   1    │ 'Global' │ 0  │
│   26    │   'Libraries.Create'    │   true    │   1    │ 'Global' │ 0  │
│   27    │   'Libraries.Delete'    │   true    │   1    │ 'Global' │ 0  │
│   28    │     'Machines.View'     │   true    │   1    │ 'Global' │ 0  │
│   29    │     'Machines.Edit'     │   true    │   1    │ 'Global' │ 0  │
│   30    │    'Machines.Create'    │   true    │   1    │ 'Global' │ 0  │
│   31    │    'Machines.Delete'    │   true    │   1    │ 'Global' │ 0  │
│   32    │     'License.View'      │   true    │   1    │ 'Global' │ 0  │
│   33    │     'License.Edit'      │   true    │   1    │ 'Global' │ 0  │
│   34    │    'License.Create'     │   true    │   1    │ 'Global' │ 0  │
│   35    │    'License.Delete'     │   true    │   1    │ 'Global' │ 0  │
│   36    │     'Settings.View'     │   true    │   1    │ 'Global' │ 0  │
│   37    │     'Settings.Edit'     │   true    │   1    │ 'Global' │ 0  │
│   38    │    'Settings.Create'    │   true    │   1    │ 'Global' │ 0  │
│   39    │    'Settings.Delete'    │   true    │   1    │ 'Global' │ 0  │
│   40    │      'Robots.View'      │   true    │   1    │ 'Folder' │ 0  │
│   41    │      'Robots.Edit'      │   true    │   1    │ 'Folder' │ 0  │
│   42    │     'Robots.Create'     │   true    │   1    │ 'Folder' │ 0  │
│   43    │     'Robots.Delete'     │   true    │   1    │ 'Folder' │ 0  │
│   44    │    'Processes.View'     │   true    │   1    │ 'Folder' │ 0  │
│   45    │    'Processes.Edit'     │   true    │   1    │ 'Folder' │ 0  │
│   46    │   'Processes.Create'    │   true    │   1    │ 'Folder' │ 0  │
│   47    │   'Processes.Delete'    │   true    │   1    │ 'Folder' │ 0  │
│   48    │     'Packages.View'     │   true    │   1    │ 'Global' │ 0  │
│   49    │     'Packages.Edit'     │   true    │   1    │ 'Global' │ 0  │
│   50    │    'Packages.Create'    │   true    │   1    │ 'Global' │ 0  │
│   51    │    'Packages.Delete'    │   true    │   1    │ 'Global' │ 0  │
│   52    │      'Assets.View'      │   true    │   1    │ 'Folder' │ 0  │
│   53    │      'Assets.Edit'      │   true    │   1    │ 'Folder' │ 0  │
│   54    │     'Assets.Create'     │   true    │   1    │ 'Folder' │ 0  │
│   55    │     'Assets.Delete'     │   true    │   1    │ 'Folder' │ 0  │
│   56    │   'Environments.View'   │   true    │   1    │ 'Folder' │ 0  │
│   57    │   'Environments.Edit'   │   true    │   1    │ 'Folder' │ 0  │
│   58    │  'Environments.Create'  │   true    │   1    │ 'Folder' │ 0  │
│   59    │  'Environments.Delete'  │   true    │   1    │ 'Folder' │ 0  │
│   60    │      'Queues.View'      │   true    │   1    │ 'Folder' │ 0  │
│   61    │      'Queues.Edit'      │   true    │   1    │ 'Folder' │ 0  │
│   62    │     'Queues.Create'     │   true    │   1    │ 'Folder' │ 0  │
│   63    │     'Queues.Delete'     │   true    │   1    │ 'Folder' │ 0  │
│   64    │   'Transactions.View'   │   true    │   1    │ 'Folder' │ 0  │
│   65    │   'Transactions.Edit'   │   true    │   1    │ 'Folder' │ 0  │
│   66    │  'Transactions.Create'  │   true    │   1    │ 'Folder' │ 0  │
│   67    │  'Transactions.Delete'  │   true    │   1    │ 'Folder' │ 0  │
│   68    │       'Jobs.View'       │   true    │   1    │ 'Folder' │ 0  │
│   69    │       'Jobs.Edit'       │   true    │   1    │ 'Folder' │ 0  │
│   70    │      'Jobs.Create'      │   true    │   1    │ 'Folder' │ 0  │
│   71    │      'Jobs.Delete'      │   true    │   1    │ 'Folder' │ 0  │
│   72    │    'Schedules.View'     │   true    │   1    │ 'Folder' │ 0  │
│   73    │    'Schedules.Edit'     │   true    │   1    │ 'Folder' │ 0  │
│   74    │   'Schedules.Create'    │   true    │   1    │ 'Folder' │ 0  │
│   75    │   'Schedules.Delete'    │   true    │   1    │ 'Folder' │ 0  │
│   76    │       'Logs.View'       │   true    │   1    │ 'Folder' │ 0  │
│   77    │       'Logs.Edit'       │   true    │   1    │ 'Folder' │ 0  │
│   78    │      'Logs.Create'      │   true    │   1    │ 'Folder' │ 0  │
│   79    │      'Logs.Delete'      │   true    │   1    │ 'Folder' │ 0  │
│   80    │      'Roles.View'       │   true    │   1    │ 'Global' │ 0  │
│   81    │      'Roles.Edit'       │   true    │   1    │ 'Global' │ 0  │
│   82    │     'Roles.Create'      │   true    │   1    │ 'Global' │ 0  │
│   83    │     'Roles.Delete'      │   true    │   1    │ 'Global' │ 0  │
│   84    │      'Users.View'       │   true    │   1    │ 'Global' │ 0  │
│   85    │      'Users.Edit'       │   true    │   1    │ 'Global' │ 0  │
│   86    │     'Users.Create'      │   true    │   1    │ 'Global' │ 0  │
│   87    │     'Users.Delete'      │   true    │   1    │ 'Global' │ 0  │
│   88    │      'Audit.View'       │   true    │   1    │ 'Global' │ 0  │
│   89    │      'Audit.Edit'       │   true    │   1    │ 'Global' │ 0  │
│   90    │     'Audit.Create'      │   true    │   1    │ 'Global' │ 0  │
│   91    │     'Audit.Delete'      │   true    │   1    │ 'Global' │ 0  │
│   92    │      'Alerts.View'      │   true    │   1    │ 'Global' │ 0  │
│   93    │      'Alerts.Edit'      │   true    │   1    │ 'Global' │ 0  │
│   94    │     'Alerts.Create'     │   true    │   1    │ 'Global' │ 0  │
│   95    │     'Alerts.Delete'     │   true    │   1    │ 'Global' │ 0  │
│   96    │      'Units.View'       │   true    │   1    │ 'Global' │ 0  │
│   97    │      'Units.Edit'       │   true    │   1    │ 'Global' │ 0  │
│   98    │     'Units.Create'      │   true    │   1    │ 'Global' │ 0  │
│   99    │     'Units.Delete'      │   true    │   1    │ 'Global' │ 0  │
│   100   │     'Webhooks.View'     │   true    │   1    │ 'Global' │ 0  │
│   101   │     'Webhooks.Edit'     │   true    │   1    │ 'Global' │ 0  │
│   102   │    'Webhooks.Create'    │   true    │   1    │ 'Global' │ 0  │
│   103   │    'Webhooks.Delete'    │   true    │   1    │ 'Global' │ 0  │
│   104   │    'Monitoring.View'    │   true    │   1    │ 'Folder' │ 0  │
│   105   │    'Monitoring.Edit'    │   true    │   1    │ 'Folder' │ 0  │
│   106   │   'Monitoring.Create'   │   true    │   1    │ 'Folder' │ 0  │
│   107   │   'Monitoring.Delete'   │   true    │   1    │ 'Folder' │ 0  │
│   108   │  'ExecutionMedia.View'  │   true    │   1    │ 'Folder' │ 0  │
│   109   │  'ExecutionMedia.Edit'  │   false   │   0    │ 'Folder' │ 0  │
│   110   │ 'ExecutionMedia.Create' │   false   │   0    │ 'Folder' │ 0  │
│   111   │ 'ExecutionMedia.Delete' │   false   │   0    │ 'Folder' │ 0  │
│   112   │      'MLLogs.View'      │   false   │   0    │ 'Global' │ 0  │
│   113   │      'MLLogs.Edit'      │   false   │   0    │ 'Global' │ 0  │
│   114   │     'MLLogs.Create'     │   false   │   0    │ 'Global' │ 0  │
│   115   │     'MLLogs.Delete'     │   false   │   0    │ 'Global' │ 0  │
│   116   │    'SubFolders.View'    │   true    │   1    │ 'Folder' │ 0  │
│   117   │    'SubFolders.Edit'    │   true    │   1    │ 'Folder' │ 0  │
│   118   │   'SubFolders.Create'   │   true    │   1    │ 'Folder' │ 0  │
│   119   │   'SubFolders.Delete'   │   true    │   1    │ 'Folder' │ 0  │
└─────────┴─────────────────────────┴───────────┴────────┴──────────┴────┘
```

## Orchestrator API との対応表

- findAll (queries?: any)
    - GET ``/odata/ProcessSchedules``
