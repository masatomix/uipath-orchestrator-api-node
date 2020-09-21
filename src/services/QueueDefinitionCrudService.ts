import { BaseCrudService, IOrchestratorApi } from '..'
import { getArray, getData, putData, postData, deleteData } from '../utils'
import path from 'path'
import { IQueueDefinitionCrudService } from '../Interfaces'

export class QueueDefinitionCrudService extends BaseCrudService implements IQueueDefinitionCrudService {
  constructor(parent: IOrchestratorApi) {
    super(parent)
  }

  findAll(queries?: any, asArray: boolean = true): Promise<Array<any>> {
    return getArray(this.parent.config, this.parent.accessToken, '/odata/QueueDefinitions', queries, asArray)
  }

  find(id: number): Promise<any> {
    return getData(this.parent.config, this.parent.accessToken, `/odata/QueueDefinitions(${id})`)
  }

  _findByName(name: string): Promise<Array<any>> {
    return getArray(this.parent.config, this.parent.accessToken, '/odata/QueueDefinitions', {
      $filter: `Name eq '${name}'`,
    })
  }

  async findByName(name: string): Promise<any> {
    const defs: any[] = await this._findByName(name)
    return defs[0]
  }

  create(queueDefinition: any): Promise<any> {
    return postData(this.parent.config, this.parent.accessToken, '/odata/QueueDefinitions', queueDefinition)
  }

  update(queueDefinition: any): Promise<any> {
    return putData(
      this.parent.config,
      this.parent.accessToken,
      `/odata/QueueDefinitions(${queueDefinition.Id})`,
      queueDefinition,
    )
  }

  delete(id: number): Promise<any> {
    return deleteData(this.parent.config, this.parent.accessToken, `/odata/QueueDefinitions(${id})`)
  }

  save2Excel(
    instances: any[],
    outputFullPath: string,
    templateFullPath: string = path.join(__dirname, 'templates', 'templateQueueDefinitions.xlsx'),
    sheetName = 'Sheet1',
    applyStyles?: (instances: any[], workbook: any, sheetName: string) => void,
  ): Promise<string> {
    return super.save2Excel(instances, outputFullPath, templateFullPath, sheetName, applyStyles)
  }
}
