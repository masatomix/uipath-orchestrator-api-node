import request from 'request'
import logger from './logger'
import {
  getData,
  getArray,
  putData,
  postData,
  deleteData,
  addProxy,
  uploadData,
  downloadData,
  createFilterStr,
  createAuditFilterStr,
  applyStyles,
  NetworkAccessError,
} from './utils'
import path from 'path'
import xPopWrapper = require('xlsx-populate-wrapper')

/**
 * Orchestrator API Wrapper
 * cf. https://docs.uipath.com/orchestrator/v2019/reference
 */
interface IOrchestratorApi {
  authenticate: () => Promise<any>
  license: ICrudService
  robot: RobotCrudService
  user: UserCrudService
  machine: MachineCrudService
  release: ReleaseCrudService
  process: ProcessCrudService
  job: JobCrudService
  schedule: ICrudService
  queueDefinition: QueueDefinitionCrudService
  queueItem: ICrudService
  queueOperation: QueueCrudService
  // asset: ICrudService
  log: LogCrudService
  auditLog: AuditLogCrudService
  // 以下、汎用的なメソッド
  getArray: (apiPath: string, queries?: any) => Promise<Array<any>>
  getData: (apiPath: string) => Promise<any>
  postData: (apiPath: string, obj: any) => Promise<any>
  putData: (apiPath: string, obj: any) => Promise<void>
  deleteData: (apiPath: string) => Promise<any>

  isEnterprise: boolean
  isCommunity: boolean
  isRobot: boolean
}

interface ICrudService {
  findAll: (obj?: any, asArray?: boolean) => Promise<Array<any>>
  find: (obj?: any) => Promise<any> // licenseなどはパラメタ不要だったりするのでOption
  create: (obj: any) => Promise<any>
  update: (obj: any) => Promise<void>
  delete: (obj: any) => Promise<any>
}

/**
 * Interfaceのデフォルト実装(全部でOverrideするのはメンドイので)
 */
class BaseCrudService implements ICrudService {
  protected parent: OrchestratorApi
  constructor(parent_: OrchestratorApi) {
    this.parent = parent_
  }
  findAll(obj?: any, asArray: boolean = true): Promise<Array<any>> {
    throw Error('Not implemented yet.')
  }
  find(obj?: any): Promise<any> {
    throw Error('Not implemented yet.')
  }
  create(obj: any): Promise<any> {
    throw Error('Not implemented yet.')
  }
  update(obj: any): Promise<any> {
    throw Error('Not implemented yet.')
  }
  delete(obj: any): Promise<any> {
    throw Error('Not implemented yet.')
  }
}

class UserCrudService extends BaseCrudService {
  constructor(parent_: OrchestratorApi) {
    super(parent_)
  }
  findAll(queries?: any, asArray: boolean = true): Promise<Array<any>> {
    return getArray(this.parent.config, this.parent.accessToken, '/odata/Users', queries, asArray)
  }

  find(id: number): Promise<any> {
    return getData(this.parent.config, this.parent.accessToken, `/odata/Users(${id})`)
  }

  _findByUserName(userName: string): Promise<Array<any>> {
    return this.findAll({ $filter: `UserName eq '${userName}'` })
  }

  async findByUserName(userName: string): Promise<any> {
    const users: any[] = await this._findByUserName(userName)
    return users[0]
  }

  update(user: any): Promise<any> {
    return putData(this.parent.config, this.parent.accessToken, `/odata/Users(${user.Id})`, user)
  }

  create(user: any): Promise<any> {
    return postData(this.parent.config, this.parent.accessToken, '/odata/Users', user)
  }

  delete(id: number): Promise<any> {
    return deleteData(this.parent.config, this.parent.accessToken, `/odata/Users(${id})`)
  }
}

class MachineCrudService extends BaseCrudService {
  constructor(parent_: OrchestratorApi) {
    super(parent_)
  }
  findAll(queries?: any, asArray: boolean = true): Promise<Array<any>> {
    return getArray(this.parent.config, this.parent.accessToken, '/odata/Machines', queries, asArray)
  }

