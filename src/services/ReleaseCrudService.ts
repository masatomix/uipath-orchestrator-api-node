import { IOrchestratorApi } from '../IOrchestratorApi'
import { BaseCrudService } from '..'
import { getArray } from '../utils'
import path from 'path'
import { IReleaseCrudService } from '../Interfaces'

export class ReleaseCrudService extends BaseCrudService implements IReleaseCrudService {
  constructor(parent: IOrchestratorApi) {
    super(parent)
  }
  findAll(queries?: any, asArray: boolean = true): Promise<Array<any>> {
    return getArray(this.parent.config, this.parent.accessToken, '/odata/Releases', queries, asArray)
  }

  _findByProcessName(name: string): Promise<Array<any>> {
    return getArray(this.parent.config, this.parent.accessToken, '/odata/Releases', {
      $filter: `ProcessKey eq '${name}'`,
    })
  }
  async findByProcessKey(processKey: string): Promise<any> {
    // processKey は画面上のプロセスの名前
    const objs: any[] = await this._findByProcessName(processKey)
    return objs[0]
  }

  save2Excel(
    instances: any[],
    outputFullPath: string,
    templateFullPath: string = path.join(__dirname, 'templates', 'templateReleases.xlsx'),
    sheetName = 'Sheet1',
    applyStyles?: (instances: any[], workbook: any, sheetName: string) => void,
  ): Promise<void> {
    return super.save2Excel(instances, outputFullPath, templateFullPath, sheetName, applyStyles)
  }
}
