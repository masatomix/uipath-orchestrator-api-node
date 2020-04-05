import { IOrchestratorApi } from '../IOrchestratorApi'
import { BaseCrudService } from '..'
import { getArray, getData, putData, postData, deleteData } from '../utils'
import path from 'path'
import { IQueueItemCrudService } from '../Interfaces'

export class QueueItemCrudService extends BaseCrudService implements IQueueItemCrudService {
  constructor(parent: IOrchestratorApi) {
    super(parent)
  }

  // QueueItemを一覧する
  findAll(queries?: any, asArray: boolean = true): Promise<Array<any>> {
    return getArray(this.parent.config, this.parent.accessToken, '/odata/QueueItems', queries, asArray)
  }

  // PK指定で取得する
  find(queueItemId: number): Promise<any> {
    return getData(this.parent.config, this.parent.accessToken, `/odata/QueueItems(${queueItemId})`)
  }

  create(queue: any): Promise<any> {
    return postData(this.parent.config, this.parent.accessToken, '/odata/Queues/UiPathODataSvc.AddQueueItem', queue)
  }

  // updateは存在しない
  // PK指定で、削除済みにする。
  delete(queueItemId: number): Promise<any> {
    return deleteData(this.parent.config, this.parent.accessToken, `/odata/QueueItems(${queueItemId})`)
  }

  save2Excel(
    instances: any[],
    outputFullPath: string,
    templateFullPath: string = path.join(__dirname, 'templates', 'templateQueueItem.xlsx'),
    sheetName = 'Sheet1',
    applyStyles?: (instances: any[], workbook: any, sheetName: string) => void,
  ): Promise<string> {
    return super.save2Excel(instances, outputFullPath, templateFullPath, sheetName, applyStyles)
  }
}