  find(id: number): Promise<any> {
    return getData(this.parent.config, this.parent.accessToken, `/odata/Machines(${id})`)
  }

  _findByMachineName(machineName: string): Promise<Array<any>> {
    return this.findAll({ $filter: `Name eq '${machineName}'` })
  }

  async findByMachineName(machineName: string): Promise<any> {
    const machines: any[] = await this._findByMachineName(machineName)
    return machines[0]
  }

  create(machine: any): Promise<any> {
    return postData(this.parent.config, this.parent.accessToken, '/odata/Machines', machine)
  }

  update(machine: any): Promise<void> {
    return putData(this.parent.config, this.parent.accessToken, `/odata/Machines(${machine.Id})`, machine)
  }
  delete(id: number): Promise<any> {
    return deleteData(this.parent.config, this.parent.accessToken, `/odata/Machines(${id})`)
  }
}

class RobotCrudService extends BaseCrudService {
  constructor(parent_: OrchestratorApi) {
    super(parent_)
  }
  findAll(queries?: any, asArray: boolean = true): Promise<Array<any>> {
    return getArray(this.parent.config, this.parent.accessToken, '/odata/Robots', queries, asArray)
  }

  find(id: number): Promise<any> {
    return getData(this.parent.config, this.parent.accessToken, `/odata/Robots(${id})`)
  }

  _findByName(name: string): Promise<Array<any>> {
    return this.findAll({ $filter: `Name eq '${name}'` })
  }

  async findByRobotName(name: string): Promise<any> {
    const robos: any[] = await this._findByName(name)
    return robos[0]
  }

  create(robot: any): Promise<any> {
    return postData(this.parent.config, this.parent.accessToken, '/odata/Robots', robot)
  }

  update(robot: any): Promise<void> {
    return putData(this.parent.config, this.parent.accessToken, `/odata/Robots(${robot.Id})`, robot)
  }

  delete(id: number): Promise<any> {
    return deleteData(this.parent.config, this.parent.accessToken, `/odata/Robots(${id})`)
  }
}

class ReleaseCrudService extends BaseCrudService {
  constructor(parent_: OrchestratorApi) {
    super(parent_)
  }
  findAll(queries?: any, asArray: boolean = true): Promise<Array<any>> {
    return getArray(this.parent.config, this.parent.accessToken, '/odata/Releases', queries, asArray)
  }

  _findByProcessName(name: string): Promise<Array<any>> {
    return getArray(this.parent.config, this.parent.accessToken, '/odata/Releases', {
      $filter: `ProcessKey eq '${name}'`,
    })
  }
  async findByProcessKey(processKey: string): Promise<any> {
    // processKey は画面上のプロセスの名前
    const objs: any[] = await this._findByProcessName(processKey)
    return objs[0]
  }
}

class ProcessCrudService extends BaseCrudService {
  constructor(parent_: OrchestratorApi) {
    super(parent_)
  }
  /**
   * アクティブなバージョンに対しての検索。つまりプロセス一覧。
   * @param queries
   * @param asArray
   */
  findAll(queries?: any, asArray: boolean = true): Promise<Array<any>> {
    return getArray(this.parent.config, this.parent.accessToken, '/odata/Processes', queries, asArray)
  }

  uploadPackage(fullPath: string, asArray: boolean = true): Promise<Array<any>> {
    return uploadData(
      this.parent.config,
      this.parent.accessToken,
      'odata/Processes/UiPath.Server.Configuration.OData.UploadPackage()',
      fullPath,
      asArray,
    )
  }

  /**
   * 画面上の名前を指定して、非アクティブなモノもふくめて検索する。
   * @param processId
   * @param asArray
   */
  findPackage(processId: string, asArray: boolean = true): Promise<Array<any>> {
    return getArray(
      this.parent.config,
      this.parent.accessToken,
      `/odata/Processes/UiPath.Server.Configuration.OData.GetProcessVersions(processId='${processId}')`,
      {},
      asArray,
    )
  }

