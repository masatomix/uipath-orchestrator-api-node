import { IOrchestratorApi } from '../IOrchestratorApi'
import { BaseCrudService } from '..'
import { postData } from '../utils'
import { IQueueCrudService } from '../Interfaces'

export class QueueCrudService extends BaseCrudService implements IQueueCrudService{
  constructor(parent_: IOrchestratorApi) {
    super(parent_)
  }
  getQueueAndStartTransaction(queueName: string): Promise<any> {
    return postData(this.parent.config, this.parent.accessToken, '/odata/Queues/UiPathODataSvc.StartTransaction', {
      transactionData: {
        Name: queueName,
        RobotIdentifier: this.parent.accessToken,
      },
    })
  }
  setTransactionResult(queueItemId: number, statusObj: any): Promise<void> {
    return postData(
      this.parent.config,
      this.parent.accessToken,
      `/odata/Queues(${queueItemId})/UiPathODataSvc.SetTransactionResult`,
      statusObj,
    )
  }
}
