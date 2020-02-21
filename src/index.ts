import request from 'request'
import logger from './logger'
import { getData, getArray, putData, postData, deleteData, addProxy } from './utils'

/**
 * Orchestrator API Wrapper
 * cf. https://docs.uipath.com/orchestrator/v2019/reference
 */
interface IOrchestratorApi {
  authenticate: () => Promise<any>
  license: ICrudService
  robot: ICrudService
  user: UserCrudService
  machine: ICrudService
  process: ICrudService
  schedule: ICrudService
  queueDefinition: ICrudService
  queueItem: ICrudService
  queueOperation: QueueCrudService // Queueの処理をするのに、Robotの情報が必要かもしれないので、これはisRobotのときのみ動くようにする？
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
  findAll: (obj?: any) => Promise<Array<any>>
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
  findAll(obj?: any): Promise<Array<any>> {
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
  findByUserName(userName: String): Promise<Array<any>> {
    throw Error('Not implemented yet.')
  }
}

class QueueDefinitionCrudService extends BaseCrudService {
  constructor(parent_: OrchestratorApi) {
    super(parent_)
  }
  findByName(name: String): Promise<any> {
    throw Error('Not implemented yet.')
  }
}

class QueueCrudService extends BaseCrudService {
  constructor(parent_: OrchestratorApi) {
    super(parent_)
  }
  getQueueAndStartTransaction(queueName: string): Promise<any> {
    throw Error('Not implemented yet.')
  }
  setTransactionResult(queueItemId: number, statusObj: any): Promise<void> {
    throw Error('Not implemented yet.')
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
  private config: any
  private accessToken: string = ''

  constructor(config_: any) {
    this.config = config_
    // Enterpriseだったら、trueにする
    if (!this.config.serverinfo.client_id) { // serverinfo.client_idプロパティがなければEnterprise
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
          'X-ROBOT-MACHINE-ENCODED': Buffer.from(this.config.robotInfo.machineName).toString(
            'base64',
          ),
          Accept: 'application/json',
        },
        json: { UserName: this.config.robotInfo.userName },
      }
      const auth_options = addProxy(this.config, auth_options_tmp)

      const me = this
      promise = new Promise((resolve, reject) => {
        request.post(auth_options, function (err: any, response: any, body: any) {
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
        request.post(auth_options, function (err: any, response: any, body: any) {
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
        request.post(auth_options, function (err: any, response: any, body: any) {
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

  robot: ICrudService = new (class extends BaseCrudService {
    constructor(parent_: OrchestratorApi) {
      super(parent_)
    }
    findAll(queries?: any): Promise<Array<any>> {
      return getArray(this.parent.config, this.parent.accessToken, '/odata/Robots', queries)
    }

    find(id: number): Promise<any> {
      return getData(this.parent.config, this.parent.accessToken, `/odata/Robots(${id})`)
    }

    create(robot: any): Promise<any> {
      return postData(this.parent.config, this.parent.accessToken, '/odata/Robots', robot)
    }

    update(robot: any): Promise<void> {
      return putData(
        this.parent.config,
        this.parent.accessToken,
        `/odata/Robots(${robot.Id})`,
        robot,
      )
    }

    delete(id: number): Promise<any> {
      return deleteData(this.parent.config, this.parent.accessToken, `/odata/Robots(${id})`)
    }
  })(this)

  user: UserCrudService = new (class extends BaseCrudService {
    constructor(parent_: OrchestratorApi) {
      super(parent_)
    }
    findAll(queries?: any): Promise<Array<any>> {
      return getArray(this.parent.config, this.parent.accessToken, '/odata/Users', queries)
    }

    find(id: number): Promise<any> {
      return getData(this.parent.config, this.parent.accessToken, `/odata/Users(${id})`)
    }

    findByUserName(userName: String): Promise<any> {
      return getArray(this.parent.config, this.parent.accessToken, '/odata/Users', {
        $filter: `UserName eq '${userName}'`,
      })
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
  })(this)

  machine: ICrudService = new (class extends BaseCrudService {
    constructor(parent_: OrchestratorApi) {
      super(parent_)
    }
    findAll(queries?: any): Promise<Array<any>> {
      return getArray(this.parent.config, this.parent.accessToken, '/odata/Machines', queries)
    }

    find(id: number): Promise<any> {
      return getData(this.parent.config, this.parent.accessToken, `/odata/Machines(${id})`)
    }

    create(machine: any): Promise<any> {
      return postData(this.parent.config, this.parent.accessToken, '/odata/Machines', machine)
    }

    update(machine: any): Promise<void> {
      return putData(
        this.parent.config,
        this.parent.accessToken,
        `/odata/Machines(${machine.Id})`,
        machine,
      )
    }
    delete(id: number): Promise<any> {
      return deleteData(this.parent.config, this.parent.accessToken, `/odata/Machines(${id})`)
    }

  })(this)

  process: ICrudService = new (class extends BaseCrudService {
    constructor(parent_: OrchestratorApi) {
      super(parent_)
    }
    findAll(queries?: any): Promise<Array<any>> {
      return getArray(this.parent.config, this.parent.accessToken, '/odata/Releases', queries)
    }
  })(this)

  schedule: ICrudService = new (class extends BaseCrudService {
    constructor(parent_: OrchestratorApi) {
      super(parent_)
    }
    findAll(queries?: any): Promise<Array<any>> {
      return getArray(
        this.parent.config,
        this.parent.accessToken,
        '/odata/ProcessSchedules',
        queries,
      )
    }
  })(this)

  queueDefinition: QueueDefinitionCrudService = new (class extends BaseCrudService {
    constructor(parent_: OrchestratorApi) {
      super(parent_)
    }

    findAll(queries?: any): Promise<Array<any>> {
      return getArray(this.parent.config, this.parent.accessToken, '/odata/QueueDefinitions', queries)
    }

    find(id: number): Promise<Array<any>> {
      return getData(
        this.parent.config,
        this.parent.accessToken,
        `/odata/QueueDefinitions(${id})`,
      )
    }

    _findByName(name: String): Promise<Array<any>> {
      return getArray(this.parent.config, this.parent.accessToken, '/odata/QueueDefinitions', {
        $filter: `Name eq '${name}'`,
      })
    }

    async findByName(name: String): Promise<any> {
      const defs: any[] = await this._findByName(name)
      return defs[0]
    }

    create(queueDefinition: any): Promise<any> {
      return postData(
        this.parent.config,
        this.parent.accessToken,
        '/odata/QueueDefinitions',
        queueDefinition,
      )
    }

    update(queueDefinition: any): Promise<any> {
      return putData(this.parent.config, this.parent.accessToken, `/odata/QueueDefinitions(${queueDefinition.Id})`, queueDefinition)
    }

    delete(id: number): Promise<any> {
      return deleteData(
        this.parent.config,
        this.parent.accessToken,
        `/odata/QueueDefinitions(${id})`,
      )
    }
  })(this)

  queueItem: ICrudService = new (class extends BaseCrudService {
    constructor(parent_: OrchestratorApi) {
      super(parent_)
    }
    // QueueItemを一覧する
    findAll(queries?: any): Promise<Array<any>> {
      return getArray(this.parent.config, this.parent.accessToken, '/odata/QueueItems', queries)
    }

    // PK指定で取得する
    find(queueItemId: number): Promise<Array<any>> {
      return getData(
        this.parent.config,
        this.parent.accessToken,
        `/odata/QueueItems(${queueItemId})`,
      )
    }

    create(queue: any): Promise<any> {
      return postData(
        this.parent.config,
        this.parent.accessToken,
        '/odata/Queues/UiPathODataSvc.AddQueueItem',
        queue,
      )
    }

    // PK指定で、削除済みにする。
    delete(queueItemId: number): Promise<any> {
      return deleteData(
        this.parent.config,
        this.parent.accessToken,
        `/odata/QueueItems(${queueItemId})`,
      )
    }
  })(this)

  queueOperation: QueueCrudService = new (class extends QueueCrudService {
    constructor(parent_: OrchestratorApi) {
      super(parent_)
    }
    getQueueAndStartTransaction(queueName: string): Promise<any> {
      return postData(
        this.parent.config,
        this.parent.accessToken,
        '/odata/Queues/UiPathODataSvc.StartTransaction',
        {
          'transactionData': {
            'Name': queueName,
            'RobotIdentifier': this.parent.accessToken
          }
        },
      )
    }
    setTransactionResult(queueItemId: number, statusObj: any): Promise<void> {
      return postData(
        this.parent.config,
        this.parent.accessToken,
        `/odata/Queues(${queueItemId})/UiPathODataSvc.SetTransactionResult`,
        statusObj,
      )
    }
  })(this)

  // ロボットグループ
  // パッケージ
  // ジョブ
  // ロール
  // キュー
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

      // ライセンスを取得する
      const license: any = await api.license.find()
      console.log(license)

      // Userを取得する
      instances = await api.user.findAll()
      for (const instance of instances) {
        const userId: number = instance.Id
        const user = await api.user.find(userId)
        console.log(user)
      }
      // Processesを取得する
      instances = await api.process.findAll()
      for (const instance of instances) {
        console.log(instance)
      }

      // Schedulesを取得する
      instances = await api.schedule.findAll()
      for (const instance of instances) {
        console.log(instance)
      }

      instances = await api.getArray('/odata/Folders')
      for (const instance of instances) {
        console.log(instance)
      }

      instances = await api.getArray('/odata/Users')
      for (const instance of instances) {
        console.log(instance)
      }

      instances = await api.queueItem.findAll()
      for (const instance of instances) {
        console.log(instance)
      }
      console.log(instances.length)

      const queueItemId = instances[0].Id
      const result = await api.queueItem.find(queueItemId)
      console.log(result)

      let queueDef = await api.queueDefinition.findByName('QueueTest')
      // console.table(queueDef)

      queueDef = await api.queueDefinition.find(1)
      // console.table(queueDef)

    } catch (error) {
      console.log(error)
    }
  }

  main()
}