  deletePackage(processId: string, version?: string): Promise<any> {
    if (version) {
      return deleteData(this.parent.config, this.parent.accessToken, `/odata/Processes('${processId}:${version}')`)
    }
    return deleteData(this.parent.config, this.parent.accessToken, `/odata/Processes('${processId}')`)
  }

  /**
   *
   * @param key Sample:1.0.2 など、[processId:version]
   */
  downloadPackage(id: string, version: string): Promise<any> {
    return downloadData(
      this.parent.config,
      this.parent.accessToken,
      `/odata/Processes/UiPath.Server.Configuration.OData.DownloadPackage(key='${id}:${version}')`,
      id,
      version,
    )
  }
}

class JobCrudService extends BaseCrudService {
  constructor(parent_: OrchestratorApi) {
    super(parent_)
  }

  findAll(queries?: any, asArray: boolean = true): Promise<Array<any>> {
    return getArray(this.parent.config, this.parent.accessToken, '/odata/Jobs', queries, asArray)
  }

  find(id: number): Promise<any> {
    return getData(this.parent.config, this.parent.accessToken, `/odata/Jobs(${id})`)
  }

  _startJobs(startInfo: any): Promise<any> {
    return postData(
      this.parent.config,
      this.parent.accessToken,
      '/odata/Jobs/UiPath.Server.Configuration.OData.StartJobs',
      startInfo,
    )
  }

  async startJobs(processKey: string, robotNames: string[], jobsCount: number = 0): Promise<any> {
    const release = await this.parent.release.findByProcessKey(processKey)
    let promise: Promise<any>
    if (robotNames && robotNames.length > 0) {
      // logger.debug('Specific')
      // logger.debug(robotNames)
      // logger.debug(robotNames.length)

      const robotIdsPromise: Promise<number>[] = robotNames.map(async element => {
        const instance = await this.parent.robot.findByRobotName(element)
        return instance.Id
      })

      const robotIds = await Promise.all(robotIdsPromise)
      promise = this._startJobs({
        startInfo: {
          ReleaseKey: release.Key,
          RobotIds: robotIds,
          JobsCount: 0,
          Strategy: 'Specific',
          InputArguments: '{}',
        },
      })
    } else {
      // logger.debug('JobsCount')
      // logger.debug(robotNames)
      // logger.debug(robotNames.length)
      promise = this._startJobs({
        startInfo: {
          ReleaseKey: release.Key,
          RobotIds: [],
          JobsCount: jobsCount,
          Strategy: 'JobsCount',
          InputArguments: '{}',
        },
      })
    }
    return promise
  }

  stopJob(jobId: number, force: boolean = false): Promise<any> {
    let strategy: string
    if (force) {
      strategy = '2'
    } else {
      strategy = '1'
    }
    return postData(
      this.parent.config,
      this.parent.accessToken,
      `/odata/Jobs(${jobId})/UiPath.Server.Configuration.OData.StopJob`,
      {
        strategy: strategy,
      },
    )
  }

  // create(machine: any): Promise<any> {
  //   return postData(this.parent.config, this.parent.accessToken, '/odata/Machines', machine)
  // }

  // update(machine: any): Promise<void> {
  //   return putData(this.parent.config, this.parent.accessToken, `/odata/Machines(${machine.Id})`, machine)
  // }
  // delete(id: number): Promise<any> {
  //   return deleteData(this.parent.config, this.parent.accessToken, `/odata/Machines(${id})`)
  // }
}

class QueueDefinitionCrudService extends BaseCrudService {
  constructor(parent_: OrchestratorApi) {
    super(parent_)
  }

  findAll(queries?: any, asArray: boolean = true): Promise<Array<any>> {
    return getArray(this.parent.config, this.parent.accessToken, '/odata/QueueDefinitions', queries, asArray)
  }

