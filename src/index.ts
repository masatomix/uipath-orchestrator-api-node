import request, { Response } from 'request'
import { getLogger } from './logger'
import {
  getData,
  getArray,
  putData,
  postData,
  deleteData,
  internalSave2Excel,
  createRobotOption,
  createEnterpriseOption,
  createCommunityOption,
} from './utils'
import {
  ICrudService,
  IRobotCrudService,
  IUserCrudService,
  IRoleCrudService,
  ISettingCrudService,
  IAuditLogCrudService,
  ILogCrudService,
  IMachineCrudService,
  IReleaseCrudService,
  IProcessCrudService,
  IJobCrudService,
  IQueueDefinitionCrudService,
  IQueueCrudService,
  IAssetCrudService,
  IUtilService,
  ITenantCrudService,
  IHostLicenseCrudService,
  IEnvironmentCrudService,
  IQueueItemCrudService,
  IFolderCrudService,
} from './Interfaces'

const logger = getLogger('main')

/**
 * Interfaceのデフォルト実装(全部でOverrideするのはメンドイので)
 */
export class BaseCrudService implements ICrudService {
  constructor(public parent: IOrchestratorApi) {}
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
  save2Excel(
    instances: any[],
    outputFullPath: string,
    templateFullPath: string = '',
    sheetName: string = 'Sheet1',
    applyStyles?: (instances: any[], workbook: any, sheetName: string) => void,
  ): Promise<string> {
    return internalSave2Excel(instances, outputFullPath, templateFullPath, sheetName, applyStyles)
  }
}

/**
 * OrchestratorのAPIのWrapperクラス
 * (Mainのクラスです)
 */
export class OrchestratorApi implements IOrchestratorApi {
  isEnterprise: boolean = false
  isCommunity: boolean = false
  isRobot: boolean = false
  accessToken: string = ''

  get organizationUnitId() {
    return this.config.organizationUnitIdFromAPI
  }

  set organizationUnitId(organizationUnitId: number) {
    logger.info(`Folder Idを[${organizationUnitId}]に切り替えます`)
    this.config = Object.assign({}, this.config, { organizationUnitIdFromAPI: organizationUnitId })
  }

  constructor(public config: any) {
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
    logger.debug(this.config.serverinfo.servername)

    // Enterprise版かCommunity版かで認証処理が異なるので、設定ファイルによって振り分ける。
    let promise: Promise<any>

    if (this.isRobot) {
      logger.info('Robotモードとして処理開始')
      logger.debug(this.config.robotInfo.machineKey)
      logger.debug(this.config.robotInfo.machineName)
      logger.debug(this.config.robotInfo.userName)

      const auth_options = createRobotOption(this.config)
      promise = new Promise((resolve, reject) => {
        request.post(auth_options, (err: any, _response: Response, body: any): void => {
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
          this.accessToken = access_token
          logger.debug(access_token)
          resolve(obj)
        })
      })
    } else if (this.isEnterprise) {
      logger.info('Enterprise版として処理開始')
      logger.debug(this.config.userinfo.tenancyName)
      logger.debug(this.config.userinfo.usernameOrEmailAddress)
      logger.debug(this.config.userinfo.password)

      const auth_options = createEnterpriseOption(this.config)

      promise = new Promise((resolve, reject) => {
        request.post(auth_options, (err: any, _response: Response, body: any): void => {
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
          this.accessToken = access_token
          logger.debug(access_token)
          resolve(obj)
        })
      })
    } else {
      logger.info('Community版として処理開始')
      const auth_options = createCommunityOption(this.config)

      promise = new Promise((resolve, reject) => {
        request.post(auth_options, (err: any, _response: Response, body: any): void => {
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
          this.accessToken = access_token
          logger.debug(access_token)
          resolve(obj)
        })
      })
    }
    return promise
  }

  license: ICrudService = new (class extends BaseCrudService {
    constructor(parent: IOrchestratorApi) {
      super(parent)
    }
    find(): Promise<any> {
      return getData(
        this.parent.config,
        this.parent.accessToken,
        '/odata/Settings/UiPath.Server.Configuration.OData.GetLicense',
      )
    }
  })(this)

  robot: IRobotCrudService = new RobotCrudService(this)

  user: IUserCrudService = new UserCrudService(this)

  role: IRoleCrudService = new RoleCrudService(this)

  machine: IMachineCrudService = new MachineCrudService(this)

