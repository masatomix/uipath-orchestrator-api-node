import { BaseCrudService, IOrchestratorApi, LicenseNamedUserDto, LicenseRuntimeDto, } from '..'
import { getArray, getData, putData, postData, deleteData } from '../utils'
import path from 'path'
import { ILicenseCrudService } from '../Interfaces'

export class LicenseCrudService extends BaseCrudService implements ILicenseCrudService {
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

  getRuntimeLicenses(robotType: string, queries?: any, asArray: boolean = true): Promise<LicenseRuntimeDto[]> {
    return getArray(
      this.parent.config,
      this.parent.accessToken,
      `/odata/LicensesRuntime/UiPath.Server.Configuration.OData.GetLicensesRuntime(robotType='${robotType}')`,
      queries,
      asArray,
    )
  }
  getNamedUserLicenses(robotType: string, queries?: any, asArray: boolean = true): Promise<LicenseNamedUserDto[]> {
    return getArray(
      this.parent.config,
      this.parent.accessToken,
      `/odata/LicensesNamedUser/UiPath.Server.Configuration.OData.GetLicensesNamedUser(robotType='${robotType}')`,
      queries,
      asArray,
    )
  }

  // findAll(queries?: any, asArray: boolean = true): Promise<Array<any>> {
  //   return getArray(this.parent.config, this.parent.accessToken, '/odata/HostLicenses', queries, asArray)
  // }

  // find(id: number): Promise<any> {
  //   return getData(this.parent.config, this.parent.accessToken, `/odata/HostLicenses(${id})`)
  // }

  // _findByName(name: string): Promise<Array<any>> {
  //   return getArray(this.parent.config, this.parent.accessToken, '/odata/HostLicenses', {
  //     $filter: `Name eq '${name}'`,
  //   })
  // }

  // async findByName(name: string): Promise<any> {
  //   const defs: any[] = await this._findByName(name)
  //   return defs[0]
  // }

  // create(hostLicense: any): Promise<any> {
  //   return postData(this.parent.config, this.parent.accessToken, '/odata/HostLicenses', hostLicense)
  // }

  // update(hostLicense: any): Promise<any> {
  //   return putData(this.parent.config, this.parent.accessToken, `/odata/HostLicenses(${hostLicense.Id})`, hostLicense)
  // }

  // delete(id: number): Promise<any> {
  //   return deleteData(this.parent.config, this.parent.accessToken, `/odata/HostLicenses(${id})`)
  // }

  // save2Excel(
  //   instances: any[],
  //   outputFullPath: string,
  //   templateFullPath: string = path.join(__dirname, 'templates', 'templateHostLicenses.xlsx'),
  //   sheetName = 'Sheet1',
  //   applyStyles?: (instances: any[], workbook: any, sheetName: string) => void,
  // ): Promise<string> {
  //   return super.save2Excel(instances, outputFullPath, templateFullPath, sheetName, applyStyles)
  // }
}