  find(id: number): Promise<any> {
    return getData(this.parent.config, this.parent.accessToken, `/odata/QueueDefinitions(${id})`)
  }

  _findByName(name: string): Promise<Array<any>> {
    return getArray(this.parent.config, this.parent.accessToken, '/odata/QueueDefinitions', {
      $filter: `Name eq '${name}'`,
    })
  }

  async findByName(name: string): Promise<any> {
    const defs: any[] = await this._findByName(name)
    return defs[0]
  }

  create(queueDefinition: any): Promise<any> {
    return postData(this.parent.config, this.parent.accessToken, '/odata/QueueDefinitions', queueDefinition)
  }

  update(queueDefinition: any): Promise<any> {
    return putData(
      this.parent.config,
      this.parent.accessToken,
      `/odata/QueueDefinitions(${queueDefinition.Id})`,
      queueDefinition,
    )
  }

  delete(id: number): Promise<any> {
    return deleteData(this.parent.config, this.parent.accessToken, `/odata/QueueDefinitions(${id})`)
  }
}

class QueueCrudService extends BaseCrudService {
  constructor(parent_: OrchestratorApi) {
    super(parent_)
  }
  getQueueAndStartTransaction(queueName: string): Promise<any> {
    return postData(this.parent.config, this.parent.accessToken, '/odata/Queues/UiPathODataSvc.StartTransaction', {
      transactionData: {
        Name: queueName,
        RobotIdentifier: this.parent.accessToken,
      },
    })
  }
  setTransactionResult(queueItemId: number, statusObj: any): Promise<void> {
    return postData(
      this.parent.config,
      this.parent.accessToken,
      `/odata/Queues(${queueItemId})/UiPathODataSvc.SetTransactionResult`,
      statusObj,
    )
  }
}

class LogCrudService extends BaseCrudService {
  constructor(parent_: OrchestratorApi) {
    super(parent_)
  }

  findAll(queries?: any, asArray: boolean = true): Promise<Array<any>> {
    return getArray(this.parent.config, this.parent.accessToken, '/odata/RobotLogs', queries, asArray)
  }

  async findByFilter(
    filters: {
      from?: Date
      to?: Date
      robotName?: string
      processName?: string
      windowsIdentity?: string
      level?: 'TRACE' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL'
      machineName?: string
    },
    obj?: any,
    asArray: boolean = true,
  ): Promise<Array<any>> {
    const filterArray: string[] = await createFilterStr(filters, this.parent)
    const filter = filterArray.join(' and ')

    if (filter === '') {
      return this.findAll(obj, asArray)
    }

    let condition: any = {}
    if (obj) {
      condition = obj
      condition['$filter'] = filter
    } else {
      condition = { $filter: filter }
    }
    return this.findAll(condition, asArray)
  }

  async findStartEndLogs(
    filters: {
      from?: Date
      to?: Date
      robotName?: string
      processName?: string
      windowsIdentity?: string
      level?: 'TRACE' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL'
      machineName?: string
    },
    obj?: any,
  ): Promise<Array<any>> {
    const results: any[] = await this.findByFilter(filters, obj)

    return Promise.all(
      results
        .filter((data: any) => {
          const message: string = data.Message
          const rawMessageObj = JSON.parse(data.RawMessage)
          if (rawMessageObj.hasOwnProperty('totalExecutionTimeInSeconds')) {
            return true
          } else if (message.match(/の実行を開始しました/) || message.match(/execution started/)) {
            return true
          }
          return false
        })
        .map(async (data: any) => {
          let machineName: string = ''
          try {
            const machine = await this.parent.machine.find(data.MachineId)
            machineName = machine.Name
          } catch (error) {
            logger.error(`StatusCode: ${error.statusCode}`)
            logger.error(error.body)
            if (error instanceof NetworkAccessError) {
              if (error.statusCode === 404) {
                logger.error(`MachinId: ${data.MachineId}`)
                // 404の場合は処理を継続
              } else {
                throw error
              }
            }
          }
          delete data.Level
          delete data.MachineId
          const rawMessageObj = JSON.parse(data.RawMessage)
          if (rawMessageObj.hasOwnProperty('totalExecutionTimeInSeconds')) {
            return Object.assign({}, data, {
              MachineName: machineName,
              LogType: 'end',
              TotalExecutionTimeInSeconds: rawMessageObj.totalExecutionTimeInSeconds,
            })
          } else {
            return Object.assign({}, data, {
              MachineName: machineName,
              LogType: 'start',
              TotalExecutionTimeInSeconds: 0,
            })
          }
        }),
    )
  }

