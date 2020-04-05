import { IOrchestratorApi } from '../IOrchestratorApi'
import { BaseCrudService } from '..'
import { getArray, getData, putData, postData, deleteData, xlsx2json } from '../utils'
import path from 'path'
import { ITenantCrudService } from '../Interfaces'

export class TenantCrudService extends BaseCrudService implements ITenantCrudService {
  constructor(parent: IOrchestratorApi) {
    super(parent)
  }

  findAll(queries?: any, asArray: boolean = true): Promise<Array<any>> {
    return getArray(this.parent.config, this.parent.accessToken, '/odata/Tenants', queries, asArray)
  }

  find(id: number): Promise<any> {
    return getData(this.parent.config, this.parent.accessToken, `/odata/Tenants(${id})`)
  }

  _findByName(name: string): Promise<Array<any>> {
    return getArray(this.parent.config, this.parent.accessToken, '/odata/Tenants', {
      $filter: `Name eq '${name}'`,
    })
  }

  async findByName(name: string): Promise<any> {
    const defs: any[] = await this._findByName(name)
    return defs[0]
  }

  // create(tenant: any): Promise<any> {
  //   return postData(this.parent.config, this.parent.accessToken, '/odata/Tenants', tenant)
  // }

  // update(tenant: any): Promise<any> {
  //   return putData(this.parent.config, this.parent.accessToken, `/odata/Tenants(${tenant.Id})`, tenant)
  // }

  // delete(id: number): Promise<any> {
  //   return deleteData(this.parent.config, this.parent.accessToken, `/odata/Tenants(${id})`)
  // }

  save2Excel(
    instances: any[],
    outputFullPath: string,
    templateFullPath: string = path.join(__dirname, 'templates', 'templateTenants.xlsx'),
    sheetName = 'Sheet1',
    applyStyles?: (instances: any[], workbook: any, sheetName: string) => void,
  ): Promise<string> {
    return super.save2Excel(instances, outputFullPath, templateFullPath, sheetName, applyStyles)
  }
}
