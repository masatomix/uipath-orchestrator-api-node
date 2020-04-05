import { IOrchestratorApi } from '../IOrchestratorApi'
import { BaseCrudService } from '..'
import { getArray, deleteData, uploadData, downloadData } from '../utils'
import path from 'path'
import { IProcessCrudService } from '../Interfaces'

export class LibraryCrudService extends BaseCrudService implements IProcessCrudService {
  constructor(parent: IOrchestratorApi) {
    super(parent)
  }
  /**
   * アクティブなバージョンに対しての検索。つまりプロセス一覧。
   * @param queries
   * @param asArray
   */
  findAll(queries?: any, asArray: boolean = true): Promise<Array<any>> {
    return getArray(this.parent.config, this.parent.accessToken, '/odata/Libraries', queries, asArray)
  }

  uploadPackage(fullPath: string, asArray: boolean = true): Promise<Array<any>> {
    return uploadData(
      this.parent.config,
      this.parent.accessToken,
      '/odata/Libraries/UiPath.Server.Configuration.OData.UploadPackage()',
      fullPath,
      asArray,
    )
  }

  /**
   * 画面上の名前を指定して、非アクティブなモノもふくめて検索する。
   * @param packageId
   * @param asArray
   */
  findPackage(packageId: string, asArray: boolean = true): Promise<Array<any>> {
    return getArray(
      this.parent.config,
      this.parent.accessToken,
      `/odata/Libraries/UiPath.Server.Configuration.OData.GetVersions(packageId='${packageId}')`,
      {},
      asArray,
    )
  }

  deletePackage(packageId: string, version?: string): Promise<any> {
    if (version) {
      return deleteData(this.parent.config, this.parent.accessToken, `/odata/Libraries('${packageId}:${version}')`)
    }
    return deleteData(this.parent.config, this.parent.accessToken, `/odata/Libraries('${packageId}')`)
  }

  /**
   *
   * @param key Sample:1.0.2 など、[packageId:version]
   */
  downloadPackage(id: string, version: string): Promise<any> {
    return downloadData(
      this.parent.config,
      this.parent.accessToken,
      `/odata/Libraries/UiPath.Server.Configuration.OData.DownloadPackage(key='${id}:${version}')`,
      id,
      version,
    )
  }
  save2Excel(
    instances: any[],
    outputFullPath: string,
    templateFullPath: string = path.join(__dirname, 'templates', 'templateLibraries.xlsx'),
    sheetName = 'Sheet1',
    applyStyles?: (instances: any[], workbook: any, sheetName: string) => void,
  ): Promise<string> {
    return super.save2Excel(instances, outputFullPath, templateFullPath, sheetName, applyStyles)
  }
}