  release: IReleaseCrudService = new ReleaseCrudService(this)

  process: IProcessCrudService = new ProcessCrudService(this)

  library: IProcessCrudService = new LibraryCrudService(this)

  job: IJobCrudService = new JobCrudService(this)

  schedule: ICrudService = new (class extends BaseCrudService {
    constructor(parent: IOrchestratorApi) {
      super(parent)
    }
    findAll(queries?: any, asArray: boolean = true): Promise<Array<any>> {
      return getArray(this.parent.config, this.parent.accessToken, '/odata/ProcessSchedules', queries, asArray)
    }
  })(this)

  folder: IFolderCrudService = new FolderCrudService(this)
  tenant: ITenantCrudService = new TenantCrudService(this)
  hostLicense: IHostLicenseCrudService = new HostLicenseCrudService(this)
  environment: IEnvironmentCrudService = new EnvironmentCrudService(this)
  queueDefinition: IQueueDefinitionCrudService = new QueueDefinitionCrudService(this)
  queueItem: IQueueItemCrudService = new QueueItemCrudService(this)
  queueOperation: IQueueCrudService = new QueueCrudService(this)
  log: ILogCrudService = new LogCrudService(this)
  auditLog: IAuditLogCrudService = new AuditLogCrudService(this)
  setting: ISettingCrudService = new SettingCrudService(this)
  asset: IAssetCrudService = new AssetCrudService(this)
  util: IUtilService = new UtilService(this)

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

export default OrchestratorApi

import { IOrchestratorApi } from './IOrchestratorApi'
import { RobotCrudService } from './services/RobotCrudService'
import { RoleCrudService } from './services/RoleCrudService'
import { MachineCrudService } from './services/MachineCrudService'
import { ReleaseCrudService } from './services/ReleaseCrudService'
import { ProcessCrudService } from './services/ProcessCrudService'
import { JobCrudService } from './services/JobCrudService'
import { QueueDefinitionCrudService } from './services/QueueDefinitionCrudService'
import { LogCrudService } from './services/LogCrudService'
import { AuditLogCrudService } from './services/AuditLogCrudService'
import { SettingCrudService } from './services/SettingCrudService'
import { QueueCrudService } from './services/QueueCrudService'
import { UserCrudService } from './services/UserCrudService'
import { AssetCrudService } from './services/AssetCrudService'
import { UtilService } from './services/UtilService'
import { TenantCrudService } from './services/TenantCrudService'
import { HostLicenseCrudService } from './services/HostLicenseCrudService'
import { EnvironmentCrudService } from './services/EnvironmentCrudService'
import { QueueItemCrudService } from './services/QueueItemCrudService'
import { LibraryCrudService } from './services/LibraryCrudService'
import { FolderCrudService } from './services/FolderCrudService'

// const getConfig = () => {
//   // 設定ファイルから読むパタン
//   return config

//   // Own Codingするパタン
//   // return {
//   //   userinfo: {
//   //     tenancyName: 'default',
//   //     usernameOrEmailAddress: 'aaa',
//   //     password: 'bbb',
//   //   },
//   //   serverinfo: {
//   //     servername: 'https://platform.uipath.com/',
//   //   },
//   // }
// }

// if (!module.parent) {
//   async function main() {
//     const api: IOrchestratorApi = new OrchestratorApi(getConfig())

//     try {
//       // まずは認証
//       await api.authenticate()

//       let instances: any[] = []

//       // instances = await api.asset.findAll({ $expand: 'RobotValues' })
//       instances = await api.asset.findAllEx()
//       console.table(instances)
//       // console.log(instances[0])
//       // api.asset.save2Excel(instances, 'assets.xlsx')
//       // await api.asset.upload('assets.xlsx')
//       await api.asset.uploadPerRobot('assets.xlsx', 'perRobot_assets.xlsx')

//       // instances = await api.queueItem.findAll()
//       // for (const instance of instances) {
//       //   console.log(instance)
//       // }
//       // console.log(instances.length)

//       // const queueItemId = instances[0].Id
//       // const result = await api.queueItem.find(queueItemId)
//       // console.log(result)

//       // let queueDef = await api.queueDefinition.findByName('QueueTest')
//       // // console.table(queueDef)

//       // queueDef = await api.queueDefinition.find(1)
//       // console.table(queueDef)
//     } catch (error) {
//       console.log(error)
//     }
//   }

//   main()
// }
