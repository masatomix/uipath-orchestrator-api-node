import { BaseCrudService, IOrchestratorApi } from '..'
import { getArray, getData, putData, postData, deleteData } from '../utils'
import path from 'path'
import { IEnvironmentCrudService } from '../Interfaces'

export class EnvironmentCrudService extends BaseCrudService implements IEnvironmentCrudService {
  constructor(parent: IOrchestratorApi) {
    super(parent)
  }

  findAll(queries?: any, asArray: boolean = true): Promise<Array<any>> {
    return getArray(this.parent.config, this.parent.accessToken, '/odata/Environments', queries, asArray)
  }

  find(id: number): Promise<any> {
    return getData(this.parent.config, this.parent.accessToken, `/odata/Environments(${id})`)
  }

  // _findByName(name: string): Promise<Array<any>> {
  //   return getArray(this.parent.config, this.parent.accessToken, '/odata/Environments', {
  //     $filter: `Name eq '${name}'`,
  //   })
  // }

  // async findByName(name: string): Promise<any> {
  //   const defs: any[] = await this._findByName(name)
  //   return defs[0]
  // }

  create(environment: any): Promise<any> {
    return postData(this.parent.config, this.parent.accessToken, '/odata/Environments', environment)
  }

  update(environment: any): Promise<any> {
    return putData(this.parent.config, this.parent.accessToken, `/odata/Environments(${environment.Id})`, environment)
  }

  delete(id: number): Promise<any> {
    return deleteData(this.parent.config, this.parent.accessToken, `/odata/Environments(${id})`)
  }

  save2Excel(
    instances: any[],
    outputFullPath: string,
    templateFullPath: string = path.join(__dirname, 'templates', 'templateEnvironments.xlsx'),
    sheetName = 'Sheet1',
    applyStyles?: (instances: any[], workbook: any, sheetName: string) => void,
  ): Promise<string> {
    return super.save2Excel(instances, outputFullPath, templateFullPath, sheetName, applyStyles)
  }
}