  async save2Excel(logs: any[], outputFullPath: string, templateFullPath?: string, sheetName = 'Sheet1') {
    // テンプレファイルは、指定されたファイルか、このソースがあるディレクトリ上のuntitled.xlsxを使う
    const inputPath = templateFullPath ? templateFullPath : path.join(__dirname, 'untitled.xlsx')
    logger.debug(`template path: ${inputPath}`)
    const workbook = new xPopWrapper(inputPath)
    await workbook.init()

    workbook.update(sheetName, logs) // 更新
    if (!templateFullPath) {
      applyStyles(logs, workbook, sheetName)
    }

    logger.debug(outputFullPath)
    // 書き込んだファイルを保存
    await workbook.commit(outputFullPath)
  }
}

class AuditLogCrudService extends BaseCrudService {
  constructor(parent_: OrchestratorApi) {
    super(parent_)
  }

  findAll(queries?: any, asArray: boolean = true): Promise<Array<any>> {
    return getArray(this.parent.config, this.parent.accessToken, '/odata/AuditLogs', queries, asArray)
  }

  async findByFilter(
    filters: {
      action?: string
      userName?: string
      component?: string
      methodName?: string
      from?: Date
      to?: Date
    },
    obj?: any,
    asArray: boolean = true,
  ): Promise<Array<any>> {
    const filterArray: string[] = await createAuditFilterStr(filters, this.parent)
    const filter = filterArray.join(' and ')

    if (filter === '') {
      return this.findAll(obj, asArray)
    }

    let condition: any = {}
    if (obj) {
      condition = obj
      condition['$filter'] = filter
    } else {
      condition = { $filter: filter }
    }
    return this.findAll(condition, asArray)
  }
}

/**
 * OrchestratorのAPIのWrapperクラス
 * (Mainのクラスです)
 */
class OrchestratorApi implements IOrchestratorApi {
  isEnterprise: boolean = false
  isCommunity: boolean = false
  isRobot: boolean = false
  config: any
  accessToken: string = ''

  constructor(config_: any) {
    this.config = config_
    // Enterpriseだったら、trueにする
    if (!this.config.serverinfo.client_id) {
      // serverinfo.client_idプロパティがなければEnterprise
      this.isEnterprise = true
    } else {
    }
    this.isCommunity = !this.isEnterprise // Enterpriseの逆にする。

    // Enterprise/Community判定は client_id があるなしだけの判定なので、
    // client_idナシかつ robotInfoだけあれば、userinfoなくてもロボットモードで動くようにする
    if (this.config.robotInfo) {
      this.isRobot = true
    } else {
    }
  }

