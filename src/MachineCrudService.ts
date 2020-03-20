import { IOrchestratorApi } from './IOrchestratorApi'
import { BaseCrudService } from '.'
import { getArray, getData, putData, postData, deleteData } from './utils'
import path from 'path'
import { IMachineCrudService } from './Interfaces'

export class MachineCrudService extends BaseCrudService implements IMachineCrudService {
  constructor(parent_: IOrchestratorApi) {
    super(parent_)
  }
  findAll(queries?: any, asArray: boolean = true): Promise<Array<any>> {
    return getArray(this.parent.config, this.parent.accessToken, '/odata/Machines', queries, asArray)
  }

  find(id: number): Promise<any> {
    return getData(this.parent.config, this.parent.accessToken, `/odata/Machines(${id})`)
  }

  _findByMachineName(machineName: string): Promise<Array<any>> {
    return this.findAll({ $filter: `Name eq '${machineName}'` })
  }

  async findByMachineName(machineName: string): Promise<any> {
    const machines: any[] = await this._findByMachineName(machineName)
    return machines[0]
  }

  create(machine: any): Promise<any> {
    return postData(this.parent.config, this.parent.accessToken, '/odata/Machines', machine)
  }

  update(machine: any): Promise<void> {
    return putData(this.parent.config, this.parent.accessToken, `/odata/Machines(${machine.Id})`, machine)
  }
  delete(id: number): Promise<any> {
    return deleteData(this.parent.config, this.parent.accessToken, `/odata/Machines(${id})`)
  }
  save2Excel(
    instances: any[],
    outputFullPath: string,
    templateFullPath: string = path.join(__dirname, 'templateMachines.xlsx'),
    sheetName = 'Sheet1',
    applyStyles?: (instances: any[], workbook: any, sheetName: string) => void,
  ): Promise<void> {
    return super.save2Excel(instances, outputFullPath, templateFullPath, sheetName, applyStyles)
  }
}
