import { IOrchestratorApi } from './IOrchestratorApi'
import { BaseCrudService } from '.'
import { internalSave2Excel } from './utils'
import { IUtilService } from './Interfaces'

export class UtilService extends BaseCrudService implements IUtilService {
  constructor(parent_: IOrchestratorApi) {
    super(parent_)
  }
  save2Excel(
    instances: any[],
    outputFullPath: string,
    templateFullPath: string = '',
    sheetName = 'Sheet1',
    applyStyles?: (instances: any[], workbook: any, sheetName: string) => void,
  ): Promise<void> {
    return internalSave2Excel(instances, outputFullPath, templateFullPath, sheetName, applyStyles)
  }
}