  /**
   * Orchestrator API の認証システムに対して、認証を実施しアクセストークンを取得する。
   */
  authenticate(): Promise<any> {
    const servername = this.config.serverinfo.servername
    logger.debug(servername)

    // Enterprise版かCommunity版かで認証処理が異なるので、設定ファイルによって振り分ける。
    let promise: Promise<any>

    if (this.isRobot) {
      logger.info('Robotモードとして処理開始')
      logger.debug(this.config.robotInfo.machineKey)
      logger.debug(this.config.robotInfo.machineName)
      logger.debug(this.config.robotInfo.userName)

      const auth_options_tmp = {
        uri: servername + '/api/robotsservice/BeginSession',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'X-ROBOT-LICENSE': this.config.robotInfo.machineKey,
          'X-ROBOT-MACHINE-ENCODED': Buffer.from(this.config.robotInfo.machineName).toString('base64'),
          Accept: 'application/json',
        },
        json: { UserName: this.config.robotInfo.userName },
      }
      const auth_options = addProxy(this.config, auth_options_tmp)

      const me = this
      promise = new Promise((resolve, reject) => {
        request.post(auth_options, function(err: any, response: any, body: any) {
          if (err) {
            reject(err)
            return
          }
          const obj = body
          if (!obj.robotKey) {
            reject(obj)
            return
          }
          const access_token = obj.robotKey
          me.accessToken = access_token
          logger.debug(access_token)
          resolve(obj)
        })
      })
    } else if (this.isEnterprise) {
      logger.info('Enterprise版として処理開始')
      logger.debug(this.config.userinfo.tenancyName)
      logger.debug(this.config.userinfo.usernameOrEmailAddress)
      logger.debug(this.config.userinfo.password)

      const auth_options_tmp = {
        uri: servername + '/api/Account/Authenticate',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        form: this.config.userinfo,
      }
      const auth_options = addProxy(this.config, auth_options_tmp)

      const me = this
      promise = new Promise((resolve, reject) => {
        request.post(auth_options, function(err: any, response: any, body: any) {
          if (err) {
            reject(err)
            return
          }
          const obj = JSON.parse(body)
          if (!obj.success) {
            reject(obj)
            return
          }

          const access_token = obj.result
          me.accessToken = access_token
          logger.debug(access_token)
          resolve(obj)
        })
      })
    } else {
      logger.info('Community版として処理開始')
      const form = Object.assign(this.config.serverinfo, {
        grant_type: 'refresh_token',
      })
      const auth_options_tmp = {
        uri: 'https://account.uipath.com/oauth/token',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        form: form,
      }
      const auth_options = addProxy(this.config, auth_options_tmp)

      const me = this
      promise = new Promise((resolve, reject) => {
        request.post(auth_options, function(err: any, response: any, body: any) {
          if (err) {
            reject(err)
            return
          }
          const obj = JSON.parse(body)

          if (!obj.access_token) {
            reject(obj)
            return
          }

          logger.debug(obj)

          const access_token = obj.access_token
          me.accessToken = access_token
          logger.debug(access_token)
          resolve(obj)
        })
      })
    }
    return promise
  }

  license: ICrudService = new (class extends BaseCrudService {
    constructor(parent_: OrchestratorApi) {
      super(parent_)
    }
    find(): Promise<any> {
      return getData(
        this.parent.config,
        this.parent.accessToken,
        '/odata/Settings/UiPath.Server.Configuration.OData.GetLicense',
      )
    }
  })(this)

  robot: RobotCrudService = new RobotCrudService(this)

  user: UserCrudService = new UserCrudService(this)

  machine: MachineCrudService = new MachineCrudService(this)

  release: ReleaseCrudService = new ReleaseCrudService(this)

  process: ProcessCrudService = new ProcessCrudService(this)

  job: JobCrudService = new JobCrudService(this)

  schedule: ICrudService = new (class extends BaseCrudService {
    constructor(parent_: OrchestratorApi) {
      super(parent_)
    }
    findAll(queries?: any, asArray: boolean = true): Promise<Array<any>> {
      return getArray(this.parent.config, this.parent.accessToken, '/odata/ProcessSchedules', queries, asArray)
    }
  })(this)

  queueDefinition: QueueDefinitionCrudService = new QueueDefinitionCrudService(this)

  queueItem: ICrudService = new (class extends BaseCrudService {
    constructor(parent_: OrchestratorApi) {
      super(parent_)
    }
    // QueueItemを一覧する
    findAll(queries?: any, asArray: boolean = true): Promise<Array<any>> {
      return getArray(this.parent.config, this.parent.accessToken, '/odata/QueueItems', queries, asArray)
    }

    // PK指定で取得する
    find(queueItemId: number): Promise<Array<any>> {
      return getData(this.parent.config, this.parent.accessToken, `/odata/QueueItems(${queueItemId})`)
    }

    create(queue: any): Promise<any> {
      return postData(this.parent.config, this.parent.accessToken, '/odata/Queues/UiPathODataSvc.AddQueueItem', queue)
    }

    // PK指定で、削除済みにする。
    delete(queueItemId: number): Promise<any> {
      return deleteData(this.parent.config, this.parent.accessToken, `/odata/QueueItems(${queueItemId})`)
    }
  })(this)

  queueOperation: QueueCrudService = new QueueCrudService(this)

  // Todo:
  // asset: ICrudService = new (class extends BaseCrudService {
  //   constructor(parent_: OrchestratorApi) {
  //     super(parent_)
  //   }
  //   findAll(queries?: any, asArray: boolean = true): Promise<Array<any>> {
  //     return getArray(this.parent.config, this.parent.accessToken, '/odata/Machines', queries, asArray)
  //   }

  //   find(id: number): Promise<any> {
  //     return getData(this.parent.config, this.parent.accessToken, `/odata/Machines(${id})`)
  //   }

  //   create(machine: any): Promise<any> {
  //     return postData(this.parent.config, this.parent.accessToken, '/odata/Machines', machine)
  //   }

  //   update(machine: any): Promise<void> {
  //     return putData(this.parent.config, this.parent.accessToken, `/odata/Machines(${machine.Id})`, machine)
  //   }
  //   delete(id: number): Promise<any> {
  //     return deleteData(this.parent.config, this.parent.accessToken, `/odata/Machines(${id})`)
  //   }
  // })(this)

  log: LogCrudService = new LogCrudService(this)
  auditLog: AuditLogCrudService = new AuditLogCrudService(this)

  // ロボットグループ
  // ロール
  // アセット
  // タスク(Enterpriseには、ない)
  // フォルダー(OU)
  // Webhook

  getArray = (apiPath: string, queries?: any, isOdata: boolean = true): Promise<Array<any>> => {
    return getArray(this.config, this.accessToken, apiPath, queries, isOdata)
  }

  getData = (apiPath: string): Promise<any> => {
    return getData(this.config, this.accessToken, apiPath)
  }

  postData = (apiPath: string, obj: any): Promise<any> => {
    return postData(this.config, this.accessToken, apiPath, obj)
  }

  putData = (apiPath: string, obj: any): Promise<any> => {
    return putData(this.config, this.accessToken, apiPath, obj)
  }

  deleteData = (apiPath: string): Promise<any> => {
    return deleteData(this.config, this.accessToken, apiPath)
  }
}

