import {
  ICrudService,
  IRobotCrudService,
  IUserCrudService,
  IRoleCrudService,
  IReleaseCrudService,
  IMachineCrudService,
  IProcessCrudService,
  IJobCrudService,
  IQueueDefinitionCrudService,
  IQueueCrudService,
  ILogCrudService,
  IAuditLogCrudService,
  ISettingCrudService,
  IAssetCrudService,
  IUtilService,
  ITenantCrudService,
  IHostLicenseCrudService,
  IEnvironmentCrudService,
  IQueueItemCrudService,
} from './Interfaces'

/**
 * Orchestrator API Wrapper
 * cf. https://docs.uipath.com/orchestrator/v2019/reference
 */
export interface IOrchestratorApi {
  authenticate: () => Promise<any>
  license: ICrudService
  robot: IRobotCrudService
  user: IUserCrudService
  role: IRoleCrudService
  machine: IMachineCrudService
  release: IReleaseCrudService
  process: IProcessCrudService
  library: IProcessCrudService
  job: IJobCrudService
  schedule: ICrudService
  queueDefinition: IQueueDefinitionCrudService
  queueItem: IQueueItemCrudService
  queueOperation: IQueueCrudService
  log: ILogCrudService
  auditLog: IAuditLogCrudService
  setting: ISettingCrudService
  asset: IAssetCrudService
  util: IUtilService
  tenant: ITenantCrudService
  hostLicense: IHostLicenseCrudService
  environment: IEnvironmentCrudService
  // 以下、汎用的なメソッド
  getArray: (apiPath: string, queries?: any) => Promise<Array<any>>
  getData: (apiPath: string) => Promise<any>
  postData: (apiPath: string, obj: any) => Promise<any>
  putData: (apiPath: string, obj: any) => Promise<void>
  deleteData: (apiPath: string) => Promise<any>

  isEnterprise: boolean
  isCommunity: boolean
  isRobot: boolean
  config: any
  accessToken: any
}
