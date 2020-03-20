export interface ICrudService {
  findAll: (obj?: any, asArray?: boolean) => Promise<Array<any>>
  find: (obj?: any) => Promise<any> // licenseなどはパラメタ不要だったりするのでOption
  create: (obj: any) => Promise<any>
  update: (obj: any) => Promise<void>
  delete: (obj: any) => Promise<any>
  save2Excel(
    instances: any[],
    outputFullPath: string,
    templateFullPath?: string,
    sheetName?: string,
    applyStyles?: (instances: any[], workbook: any, sheetName: string) => void,
  ): Promise<void>
}

export interface IRobotCrudService extends ICrudService {
  findByRobotName(element: string): any
}
export interface IUtilService extends ICrudService {}
export interface IUserCrudService extends ICrudService {}
export interface IRoleCrudService extends ICrudService {
  findDetail(...keys: string[]): (...methods: ('' | 'View' | 'Edit' | 'Create' | 'Delete')[]) => Promise<Array<any>>
}
export interface IMachineCrudService extends ICrudService {
  findByMachineName(machineName: string): any
}
export interface IReleaseCrudService extends ICrudService {
  findByProcessKey(processKey: string): any
}
export interface IProcessCrudService extends ICrudService {
  uploadPackage(fullPath: string, asArray?: boolean): Promise<Array<any>>

  /**
   * 画面上の名前を指定して、非アクティブなモノもふくめて検索する。
   * @param processId
   * @param asArray
   */
  findPackage(processId: string, asArray?: boolean): Promise<Array<any>>

  deletePackage(processId: string, version?: string): Promise<any>

  /**
   *
   * @param key Sample:1.0.2 など、[processId:version]
   */
  downloadPackage(id: string, version: string): Promise<any>
}
export interface IJobCrudService extends ICrudService {
  startJobs(processKey: string, robotNames: string[], jobsCount?: number): Promise<any>

  stopJob(jobId: number, force?: boolean): Promise<any>
}
export interface IQueueDefinitionCrudService extends ICrudService {}

export interface IQueueCrudService extends ICrudService {
  getQueueAndStartTransaction(queueName: string): Promise<any>
  setTransactionResult(queueItemId: number, statusObj: any): Promise<void>
}
// asset: ICrudService
export interface ILogCrudService extends ICrudService {
  findByFilter(
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
    asArray?: boolean,
  ): Promise<Array<any>>

  findStartEndLogs(
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
  ): Promise<Array<any>>
}
export interface IAuditLogCrudService extends ICrudService {
  findByFilter(
    filters: {
      action?: string
      userName?: string
      component?: string
      methodName?: string
      from?: Date
      to?: Date
    },
    obj?: any,
    asArray?: boolean,
  ): Promise<Array<any>>
}
export interface ISettingCrudService extends ICrudService {
  findByKey(queries?: any): (...keys: string[]) => Promise<Array<any>>

  readSettingsFromFile(fullPath: string, sheetName?: string): Promise<any[]>
}
