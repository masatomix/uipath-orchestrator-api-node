## サンプルを実行してみる

作成中

## Orchestrator API との対応表

queueDefinition

- findAll (queries?: any)
    - GET ``/odata/QueueDefinitions``
- find (id: number)
    - GET ``/odata/QueueDefinitions(${id})``
- findByName (name: string)
    - GET ``/odata/QueueDefinitions`` に `` $filter: `Name eq '${name}'` ``
- create (queueDefinition: any)
    - POST ``/odata/QueueDefinitions``
- update (queueDefinition: any)
    - PUT ``/odata/QueueDefinitions(${queueDefinition.Id})``
- delete (id: number)
    - DELETE ``/odata/QueueDefinitions(${id})``

queueItem

- findAll (queries?: any)
    - GET ``/odata/QueueItems``
- find (queueItemId: number)
    - GET ``/odata/QueueItems(${queueItemId})``
- create (queue: any)
    - POST ``/odata/Queues/UiPathODataSvc.AddQueueItem``
- delete (queueItemId: number)
    - DELETE ``/odata/QueueItems(${queueItemId})``

queueOperation

- getQueueAndStartTransaction(queueName: string)
    - POST ``/odata/Queues/UiPathODataSvc.StartTransaction``
- setTransactionResult(queueItemId: number, statusObj: any)
    - POST ``/odata/Queues(${queueItemId})/UiPathODataSvc.SetTransactionResult``