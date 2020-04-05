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
  ): Promise<string>
  // upload(inputFullPath: string, sheetName?: string, allProperty?: boolean): Promise<any[]>
}

export interface IRobotCrudService extends ICrudService {
  findByRobotName(name: string): Promise<any>
  upload(inputFullPath: string, sheetName?: string, allProperty?: boolean): Promise<any[]>
}

export interface IUserCrudService extends ICrudService {
  findByUserName(userName: string): Promise<any>
  upload(inputFullPath: string, sheetName?: string, allProperty?: boolean): Promise<any>
}

export interface ITenantCrudService extends ICrudService {
  findByName(name: string): Promise<any>
}

export interface IHostLicenseCrudService extends ICrudService {
  // findByName(name: string): Promise<any>
}
export interface IEnvironmentCrudService extends ICrudService {
  // findByName(name: string): Promise<any>
}

export interface IAssetCrudService extends ICrudService {
  upload(inputFullPath: string, sheetName?: string, allProperty?: boolean): Promise<any>
  uploadPerRobot(
    inputFullPath: string,
    perRobotInputFullPath: string,
    sheetName?: string,
    perRobotSheetName?: string,
    allProperty?: boolean,
  ): Promise<any>

  findAllEx: (obj?: any, asArray?: boolean) => Promise<Array<any>>
}
export interface IRoleCrudService extends ICrudService {
  findDetail(...keys: string[]): (...methods: ('' | 'View' | 'Edit' | 'Create' | 'Delete')[]) => Promise<Array<any>>
}
export interface IMachineCrudService extends ICrudService {
  findByMachineName(machineName: string): Promise<any>
  upload(inputFullPath: string, sheetName?: string, allProperty?: boolean): Promise<any[]>
}
export interface IReleaseCrudService extends ICrudService {
  findByProcessKey(processKey: string): Promise<any>
}
export interface IProcessCrudService extends ICrudService {
  uploadPackage(fullPath: string, asArray?: boolean): Promise<Array<any>>

  findPackage(processId: string, asArray?: boolean): Promise<Array<any>>

  deletePackage(processId: string, version?: string): Promise<any>

  downloadPackage(id: string, version: string): Promise<any>
}
export interface IJobCrudService extends ICrudService {
  findAllEx: (obj?: any, asArray?: boolean) => Promise<Array<any>>
  startJobs(processKey: string, robotNames: string[], jobsCount?: number): Promise<any>

  stopJob(jobId: number, force?: boolean): Promise<any>
}
export interface IQueueDefinitionCrudService extends ICrudService {
  findByName(name: string): Promise<any>
}

export interface IQueueItemCrudService extends ICrudService {
  // findByName(name: string): Promise<any>
}

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
  findByKeyFromArray(apiResults: any[]): (...keys: string[]) => Array<any>
  readSettingsFromFile(fullPath: string, sheetName?: string): Promise<any[]>
  getWebSettings(): Promise<Array<any>>
}

export interface IUtilService {
  excelDownload(outputFullDir: string): Promise<string[]>
  excelDownloadForHost(outputFullDir: string): Promise<string[]>

  /**
   * 指定したパスにあるExcelファイルを読み込んで、console.table を使ってコンソールにダンプします。
   * @param fullPaths
   */
  excel2Console(...fullPaths: Array<string>): Promise<void>
}