export = OrchestratorApi

// 以下、確認のためのドライバ
import config from 'config'

const getConfig = () => {
  // 設定ファイルから読むパタン
  return config

  // Own Codingするパタン
  // return {
  //   userinfo: {
  //     tenancyName: 'default',
  //     usernameOrEmailAddress: 'aaa',
  //     password: 'bbb',
  //   },
  //   serverinfo: {
  //     servername: 'https://platform.uipath.com/',
  //   },
  // }
}

if (!module.parent) {
  async function main() {
    const api = new OrchestratorApi(getConfig())

    try {
      // まずは認証
      await api.authenticate()

      let instances: any[] = []

      // Schedulesを取得する
      instances = await api.schedule.findAll()
      for (const instance of instances) {
        console.log(instance)
      }

      // instances = await api.queueItem.findAll()
      // for (const instance of instances) {
      //   console.log(instance)
      // }
      // console.log(instances.length)

      // const queueItemId = instances[0].Id
      // const result = await api.queueItem.find(queueItemId)
      // console.log(result)

      // let queueDef = await api.queueDefinition.findByName('QueueTest')
      // // console.table(queueDef)

      // queueDef = await api.queueDefinition.find(1)
      // console.table(queueDef)
    } catch (error) {
      console.log(error)
    }
  }

  main()
}
