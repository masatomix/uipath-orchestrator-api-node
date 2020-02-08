import request from 'request'
import logger from './logger'
import { getData, getArray, putData } from './utils'

interface IOrchestratorApi {
  authenticate: () => Promise<any>
  license: ICrudService
  robot: ICrudService
  user: ICrudService
  machine: ICrudService
  process: ICrudService
  schedule: ICrudService
}

interface ICrudService {
  findAll: () => Promise<Array<any>>
  find: (obj?: any) => Promise<any>
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
  findAll(): Promise<Array<any>> {
    throw Error('Not implemented yet.')
  }
  find(id: number): Promise<any> {
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

/**
 * OrchestratorのAPIのWrapperクラス
 * (Mainのクラスです)
 */
class OrchestratorApi implements IOrchestratorApi {
  private config: any
  private accessToken: string = ''

  constructor(config_: any) {
    this.config = config_
  }

  /**
   * Orchestrator API の認証システムに対して、認証を実施しアクセストークンを取得する。
   */
  authenticate(): Promise<any> {
    const servername = this.config.serverinfo.servername
    logger.main.info(this.config.userinfo.tenancyName)
    logger.main.info(this.config.userinfo.usernameOrEmailAddress)
    logger.main.info(this.config.userinfo.password)
    logger.main.info(servername)

    // Enterprise版かCommunity版かで認証処理が異なるので、設定ファイルによって振り分ける。
    let promise: Promise<any>

    if (!this.config.serverinfo.client_id) {
      logger.main.info('Enterprise版として処理開始')
      const auth_options = {
        uri: servername + '/api/Account/Authenticate',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        form: this.config.userinfo,
      }

      const me = this
      promise = new Promise((resolve, reject) => {
        request.post(auth_options, function(err, response, body) {
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
          logger.main.info(access_token)
          resolve(obj)
        })
      })
    } else {
      logger.main.info('Community版として処理開始')
      const form = Object.assign(this.config.serverinfo, {
        grant_type: 'refresh_token',
      })
      const auth_options = {
        uri: 'https://account.uipath.com/oauth/token',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        form: form,
      }

      const me = this
      promise = new Promise((resolve, reject) => {
        request.post(auth_options, function(err, response, body) {
          if (err) {
            reject(err)
            return
          }
          const obj = JSON.parse(body)
          logger.main.info(obj)

          const access_token = obj.access_token
          me.accessToken = access_token
          logger.main.info(access_token)
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
    findAll(): Promise<Array<any>> {
      return getArray(this.parent.config, this.parent.accessToken, '/odata/Robots')
    }

    find(id: number): Promise<any> {
      return getData(this.parent.config, this.parent.accessToken, `/odata/Robots(${id})`)
    }

    update(robot: any): Promise<void> {
      return putData(
        this.parent.config,
        this.parent.accessToken,
        `/odata/Robots(${robot.Id})`,
        robot,
      )
    }
  })(this)

  user: ICrudService = new (class extends BaseCrudService {
    constructor(parent_: OrchestratorApi) {
      super(parent_)
    }
    findAll(): Promise<Array<any>> {
      return getArray(this.parent.config, this.parent.accessToken, '/odata/Users')
    }

    find(id: number): Promise<any> {
      return getData(this.parent.config, this.parent.accessToken, `/odata/Users(${id})`)
    }
  })(this)

  machine: ICrudService = new (class extends BaseCrudService {
    constructor(parent_: OrchestratorApi) {
      super(parent_)
    }
    findAll(): Promise<Array<any>> {
      return getArray(this.parent.config, this.parent.accessToken, '/odata/Machines')
    }
  })(this)

  process: ICrudService = new (class extends BaseCrudService {
    constructor(parent_: OrchestratorApi) {
      super(parent_)
    }
    findAll(): Promise<Array<any>> {
      return getArray(this.parent.config, this.parent.accessToken, '/odata/Releases')
    }
  })(this)

  schedule: ICrudService = new (class extends BaseCrudService {
    constructor(parent_: OrchestratorApi) {
      super(parent_)
    }
    findAll(): Promise<Array<any>> {
      return getArray(this.parent.config, this.parent.accessToken, '/odata/ProcessSchedules')
    }
  })(this)
}

export = OrchestratorApi

// 以下、確認のためのドライバ
import config from 'config'

if (!module.parent) {
  async function main() {
    const api = new OrchestratorApi(config)
    // まずは認証
    await api.authenticate()

    // ライセンスを取得する
    const license: any = await api.license.find()
    console.log(license)

    let instances: any[] = []

    // // ロボットを取得する
    // instances = await api.robot.findAll()
    // for (const instance of instances) {
    //   console.log(instance)
    //   // const robotId: number = instance.Id
    //   // const robot = await api.robot.find(robotId)
    //   // console.log(robot)
    // }

    const robot = await api.robot.find(8)
    robot.Description = 'test3'

    await api.robot.update(robot)

    // // Userを取得する
    // instances = await api.user.findAll()
    // for (const instance of instances) {
    //   const userId: number = instance.Id
    //   const user = await api.user.find(userId)
    //   console.log(user)
    // }

    // // Machineを取得する
    // instances = await api.machine.findAll()
    // for (const instance of instances) {
    //   console.log(instance)
    // }

    // // Processesを取得する
    // instances = await api.process.findAll()
    // for (const instance of instances) {
    //   console.log(instance)
    // }

    // // Schedulesを取得する
    // instances = await api.schedule.findAll()
    // for (const instance of instances) {
    //   console.log(instance)
    // }
  }

  main()
}
