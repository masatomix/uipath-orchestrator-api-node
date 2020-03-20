import { IOrchestratorApi } from './IOrchestratorApi'
import { BaseCrudService } from '.'
import { getArray, deleteData, uploadData, downloadData } from './utils'
import path from 'path'
import { IProcessCrudService } from './Interfaces'

export class ProcessCrudService extends BaseCrudService implements IProcessCrudService {
  constructor(parent_: IOrchestratorApi) {
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
      '/odata/Processes/UiPath.Server.Configuration.OData.UploadPackage()',
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
  save2Excel(
    instances: any[],
    outputFullPath: string,
    templateFullPath: string = path.join(__dirname, 'templateProcesses.xlsx'),
    sheetName = 'Sheet1',
    applyStyles?: (instances: any[], workbook: any, sheetName: string) => void,
  ): Promise<void> {
    return super.save2Excel(instances, outputFullPath, templateFullPath, sheetName, applyStyles)
  }
}
