import { IOrchestratorApi } from '../IOrchestratorApi'
import { BaseCrudService } from '..'
import { getArray, getData, putData, postData, deleteData } from '../utils'
import path from 'path'
import { IHostLicenseCrudService } from '../Interfaces'

export class HostLicenseCrudService extends BaseCrudService implements IHostLicenseCrudService {
  constructor(parent: IOrchestratorApi) {
    super(parent)
  }

  findAll(queries?: any, asArray: boolean = true): Promise<Array<any>> {
    return getArray(this.parent.config, this.parent.accessToken, '/odata/HostLicenses', queries, asArray)
  }

  find(id: number): Promise<any> {
    return getData(this.parent.config, this.parent.accessToken, `/odata/HostLicenses(${id})`)
  }

  // _findByName(name: string): Promise<Array<any>> {
  //   return getArray(this.parent.config, this.parent.accessToken, '/odata/HostLicenses', {
  //     $filter: `Name eq '${name}'`,
  //   })
  // }

  // async findByName(name: string): Promise<any> {
  //   const defs: any[] = await this._findByName(name)
  //   return defs[0]
  // }

  create(hostLicense: any): Promise<any> {
    return postData(this.parent.config, this.parent.accessToken, '/odata/HostLicenses', hostLicense)
  }

  update(hostLicense: any): Promise<any> {
    return putData(this.parent.config, this.parent.accessToken, `/odata/HostLicenses(${hostLicense.Id})`, hostLicense)
  }

  delete(id: number): Promise<any> {
    return deleteData(this.parent.config, this.parent.accessToken, `/odata/HostLicenses(${id})`)
  }

  save2Excel(
    instances: any[],
    outputFullPath: string,
    templateFullPath: string = path.join(__dirname, 'templates', 'templateHostLicenses.xlsx'),
    sheetName = 'Sheet1',
    applyStyles?: (instances: any[], workbook: any, sheetName: string) => void,
  ): Promise<string> {
    return super.save2Excel(instances, outputFullPath, templateFullPath, sheetName, applyStyles)
  }
}
